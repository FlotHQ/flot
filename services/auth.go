package services

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/flothq/flot/internal/kv"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

const (
	sessionDuration = 24 * time.Hour
)

type authService struct {
	userService UserService
	logger      zerolog.Logger
	sessions    kv.KeyValue
}

func NewAuthService(userService UserService, sessions kv.KeyValue, logger zerolog.Logger) AuthService {
	return &authService{
		userService: userService,
		sessions:    sessions,
		logger:      logger,
	}
}

func (a *authService) Login(ctx context.Context, email, password string) (*Session, error) {
	valid, err := a.userService.ValidateCredentials(ctx, email, password)
	if err != nil {
		return nil, err
	}
	if !valid {
		return nil, errors.New("invalid credentials")
	}

	user, err := a.userService.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	session := &Session{
		ID:        uuid.New().String(),
		ExpiresAt: time.Now().Add(sessionDuration),
		User:      *user,
	}

	sessionBytes, err := json.Marshal(session)
	if err != nil {
		return nil, err
	}

	if err := a.sessions.Put(session.ID, sessionBytes); err != nil {
		return nil, err
	}

	return session, nil
}

func (a *authService) Logout(ctx context.Context, sessionID string) error {
	if err := a.sessions.Delete(sessionID); err != nil {
		return err
	}
	return nil
}

func (a *authService) ValidateSession(ctx context.Context, sessionID string) (*Session, error) {
	sessionBytes, err := a.sessions.Get(sessionID)
	if err != nil {
		return nil, err
	}
	if sessionBytes == nil {
		return nil, errors.New("session not found")
	}

	var session Session
	if err := json.Unmarshal(sessionBytes, &session); err != nil {
		return nil, err
	}

	if time.Now().After(session.ExpiresAt) {
		a.sessions.Delete(sessionID)
		return nil, errors.New("session expired")
	}

	return &session, nil
}

func (a *authService) GetSession(ctx context.Context, sessionID string) (*Session, error) {
	sessionBytes, err := a.sessions.Get(sessionID)
	if err != nil {
		return nil, err
	}
	if sessionBytes == nil {
		return nil, errors.New("session not found")
	}

	var session Session
	if err := json.Unmarshal(sessionBytes, &session); err != nil {
		return nil, err
	}

	return &session, nil
}
