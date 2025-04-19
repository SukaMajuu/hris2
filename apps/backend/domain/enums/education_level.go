package enums

import (
	"database/sql/driver"
	"fmt"
)

type EducationLevel string

const (
	SD  EducationLevel = "SD"        // Sekolah Dasar / Elementary School
	SMP EducationLevel = "SMP"       // Sekolah Menengah Pertama / Junior High School
	SMA EducationLevel = "SMA/SMK"   // Sekolah Menengah Atas / Kejuruan / Senior High School
	D1  EducationLevel = "D1"        // Diploma 1
	D2  EducationLevel = "D2"        // Diploma 2
	D3  EducationLevel = "D3"        // Diploma 3
	S1  EducationLevel = "S1/D4"     // Strata 1 / Diploma 4 / Bachelor's Degree
	S2  EducationLevel = "S2"        // Strata 2 / Master's Degree
	S3  EducationLevel = "S3"        // Strata 3 / Doctorate Degree
	Other EducationLevel = "Other"
)

func (el *EducationLevel) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan EducationLevel: invalid type %T", value)
	}
	*el = EducationLevel(s)
	return nil
}

func (el EducationLevel) Value() (driver.Value, error) {
	return string(el), nil
}
