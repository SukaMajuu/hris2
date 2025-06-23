package domain

import "errors"

// Authentication errors
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidPhoneNumber = errors.New("invalid phone number")
	ErrInvalidPassword    = errors.New("invalid password")
	ErrInvalidEmail       = errors.New("invalid email")
	ErrInvalidUserID      = errors.New("invalid user ID")
	ErrInvalidUser        = errors.New("invalid user")
	ErrEmailAlreadyExists = errors.New("email already registered")
	ErrUserAlreadyExists  = errors.New("user already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrPhoneAlreadyExists = errors.New("phone number already registered")
)

// Request validation errors
var (
	ErrRequestBodyRequired = errors.New("invalid request: request body is required")
	ErrInvalidRequestBody  = errors.New("invalid request body")
)

// Token Error
var (
	ErrInvalidToken  = errors.New("invalid token")
	ErrTokenExpired  = errors.New("token has expired")
	ErrTokenMismatch = errors.New("token hash mismatch")
)

// Employee errors
var (
	ErrEmployeeNotFound = errors.New("employee not found")
	ErrEmployeeResigned = errors.New("employee has resigned and cannot login")
)

// Leave Request errors
var (
	ErrLeaveRequestNotFound    = errors.New("leave request not found")
	ErrOverlappingLeaveRequest = errors.New("overlapping leave request already exists")
)

// Location errors
var (
	ErrLocationNotFound = errors.New("location not found")
	ErrLocationExists   = errors.New("location already exists")
	ErrLocationInvalid  = errors.New("invalid location")
)

// common errors
var (
	ErrForbidden = errors.New("forbidden")
)
