package services

import (
	"context"
)

type Profile struct {
	ID        string   `json:"id"`
	Email     string   `json:"email"`
	Roles     []string `json:"roles"`
	OrgID     string   `json:"org_id"`
	CreatedAt int64    `json:"created_at"`
	UpdatedAt int64    `json:"updated_at"`
}

type profileService struct {
	userService UserService
}

func NewProfileService(userService UserService) ProfileService {
	return &profileService{
		userService: userService,
	}
}

func (s *profileService) GetProfile(ctx context.Context, userID string) (*Profile, error) {
	user, err := s.userService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &Profile{
		ID:        user.ID,
		Email:     user.Email,
		Roles:     user.Roles,
		OrgID:     user.OrgID,
		CreatedAt: user.CreatedAt.Unix(),
		UpdatedAt: user.UpdatedAt.Unix(),
	}, nil
}
