package services

import "time"

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Roles     []string  `json:"roles"`
	OrgID     string    `json:"org_id"`
}

type Session struct {
	ID        string    `json:"id"`
	ExpiresAt time.Time `json:"expires_at"`
	User      User      `json:"user"`
}

type Workflow struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
