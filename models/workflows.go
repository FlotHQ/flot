package models

import "gorm.io/gorm"

type Workflow struct {
	gorm.Model
	Title           string
	Description     string
	ActiveVersionID uint
}
