package apis

import (
	"github.com/casbin/casbin/v2"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"github.com/flothq/flot/core"
	internalMiddleware "github.com/flothq/flot/middleware"
	"github.com/flothq/flot/services"
	"github.com/flothq/flot/ui"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rs/zerolog/log"
)

func InitApi(app core.App, services *services.Container) (*echo.Echo, error) {
	e := echo.New()

	sessionStore := sessions.NewCookieStore([]byte("test-secret"))

	authService := services.Auth()
	profileService := services.Profile()

	adapter, err := gormadapter.NewAdapter("sqlite3", "policies.db")
	if err != nil {
		return nil, err
	}

	enforcer, err := casbin.NewEnforcer("config/rbac_model.conf", adapter)
	if err != nil {
		return nil, err
	}

	authMiddleware := internalMiddleware.NewAuthMiddleware(enforcer)

	e.Use(middleware.Secure())

	e.Use(authMiddleware.Authorize)

	api := e.Group("/api")
	RegisterEdgesGroup(app, api)
	RegisterNodesGroup(app, api)
	RegisterWorkflowsGroup(app, api)
	RegisterAuthGroup(authService, api, sessionStore)
	RegisterProfileGroup(profileService, api)

	e.GET("/*",
		echo.StaticDirectoryHandler(ui.DistDirFS, false),
		middleware.Gzip(),
	)

	api.Any("/*", func(c echo.Context) error {
		log.Debug().
			Str("path", c.Request().URL.Path).
			Msg("API route not found")
		return echo.ErrNotFound
	})

	return e, nil
}
