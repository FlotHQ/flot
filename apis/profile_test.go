package apis

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/flothq/flot/services"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
)

func TestProfileHandler(t *testing.T) {
	e := echo.New()
	logger := zerolog.New(io.Discard).With().Timestamp().Logger()
	userService := services.NewMockUserService(logger)
	profileService := services.NewProfileService(userService)
	profileHandler := NewProfileHandler(profileService)

	userService.CreateUser(context.Background(), "test@example.com", "password123")

	t.Run("get_profile_success", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/profile", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		user := &services.User{
			ID:    "user-123",
			Email: "test@example.com",
			Roles: []string{"user"},
			OrgID: "org123",
		}
		c.Set("user", user)

		err := profileHandler.handleGetProfile(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
	})

}
