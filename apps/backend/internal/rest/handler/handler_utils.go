package handler

import (
	"errors"
	"fmt"
	"io"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/SukaMajuu/hris/apps/backend/pkg/validation"
	"github.com/gin-gonic/gin"
)

func bindAndValidate(c *gin.Context, dto interface{}) bool {
	if dto == nil {
		response.BadRequest(c, domain.ErrRequestBodyRequired.Error(), nil)
		return true
	}

	if err := c.ShouldBindJSON(dto); err != nil {
		if errors.Is(err, io.EOF) {
			response.BadRequest(c, domain.ErrRequestBodyRequired.Error(), nil)
			return true
		}
		validationErrors := validation.TranslateError(err)
		if len(validationErrors) > 0 {
			firstErrorMsg := domain.ErrInvalidRequestBody.Error()
			for _, msg := range validationErrors {
				firstErrorMsg = msg
				break
			}
			response.BadRequest(c, firstErrorMsg, nil)
			return true
		}
		response.BadRequest(c, domain.ErrInvalidRequestBody.Error(), nil)
		return true
	}

	if validator, ok := dto.(interface{ Validate() error }); ok {
		if err := validator.Validate(); err != nil {
			validationErrors := validation.TranslateError(err)
			if len(validationErrors) > 0 {
				firstErrorMsg := domain.ErrInvalidRequestBody.Error()
				for _, msg := range validationErrors {
					firstErrorMsg = msg
					break
				}
				response.BadRequest(c, firstErrorMsg, nil)
				return true
			}
			response.BadRequest(c, domain.ErrInvalidRequestBody.Error(), nil)
			return true
		}
	}

	return false
}

func bindAndValidateQuery(c *gin.Context, dto interface{}) bool {
	if dto == nil {
		response.BadRequest(c, "DTO for query binding is nil", nil)
		return true
	}

	if err := c.ShouldBindQuery(dto); err != nil {
		validationErrors := validation.TranslateError(err)
		firstErrorMsg := "Invalid query parameters"
		if len(validationErrors) > 0 {
			for _, msg := range validationErrors {
				firstErrorMsg = msg
				break
			}
		} else {
			firstErrorMsg = fmt.Sprintf("Invalid query parameters: %s", err.Error())
		}
		response.BadRequest(c, firstErrorMsg, nil)
		return true
	}
	return false
}
