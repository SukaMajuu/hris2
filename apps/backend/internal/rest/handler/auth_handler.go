package handler

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	authDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/auth"
	authUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"

	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authUseCase                *authUseCase.AuthUseCase
	refreshTokenCookieDuration time.Duration
	rememberMeCookieDuration   time.Duration
}

func NewAuthHandler(authUseCase *authUseCase.AuthUseCase) *AuthHandler {
	cookieDuration := 7 * 24 * time.Hour
	rememberMeDuration := 30 * 24 * time.Hour // 30 days
	return &AuthHandler{
		authUseCase:                authUseCase,
		refreshTokenCookieDuration: cookieDuration,
		rememberMeCookieDuration:   rememberMeDuration,
	}
}

func (h *AuthHandler) setRefreshTokenCookie(c *gin.Context, token string, rememberMe bool) {
	var maxAge int
	if rememberMe {
		maxAge = int(h.rememberMeCookieDuration.Seconds())
	} else {
		maxAge = int(h.refreshTokenCookieDuration.Seconds())
	}

	c.SetCookie(
		"refresh_token",
		token,
		maxAge,
		"/v1/auth",
		"",
		true,
		true,
	)
}

func (h *AuthHandler) clearRefreshTokenCookie(c *gin.Context) {
	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/v1/auth",
		"",
		true,
		true,
	)
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req authDTO.AdminRegisterRequest
	if bindAndValidate(c, &req) {
		return
	}

	user := &domain.User{
		Email:    req.Email,
		Password: req.Password,
	}
	employee := &domain.Employee{
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	registeredUser, accessToken, refreshToken, err := h.authUseCase.RegisterAdminWithForm(c.Request.Context(), user, employee)
	if err != nil {
		if errors.Is(err, domain.ErrUserAlreadyExists) || errors.Is(err, domain.ErrEmailAlreadyExists) {
			response.Conflict(c, "User with this email or identity already exists", err)
		} else {
			log.Printf("Internal server error during registration: %v", err)
			response.InternalServerError(c, fmt.Errorf("failed to complete registration"))
		}
		return
	}

	h.setRefreshTokenCookie(c, refreshToken, false)

	response.Success(c, http.StatusCreated, "User registered and logged in successfully", gin.H{
		"access_token": accessToken,
		"user": gin.H{
			"id":         registeredUser.ID,
			"email":      registeredUser.Email,
			"role":       registeredUser.Role,
			"last_login": registeredUser.LastLoginAt,
		},
		"is_new_user": true,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req authDTO.LoginRequest
	if bindAndValidate(c, &req) {
		return
	}

	user, accessToken, refreshToken, err := h.authUseCase.LoginWithIdentifier(c.Request.Context(), req.Identifier, req.Password, req.RememberMe)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidCredentials) {
			response.Unauthorized(c, "Invalid credentials", err)
		} else {
			response.InternalServerError(c, fmt.Errorf("login process failed: %w", err))
		}
		return
	}

	h.setRefreshTokenCookie(c, refreshToken, req.RememberMe)

	response.Success(c, http.StatusOK, "Login successful", gin.H{
		"access_token": accessToken,
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"role":       user.Role,
			"last_login": user.LastLoginAt,
		},
		"is_new_user": false,
	})
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var req authDTO.GoogleLoginRequest
	if bindAndValidate(c, &req) {
		return
	}

	user, accessToken, refreshToken, err := h.authUseCase.LoginWithGoogle(c.Request.Context(), req.Token)
	isNewUser := false
	if err != nil {
		user, accessToken, refreshToken, err = h.authUseCase.RegisterAdminWithGoogle(c.Request.Context(), req.Token)
		if err != nil {
			response.InternalServerError(c, fmt.Errorf("google authentication process failed: %w", err))
			return
		}
		isNewUser = true
	}

	h.setRefreshTokenCookie(c, refreshToken, false)

	response.Success(c, http.StatusOK, "Google authentication successful", gin.H{
		"access_token": accessToken,
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"role":       user.Role,
			"last_login": user.LastLoginAt,
		},
		"is_new_user": isNewUser,
	})
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req authDTO.ChangePasswordRequest
	if bindAndValidate(c, &req) {
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	if err := h.authUseCase.ChangePassword(c.Request.Context(), userID, req.OldPassword, req.NewPassword); err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.Success(c, http.StatusOK, "Password changed successfully", nil)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req authDTO.ResetPasswordRequest
	if bindAndValidate(c, &req) {
		return
	}

	if err := h.authUseCase.ResetPassword(c.Request.Context(), req.Email); err != nil {
		fmt.Printf("Error during password reset request for %s: %v\n", req.Email, err)
	}

	response.Success(c, http.StatusOK, "If an account with that email exists, a password reset link has been sent.", nil)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	rawRefreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			response.Unauthorized(c, "Refresh token not found", domain.ErrInvalidToken)
		} else {
			response.InternalServerError(c, fmt.Errorf("error reading refresh token cookie: %w", err))
		}
		return
	}
	if rawRefreshToken == "" {
		response.Unauthorized(c, "Refresh token is empty", domain.ErrInvalidToken)
		return
	}

	newAccessToken, newRefreshToken, err := h.authUseCase.RefreshToken(c.Request.Context(), rawRefreshToken)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidToken) {
			h.clearRefreshTokenCookie(c)
			response.Unauthorized(c, "Invalid or expired refresh token", err)
		} else {
			log.Printf("Internal error during token refresh: %v", err)
			response.InternalServerError(c, fmt.Errorf("token refresh failed internally"))
		}
		return
	}

	h.setRefreshTokenCookie(c, newRefreshToken, false)

	response.Success(c, http.StatusOK, "Token refreshed successfully", gin.H{
		"access_token": newAccessToken,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	userIDCtx, exists := c.Get("userID")
	if !exists {
		h.clearRefreshTokenCookie(c)
		response.Unauthorized(c, "User not authenticated for logout", nil)
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok || userID == 0 {
		h.clearRefreshTokenCookie(c)
		response.InternalServerError(c, fmt.Errorf("invalid user ID type or value in context during logout"))
		return
	}

	if err := h.authUseCase.Logout(c.Request.Context(), userID); err != nil {
		log.Printf("Error revoking tokens in DB during logout for user %d: %v", userID, err)
	}

	h.clearRefreshTokenCookie(c)

	response.Success(c, http.StatusOK, "Logout successful", nil)
}
