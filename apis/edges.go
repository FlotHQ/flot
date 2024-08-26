package apis

import (
	"net/http"

	"github.com/flothq/flot/core"
	"github.com/labstack/echo/v4"
)

func RegisterEdgesGroup(app core.App, rg *echo.Group) {
	group := rg.Group("/edges")

	group.GET("", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.GET(":id", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.POST("", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})
}
