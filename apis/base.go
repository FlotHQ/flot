package apis

import (
	"github.com/flothq/flot/core"
	"github.com/flothq/flot/ui"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func InitApi(app core.App) (*echo.Echo, error) {
	e := echo.New()

	e.Use(middleware.Recover())
	e.Use(middleware.Secure())

	api := e.Group("/api")

	RegisterEdgesGroup(app, api)
	RegisterNodesGroup(app, api)
	RegisterWorkflowsGroup(app, api)

	e.GET("/*",
		echo.StaticDirectoryHandler(ui.DistDirFS, false),
		middleware.Gzip(),
	)

	api.Any("/*", func(c echo.Context) error {
		return echo.ErrNotFound
	})

	return e, nil
}
