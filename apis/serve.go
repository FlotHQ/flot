package apis

import (
	"context"
	"crypto/tls"
	"log"
	"net"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/flothq/flot/core"
	"github.com/flothq/flot/models"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/crypto/acme"
	"golang.org/x/crypto/acme/autocert"
)

type ServeConfig struct {
	HttpAddr           string
	HttpsAddr          string
	AllowedOrigins     []string
	ShowStartBanner    bool
	CertificateDomains []string
}

func Serve(app core.App, config ServeConfig) (*http.Server, error) {

	if len(config.AllowedOrigins) == 0 {
		config.AllowedOrigins = []string{"*"}
	}

	if err := runMigrations(app); err != nil {
		return nil, err
	}

	router, err := InitApi(app)
	if err != nil {
		return nil, err
	}

	router.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		Skipper:      middleware.DefaultSkipper,
		AllowOrigins: config.AllowedOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))

	mainAddr := config.HttpAddr
	if config.HttpsAddr != "" {
		mainAddr = config.HttpsAddr
	}

	var wwwRedirects []string

	hostNames := config.CertificateDomains
	if len(hostNames) == 0 {
		host, _, _ := net.SplitHostPort(mainAddr)
		hostNames = append(hostNames, host)
	}
	for _, host := range hostNames {
		if strings.HasPrefix(host, "www.") {
			continue // explicitly set www host
		}

		wwwHost := "www." + host
		existsInSlice := false
		for _, redirect := range wwwRedirects {
			if redirect == wwwHost {
				existsInSlice = true
				break
			}
		}

		if !existsInSlice {
			hostNames = append(hostNames, wwwHost)
			wwwRedirects = append(wwwRedirects, wwwHost)
		}
	}

	certManager := &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		Cache:      autocert.DirCache(filepath.Join(app.DataDir(), ".autocert_cache")),
		HostPolicy: autocert.HostWhitelist(hostNames...),
	}

	baseCtx, cancelBaseCtx := context.WithCancel(context.Background())
	defer cancelBaseCtx()

	server := &http.Server{
		TLSConfig: &tls.Config{
			MinVersion:     tls.VersionTLS12,
			GetCertificate: certManager.GetCertificate,
			NextProtos:     []string{acme.ALPNProto},
		},
		ReadTimeout:       10 * time.Minute,
		ReadHeaderTimeout: 30 * time.Second,
		// WriteTimeout: 60 * time.Second, // breaks sse!
		Handler: router,
		Addr:    mainAddr,
		BaseContext: func(l net.Listener) context.Context {
			return baseCtx
		},
	}

	if config.ShowStartBanner {
		schema := "http"
		addr := server.Addr

		if config.HttpsAddr != "" {
			schema = "https"

			if len(config.CertificateDomains) > 0 {
				addr = config.CertificateDomains[0]
			}
		}

		date := new(strings.Builder)
		log.New(date, "", log.LstdFlags).Print()

		bold := color.New(color.Bold).Add(color.FgGreen)
		bold.Printf(
			"%s Server started at %s\n",
			strings.TrimSpace(date.String()),
			color.CyanString("%s://%s", schema, addr),
		)

		regular := color.New()
		regular.Printf("├─ REST API: %s\n", color.CyanString("%s://%s/api/", schema, addr))
		// regular.Printf("└─ Admin UI: %s\n", color.CyanString("%s://%s/_/", schema, addr))
	}

	return server, server.ListenAndServe()
}

func runMigrations(app core.App) error {
	db := app.Db()

	if err := db.AutoMigrate(&models.User{}, &models.Account{}, &models.Workflow{}, &models.Version{}); err != nil {
		return err
	}

	return nil
}
