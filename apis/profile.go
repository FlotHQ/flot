package apis

import (
	"net/http"

	"github.com/flothq/flot/services"
	"github.com/labstack/echo/v4"
)

type ProfileHandler struct {
	profileService services.ProfileService
}

func NewProfileHandler(profileService services.ProfileService) *ProfileHandler {
	return &ProfileHandler{
		profileService: profileService,
	}
}

func RegisterProfileGroup(profileService services.ProfileService, rg *echo.Group) {
	handler := NewProfileHandler(profileService)
	group := rg.Group("/profile")

	group.GET("", handler.handleGetProfile)
}

func (h *ProfileHandler) handleGetProfile(c echo.Context) error {
	user := c.Get("user").(*services.User)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	profile, err := h.profileService.GetProfile(c.Request().Context(), user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get profile")
	}

	return c.JSON(http.StatusOK, profile)
}
