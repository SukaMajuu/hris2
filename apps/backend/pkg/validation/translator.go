package validation

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// TranslateError converts validator errors into a map[string]string
func TranslateError(err error) map[string]string {
	errs := make(map[string]string)
	validatorErrs, ok := err.(validator.ValidationErrors)
	if !ok {
		// Not a validation error, return generic message or handle differently
		errs["error"] = "Invalid input data"
		return errs
	}

	for _, e := range validatorErrs {
		// Use field name as key, provide a descriptive error message
		// You can customize messages based on e.Tag()
		fieldName := strings.ToLower(e.Field())
		errs[fieldName] = fmt.Sprintf("Validation failed on field '%s' with tag '%s'", e.Field(), e.Tag())
	}
	return errs
}
