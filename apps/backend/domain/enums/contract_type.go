package enums

import (
	"database/sql/driver"
	"fmt"
)

type ContractType string

const (
	Permanent ContractType = "permanent"
	Contract  ContractType = "contract"
	Freelance ContractType = "freelance"
)

func (ct *ContractType) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan ContractType: invalid type %T", value)
	}
	*ct = ContractType(s)
	return nil
}

func (ct ContractType) Value() (driver.Value, error) {
	return string(ct), nil
}
