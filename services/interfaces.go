package services

import (
	"context"
)

type UserService interface {
	CreateUser(ctx context.Context, email, password string) error
	ValidateCredentials(ctx context.Context, email, password string) (bool, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	GetUserByID(ctx context.Context, id string) (*User, error)
}

type AuthService interface {
	Login(ctx context.Context, email, password string) (*Session, error)
	Logout(ctx context.Context, sessionID string) error
	ValidateSession(ctx context.Context, sessionID string) (*Session, error)
	GetSession(ctx context.Context, sessionID string) (*Session, error)
}

type ProfileService interface {
	GetProfile(ctx context.Context, userID string) (*Profile, error)
}

type WorkflowService interface {
	CreateWorkflow(ctx context.Context, userID string, name string) error
	GetWorkflow(ctx context.Context, id string) (*Workflow, error)
	ListWorkflows(ctx context.Context, userID string) ([]*Workflow, error)
	DeleteWorkflow(ctx context.Context, id string) error
}
