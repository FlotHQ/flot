package cmd

import (
	"errors"
	"net/http"
	"net/url"
	"path/filepath"

	"github.com/flothq/flot/apis"
	"github.com/flothq/flot/core"
	"github.com/spf13/cobra"
)

func NewServeCommand(app core.App, showStartBanner bool) *cobra.Command {
	var allowedOrigins []string
	var httpAddr string
	var httpsAddr string
	var natsURIStr string
	var dbURIStr string

	command := &cobra.Command{
		Use:          "serve [domain(s)]",
		Args:         cobra.ArbitraryArgs,
		Short:        "Starts the web server (default to 127.0.0.1:8080 if no domain is specified)",
		SilenceUsage: true,
		RunE: func(command *cobra.Command, args []string) error {

			port := "8080"
			if app.IsDev() {
				port = "8081"
			}

			if len(args) > 0 {
				if httpAddr == "" {
					httpAddr = "0.0.0.0:80"
				}
				if httpsAddr == "" {
					httpsAddr = "0.0.0.0:443"
				}
			} else {
				if httpAddr == "" {
					httpAddr = "127.0.0.1:" + port
				}
			}

			if natsURIStr == "" {
				natsURIStr = "file:/" + filepath.Join(app.DataDir(), "nats")
			}

			if dbURIStr == "" {
				dbURIStr = "file:/" + filepath.Join(app.DataDir(), "flot.db?cache=shared&mode=rwc")
			}

			natsURI, err := url.Parse(natsURIStr)
			if err != nil {
				return err
			}

			dbURI, err := url.Parse(dbURIStr)
			if err != nil {
				return err
			}

			println("natsURI: ", natsURI.String())
			println("dbURI: ", dbURI.String())

			_, err = apis.Serve(app, apis.ServeConfig{
				HttpAddr:           httpAddr,
				HttpsAddr:          httpsAddr,
				ShowStartBanner:    showStartBanner,
				AllowedOrigins:     allowedOrigins,
				CertificateDomains: args,
			})

			if errors.Is(err, http.ErrServerClosed) {
				return nil
			}

			return err
		},
	}

	command.PersistentFlags().StringSliceVar(
		&allowedOrigins,
		"origins",
		[]string{"*"},
		"CORS allowed domain origins list",
	)

	command.PersistentFlags().StringVar(
		&httpAddr,
		"http",
		"",
		"TCP address to listen for the HTTP server\n(if domain args are specified - default to 0.0.0.0:80, otherwise - default to 127.0.0.1:8090)",
	)

	command.PersistentFlags().StringVar(
		&httpsAddr,
		"https",
		"",
		"TCP address to listen for the HTTPS server\n(if domain args are specified - default to 0.0.0.0:443, otherwise - default to empty string, aka. no TLS)\nThe incoming HTTP traffic also will be auto redirected to the HTTPS version",
	)

	command.PersistentFlags().StringVar(
		&natsURIStr,
		"nats-uri",
		"",
		"NATS URI to connect to (eg. file://data/nats (embedded mode) or nats://127.0.0.1:4222 (external mode))",
	)
	command.PersistentFlags().StringVar(
		&dbURIStr,
		"db-uri",
		"",
		"Database URI to connect to (eg. file://data/flot.db (embedded mode) or libsql://example.com:5432/flot (external mode))",
	)

	return command
}
