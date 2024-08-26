package ui

import (
	"embed"

	"github.com/labstack/echo/v4"
)

//go:embed all:dist
var distDir embed.FS

var DistDirFS = echo.MustSubFS(distDir, "dist")
