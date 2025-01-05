package services

import (
	"context"
	"io"
	"testing"

	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestUserService(t *testing.T) {
	logger := zerolog.New(io.Discard).With().Timestamp().Logger()
	userService := NewMockUserService(logger)
	ctx := context.Background()

	t.Run("CreateUser", func(t *testing.T) {
		err := userService.CreateUser(ctx, "new@example.com", "password123")
		assert.NoError(t, err)

		err = userService.CreateUser(ctx, "new@example.com", "password123")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "already exists")
	})

	t.Run("ValidateCredentials", func(t *testing.T) {
		valid, err := userService.ValidateCredentials(ctx, "test@example.com", "password123")
		assert.NoError(t, err)
		assert.True(t, valid)

		valid, err = userService.ValidateCredentials(ctx, "test@example.com", "wrongpassword")
		assert.NoError(t, err)
		assert.False(t, valid)

		valid, err = userService.ValidateCredentials(ctx, "nonexistent@example.com", "password123")
		assert.NoError(t, err)
		assert.False(t, valid)
	})

	t.Run("GetUserByEmail", func(t *testing.T) {
		user, err := userService.GetUserByEmail(ctx, "test@example.com")
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "test@example.com", user.Email)
		assert.Equal(t, "user-123", user.ID)

		err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte("password123"))
		assert.NoError(t, err)

		user, err = userService.GetUserByEmail(ctx, "nonexistent@example.com")
		assert.Error(t, err)
		assert.Nil(t, user)
		assert.Contains(t, err.Error(), "user not found")
	})

	t.Run("GetUserByID", func(t *testing.T) {
		userService.CreateUser(ctx, "test@example.com", "password123")

		user, err := userService.GetUserByID(ctx, "user-123")
		assert.NoError(t, err)
		assert.Equal(t, "user-123", user.ID)
	})

}
