package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/flothq/flot"
)

func main() {
	
	app := flot.New()

	app.RootCmd.ParseFlags(os.Args[1:])

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

// the default pb_public dir location is relative to the executable
func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// most likely ran with go run
		return "./pb_public"
	}

	return filepath.Join(os.Args[0], "../pb_public")
}
