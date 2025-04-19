package handler

import (
	"fmt"
	"net/http"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	authDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/auth"
	authUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/SukaMajuu/hris/apps/backend/pkg/validation"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authUseCase *authUseCase.AuthUseCase
	// TODO: Inject JWT Service/Helper
}

func NewAuthHandler(authUseCase *authUseCase.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUseCase: authUseCase}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req authDTO.AdminRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := validation.TranslateError(err)
		firstErrorMsg := "Invalid request body"
		for _, msg := range validationErrors {
			firstErrorMsg = msg
			break
		}
		response.BadRequest(c, firstErrorMsg, nil)
		return
	}

	user := domain.User{
		Email:    req.Email,
		Password: req.Password,
	}
	employee := domain.Employee{
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	err := h.authUseCase.RegisterAdminWithForm(c.Request.Context(), &user, &employee)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	responseData := gin.H{
		"user_id": user.ID,
	}

	response.Created(c, "User registered successfully", responseData)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req authDTO.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := validation.TranslateError(err)
		firstErrorMsg := "Invalid request body"
		for _, msg := range validationErrors {
			firstErrorMsg = msg
			break
		}
		response.BadRequest(c, firstErrorMsg, nil)
		return
	}

	user, err := h.authUseCase.LoginWithIdentifier(c.Request.Context(), req.Identifier, req.Password)
	if err != nil {
		if err == domain.ErrInvalidCredentials {
			response.Unauthorized(c, "Invalid credentials", domain.ErrInvalidCredentials)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	// TODO: Generate JWT token
	response.Success(c, http.StatusOK, "Login successful", gin.H{
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var req authDTO.GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := validation.TranslateError(err)
		firstErrorMsg := "Invalid request body"
		for _, msg := range validationErrors {
			firstErrorMsg = msg
			break
		}
		response.BadRequest(c, firstErrorMsg, nil)
		return
	}

	user, loginErr := h.authUseCase.LoginWithGoogle(c.Request.Context(), req.Token)
	if loginErr == nil {
		response.Success(c, http.StatusOK, "Google login successful", gin.H{
			"user": gin.H{"id": user.ID, "email": user.Email, "role": user.Role},
		})
		return
	}

	if req.AgreeTerms == nil || !*req.AgreeTerms {
		response.BadRequest(c, "Terms must be agreed for registration", nil)
		return
	}

	regUser, _, regErr := h.authUseCase.RegisterAdminWithGoogle(c.Request.Context(), req.Token)
	if regErr != nil {
		response.InternalServerError(c, regErr)
		return
	}

	response.Created(c, "Google registration successful", gin.H{
		"user": gin.H{"id": regUser.ID, "email": regUser.Email, "role": regUser.Role},
	})
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req authDTO.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := validation.TranslateError(err)
		firstErrorMsg := "Invalid request body"
		for _, msg := range validationErrors {
			firstErrorMsg = msg
			break
		}
		response.BadRequest(c, firstErrorMsg, nil)
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
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := validation.TranslateError(err)
		firstErrorMsg := "Invalid request body"
		for _, msg := range validationErrors {
			firstErrorMsg = msg
			break
		}
		response.BadRequest(c, firstErrorMsg, nil)
		return
	}

	if err := h.authUseCase.ResetPassword(c.Request.Context(), req.Email); err != nil {
		fmt.Printf("Error during password reset request for %s: %v\n", req.Email, err)
	}

	response.Success(c, http.StatusOK, "If an account with that email exists, a password reset link has been sent.", nil)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req authDTO.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		validationErrors := validation.TranslateError(err)
		firstErrorMsg := "Invalid request body"
		for _, msg := range validationErrors {
			firstErrorMsg = msg
			break
		}
		response.BadRequest(c, firstErrorMsg, nil)
		return
	}
	refreshToken := req.RefreshToken

	if refreshToken == "" {
		response.Unauthorized(c, "Refresh token is missing", fmt.Errorf("refresh token missing"))
		return
	}

	response.Success(c, http.StatusOK, "Token refreshed successfully", gin.H{})
}
