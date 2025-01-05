package services

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"testing"
	"time"

	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
)

type mockKeyValue struct {
	data        map[string][]byte
	shouldError bool
}

func newMockKeyValue() *mockKeyValue {
	return &mockKeyValue{
		data: make(map[string][]byte),
	}
}

func (m *mockKeyValue) Get(key string) ([]byte, error) {
	if m.shouldError {
		return nil, errors.New("storage error")
	}
	if val, ok := m.data[key]; ok {
		return val, nil
	}
	return nil, nil
}

func (m *mockKeyValue) Put(key string, value []byte) error {
	if m.shouldError {
		return errors.New("storage error")
	}
	m.data[key] = value
	return nil
}

func (m *mockKeyValue) Delete(key string) error {
	if m.shouldError {
		return errors.New("storage error")
	}
	delete(m.data, key)
	return nil
}

func TestAuthService(t *testing.T) {
	logger := zerolog.New(io.Discard).With().Timestamp().Logger()
	userService := NewMockUserService(logger)
	sessionStore := newMockKeyValue()
	authService := NewAuthService(userService, sessionStore, logger)
	ctx := context.Background()

	t.Run("Login_Success", func(t *testing.T) {
		session, err := authService.Login(ctx, "test@example.com", "password123")
		assert.NoError(t, err)
		assert.NotNil(t, session)
		assert.NotEmpty(t, session.ID)
		assert.Equal(t, "test@example.com", session.User.Email)
		assert.True(t, session.ExpiresAt.After(time.Now()))
	})

	t.Run("Login_InvalidCredentials", func(t *testing.T) {
		session, err := authService.Login(ctx, "test@example.com", "wrongpassword")
		assert.Error(t, err)
		assert.Nil(t, session)
		assert.Contains(t, err.Error(), "invalid credentials")

		session, err = authService.Login(ctx, "nonexistent@example.com", "password123")
		assert.Error(t, err)
		assert.Nil(t, session)
		assert.Contains(t, err.Error(), "invalid credentials")
	})

	t.Run("Login_StorageError", func(t *testing.T) {
		sessionStore.shouldError = true
		defer func() { sessionStore.shouldError = false }()

		session, err := authService.Login(ctx, "test@example.com", "password123")
		assert.Error(t, err)
		assert.Nil(t, session)
		assert.Contains(t, err.Error(), "storage error")
	})

	t.Run("ValidateSession", func(t *testing.T) {
		session, err := authService.Login(ctx, "test@example.com", "password123")
		assert.NoError(t, err)

		validatedSession, err := authService.ValidateSession(ctx, session.ID)
		assert.NoError(t, err)
		assert.NotNil(t, validatedSession)
		assert.Equal(t, session.ID, validatedSession.ID)
		assert.Equal(t, session.User.Email, validatedSession.User.Email)

		validatedSession, err = authService.ValidateSession(ctx, "invalid-session-id")
		assert.Error(t, err)
		assert.Nil(t, validatedSession)
		assert.Contains(t, err.Error(), "session not found")
	})

	t.Run("ValidateSession_StorageError", func(t *testing.T) {
		session, err := authService.Login(ctx, "test@example.com", "password123")
		assert.NoError(t, err)

		sessionStore.shouldError = true
		defer func() { sessionStore.shouldError = false }()

		validatedSession, err := authService.ValidateSession(ctx, session.ID)
		assert.Error(t, err)
		assert.Nil(t, validatedSession)
		assert.Contains(t, err.Error(), "storage error")
	})

	t.Run("ValidateSession_InvalidJSON", func(t *testing.T) {
		sessionID := "invalid-json-session"
		err := sessionStore.Put(sessionID, []byte("invalid json"))
		assert.NoError(t, err)

		validatedSession, err := authService.ValidateSession(ctx, sessionID)
		assert.Error(t, err)
		assert.Nil(t, validatedSession)
		assert.Contains(t, err.Error(), "invalid character")
	})

	t.Run("Logout", func(t *testing.T) {
		session, err := authService.Login(ctx, "test@example.com", "password123")
		assert.NoError(t, err)

		err = authService.Logout(ctx, session.ID)
		assert.NoError(t, err)

		validatedSession, err := authService.ValidateSession(ctx, session.ID)
		assert.Error(t, err)
		assert.Nil(t, validatedSession)
		assert.Contains(t, err.Error(), "session not found")
	})

	t.Run("Logout_StorageError", func(t *testing.T) {
		session, err := authService.Login(ctx, "test@example.com", "password123")
		assert.NoError(t, err)

		sessionStore.shouldError = true
		defer func() { sessionStore.shouldError = false }()

		err = authService.Logout(ctx, session.ID)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "storage error")
	})

	t.Run("ExpiredSession", func(t *testing.T) {
		session, err := authService.Login(ctx, "test@example.com", "password123")
		assert.NoError(t, err)

		session.ExpiresAt = time.Now().Add(-time.Hour)
		sessionBytes, _ := json.Marshal(session)
		err = sessionStore.Put(session.ID, sessionBytes)
		assert.NoError(t, err)

		validatedSession, err := authService.ValidateSession(ctx, session.ID)
		assert.Error(t, err)
		assert.Nil(t, validatedSession)
		assert.Contains(t, err.Error(), "session expired")
	})
}
