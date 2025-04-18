package domain

import "errors"

// Authentication errors
var (
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrInvalidToken        = errors.New("invalid token")
	ErrInvalidPhoneNumber  = errors.New("invalid phone number")
	ErrInvalidOTP         = errors.New("invalid OTP")
	ErrInvalidPassword    = errors.New("invalid password")
	ErrInvalidEmail       = errors.New("invalid email")
	ErrInvalidUserID      = errors.New("invalid user ID")
	ErrInvalidUser        = errors.New("invalid user")
)
