package apis

import (
	"context"
	"net/http"

	"github.com/flothq/flot/services"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	authService services.AuthService
	sessions    sessions.Store
}

func NewAuthHandler(authService services.AuthService, sessions sessions.Store) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		sessions:    sessions,
	}
}

func RegisterAuthGroup(authService services.AuthService, rg *echo.Group, sessions sessions.Store) {
	handler := NewAuthHandler(authService, sessions)
	group := rg.Group("/auth")

	group.POST("/login", handler.handleLogin)
	group.POST("/logout", handler.handleLogout)
}

func (h *AuthHandler) handleLogin(c echo.Context) error {
	email := c.FormValue("email")
	password := c.FormValue("password")

	if email == "" || password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email and password are required")
	}

	session, err := h.authService.Login(c.Request().Context(), email, password)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	sess, _ := h.sessions.New(c.Request(), "session")
	sess.Values["session_id"] = session.ID
	if err := sess.Save(c.Request(), c.Response().Writer); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to save session")
	}

	return c.JSON(http.StatusOK, session)
}

func (h *AuthHandler) handleLogout(c echo.Context) error {
	ctx := context.WithValue(c.Request().Context(), "echo.context", c)
	sessionID := c.Get("session_id").(string)
	if err := h.authService.Logout(ctx, sessionID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "logout failed")
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}
