package apis

import (
	"net/http"

	"github.com/flothq/flot/core"
	"github.com/labstack/echo/v4"
)

func RegisterWorkflowsGroup(app core.App, rg *echo.Group) {
	group := rg.Group("/workflows")

	group.GET(":id", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.POST("", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.DELETE(":id", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.PUT(":id", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})
}
