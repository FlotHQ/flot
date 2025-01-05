package services

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
)

type MockUserService struct {
	mu     sync.RWMutex
	users  map[string]*User
	logger zerolog.Logger
}

func NewMockUserService(logger zerolog.Logger) *MockUserService {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	return &MockUserService{
		users: map[string]*User{
			"test@example.com": {
				ID:        "user-123",
				Email:     "test@example.com",
				Password:  string(hashedPassword),
				Roles:     []string{"user"},
				OrgID:     "org123",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		logger: logger,
	}
}

func (m *MockUserService) CreateUser(ctx context.Context, email, password string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.logger.Debug().
		Str("email", email).
		Msg("Creating new user")

	if _, exists := m.users[email]; exists {
		m.logger.Warn().
			Str("email", email).
			Msg("User already exists")
		return fmt.Errorf("user with email %s already exists", email)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		m.logger.Error().
			Err(err).
			Str("email", email).
			Msg("Failed to hash password")
		return err
	}

	user := &User{
		ID:        fmt.Sprintf("user-%s", email),
		Email:     email,
		Password:  string(hashedPassword),
		Roles:     []string{"user"},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	m.users[email] = user
	m.logger.Info().
		Str("email", email).
		Str("user_id", user.ID).
		Msg("User created successfully")
	return nil
}

func (m *MockUserService) ValidateCredentials(ctx context.Context, email, password string) (bool, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	m.logger.Debug().
		Str("email", email).
		Msg("Validating user credentials")

	user, exists := m.users[email]
	if !exists {
		m.logger.Debug().
			Str("email", email).
			Msg("User not found")
		return false, nil
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		m.logger.Debug().
			Str("email", email).
			Msg("Invalid password")
		return false, nil
	}

	m.logger.Debug().
		Str("email", email).
		Msg("Credentials validated successfully")
	return true, nil
}

func (m *MockUserService) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	m.logger.Debug().
		Str("email", email).
		Msg("Getting user by email")

	user, exists := m.users[email]
	if !exists {
		m.logger.Debug().
			Str("email", email).
			Msg("User not found")
		return nil, fmt.Errorf("user not found")
	}

	m.logger.Debug().
		Str("email", email).
		Str("user_id", user.ID).
		Msg("User found")
	return user, nil
}

func (m *MockUserService) GetUserByID(ctx context.Context, id string) (*User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	m.logger.Debug().
		Str("id", id).
		Msg("Getting user by ID")

	for _, user := range m.users {
		if user.ID == id {
			m.logger.Debug().
				Str("id", id).
				Str("user_id", user.ID).
				Msg("User found")
			return user, nil
		}
	}

	m.logger.Debug().
		Str("id", id).
		Msg("User not found")
	return nil, fmt.Errorf("user not found")
}
