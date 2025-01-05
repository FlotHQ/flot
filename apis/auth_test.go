package apis

import (
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/flothq/flot/internal/kv"
	"github.com/flothq/flot/services"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
)

func TestAuthHandler(t *testing.T) {
	e := echo.New()
	logger := zerolog.New(io.Discard).With().Timestamp().Logger()
	sessionStore := sessions.NewCookieStore([]byte("test-secret"))
	sessionKV := kv.NewMemoryStore()
	userService := services.NewMockUserService(logger)
	authService := services.NewAuthService(userService, sessionKV, logger)
	authHandler := NewAuthHandler(authService, sessionStore)

	t.Run("login_success", func(t *testing.T) {
		form := url.Values{}
		form.Add("email", "test@example.com")
		form.Add("password", "password123")

		req := httptest.NewRequest(http.MethodPost, "/auth/login", strings.NewReader(form.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := authHandler.handleLogin(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		cookie := rec.Header().Get("Set-Cookie")
		assert.NotEmpty(t, cookie)

	})

	t.Run("login_invalid_credentials", func(t *testing.T) {
		form := url.Values{}
		form.Add("email", "test@example.com")
		form.Add("password", "wrongpassword")

		req := httptest.NewRequest(http.MethodPost, "/auth/login", strings.NewReader(form.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := authHandler.handleLogin(c)
		assert.Error(t, err)
		he, ok := err.(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, http.StatusUnauthorized, he.Code)
	})

}

func getSessionIDFromCookie(cookie string) string {
	parts := strings.Split(cookie, ";")
	for _, part := range parts {
		if strings.HasPrefix(part, "session=") {
			return strings.TrimPrefix(part, "session=")
		}
	}
	return ""
}
