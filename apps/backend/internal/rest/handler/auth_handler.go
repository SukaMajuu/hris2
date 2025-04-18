package handler

import (
	"net/http"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	authDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/auth"
	authUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authUseCase *authUseCase.AuthUseCase
}

func NewAuthHandler(authUseCase *authUseCase.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUseCase: authUseCase}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req authDTO.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err)
		return
	}

	if err := req.Validate(); err != nil {
		response.BadRequest(c, "Validation failed", err)
		return
	}

	// Create user
	user := domain.User{
		Email:    req.Email,
		Password: req.Password,
		Phone:    req.Phone,
		Role:     enums.UserRole(req.Role),
	}

	if err := h.authUseCase.RegisterWithForm(c.Request.Context(), &user); err != nil {
		response.InternalServerError(c, err)
		return
	}

	// Create employee
	employee := domain.Employee{
		UserID:          user.ID,
		EmployeeCode:    req.EmployeeCode,
		FirstName:       req.FirstName,
		LastName:        req.LastName,
		Phone:           req.Phone,
		DepartmentID:    req.DepartmentID,
		PositionID:      req.PositionID,
		EmploymentStatus: enums.EmploymentStatus(req.EmploymentStatus),
		HireDate:        req.HireDate,
	}

	if err := h.authUseCase.CreateEmployee(c.Request.Context(), &employee); err != nil {
		// If employee creation fails, we should rollback the user creation
		// TODO: Implement rollback mechanism
		response.InternalServerError(c, err)
		return
	}

	responseData := gin.H{
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"phone": user.Phone,
			"role":  user.Role,
		},
		"employee": gin.H{
			"id":               employee.ID,
			"employee_code":    employee.EmployeeCode,
			"first_name":       employee.FirstName,
			"last_name":        employee.LastName,
			"department_id":    employee.DepartmentID,
			"position_id":      employee.PositionID,
			"employment_status": employee.EmploymentStatus,
			"hire_date":        employee.HireDate,
		},
	}

	response.Created(c, "User and employee registered successfully", responseData)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement login handler
	// - Validate request
	// - Call use case
	// - Return response with JWT token
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var data struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement change password handler
	// - Get user ID from context (after auth middleware)
	// - Call use case
	// - Return response
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var data struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement reset password handler
	// - Call use case
	// - Return response
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var data struct {
		Token string `json:"token"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement Google login handler
	// - Verify Google token
	// - Call use case
	// - Return response with JWT token
}

func (h *AuthHandler) EmployeeLogin(c *gin.Context) {
	var data struct {
		EmployeeID string `json:"employee_id"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement employee login handler
	// - Call use case
	// - Return response with JWT token
}

func (h *AuthHandler) PhoneLogin(c *gin.Context) {
	var data struct {
		Phone string `json:"phone"`
		OTP   string `json:"otp"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement phone login handler
	// - Call use case
	// - Return response with JWT token
}

func (h *AuthHandler) RequestOTP(c *gin.Context) {
	var data struct {
		Phone string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement OTP request handler
	// - Call use case
	// - Return response
}
