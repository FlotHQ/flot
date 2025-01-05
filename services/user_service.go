package services

import (
	"context"
	"fmt"

	"github.com/flothq/flot/models"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type userService struct {
	db     *gorm.DB
	logger zerolog.Logger
}

func NewUserService(db *gorm.DB, logger zerolog.Logger) UserService {
	return &userService{
		db:     db,
		logger: logger,
	}
}

func (s *userService) CreateUser(ctx context.Context, email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user := &models.User{
		Email:    email,
		Password: string(hashedPassword),
	}

	if err := s.db.Create(user).Error; err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (s *userService) ValidateCredentials(ctx context.Context, email, password string) (bool, error) {
	user, err := s.GetUserByEmail(ctx, email)
	if err != nil {
		return false, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil, nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	var user User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}

func (s *userService) GetUserByID(ctx context.Context, id string) (*User, error) {
	var user User
	if err := s.db.Where("id = ?", id).First(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}
