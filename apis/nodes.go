package apis

import (
	"net/http"

	"github.com/flothq/flot/core"
	"github.com/labstack/echo/v4"
)

func RegisterNodesGroup(app core.App, rg *echo.Group) {
	group := rg.Group("/nodes")

	group.GET("", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.GET(":id", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.POST("", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	group.PUT("/:id/input/:key", func(c echo.Context) error {

		var data interface{}
		if err := c.Bind(&data); err != nil {
			return err
		}
		return c.String(http.StatusOK, "ok")
	})

	group.DELETE("/:id", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

}
