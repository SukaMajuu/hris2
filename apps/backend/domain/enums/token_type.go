package enums

import (
	"database/sql/driver"
	"fmt"
)

type TokenType string

const (
	TokenTypeAccess  TokenType = "access"
	TokenTypeRefresh TokenType = "refresh"
)

func (tt *TokenType) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan TokenType: invalid type %T", value)
	}
	*tt = TokenType(s)
	return nil
}

func (tt TokenType) Value() (driver.Value, error) {
	return string(tt), nil
}
