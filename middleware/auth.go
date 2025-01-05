package middleware

import (
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	enforcer *casbin.Enforcer
}

func NewAuthMiddleware(e *casbin.Enforcer) *AuthMiddleware {
	return &AuthMiddleware{enforcer: e}
}

func (m *AuthMiddleware) Authorize(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		user := c.Get("user")
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
		}

		role := "user"
		if isAdmin := false; isAdmin {
			role = "admin"
		}

		allowed, err := m.enforcer.Enforce(role, c.Request().URL.Path, c.Request().Method)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "authorization error")
		}

		if !allowed {
			return echo.NewHTTPError(http.StatusForbidden, "forbidden")
		}

		return next(c)
	}
}
