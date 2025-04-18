package domain

import (
	"time"
)

type Employee struct {
    ID               uint                    `gorm:"primaryKey"`
    UserID          uint                    `gorm:"not null"`
    User            User                    `gorm:"foreignKey:UserID"`
    EmployeeCode    string                  `gorm:"type:varchar(255);unique;not null;index"`
    FirstName       string                  `gorm:"type:varchar(255);not null"`
    LastName        string                  `gorm:"type:varchar(255);not null"`
    Phone           string                  `gorm:"type:varchar(255)"`
    DepartmentID    uint                    `gorm:"not null;index"`
    Department      Department              `gorm:"foreignKey:DepartmentID"`
    PositionID      uint                    `gorm:"not null"`
    Position        Position                `gorm:"foreignKey:PositionID"`
    EmploymentStatus bool                  `gorm:"type:boolean;default:true"`
    ResignationDate time.Time               `gorm:"type:date"`
    HireDate        time.Time               `gorm:"type:date"`
    CreatedAt       time.Time               `gorm:"autoCreateTime"`
    UpdatedAt       time.Time               `gorm:"autoUpdateTime"`
}
