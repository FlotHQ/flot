package ui

import (
	"embed"

	"github.com/labstack/echo/v4"
)

var distDir embed.FS

var DistDirFS = echo.MustSubFS(distDir, "dist")
