package cmd

import (
	"errors"
	"net/http"

	"github.com/flothq/flot/apis"
	"github.com/flothq/flot/config"
	"github.com/flothq/flot/internal/kv"
	"github.com/flothq/flot/services"
	"github.com/nats-io/nats.go"
	"github.com/spf13/cobra"
	"gorm.io/gorm"
)

func NewServeCommand(
	config config.FlotConfig,
	db *gorm.DB,
	nc *nats.Conn,
	services *services.Container,
	sessionStore kv.KeyValue,
) *cobra.Command {
	var (
		httpAddr       string
		httpsAddr      string
		allowedOrigins []string
	)

	command := &cobra.Command{
		Use:          "serve [domain(s)]",
		Args:         cobra.ArbitraryArgs,
		Short:        "Starts the HTTP server",
		SilenceUsage: true,
		RunE: func(command *cobra.Command, args []string) error {
			_, err := apis.Serve(apis.ServeConfig{
				HttpAddr:           httpAddr,
				HttpsAddr:          httpsAddr,
				AllowedOrigins:     allowedOrigins,
				ShowStartBanner:    true,
				CertificateDomains: args,
				Database:           db,
				NatsConn:           nc,
				Services:           services,
				DataDir:            config.DataDir,
				IsDev:              config.Dev,
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
		"0.0.0.0:8090",
		"TCP address to listen for the HTTP server\n(if domain args are specified - default to 0.0.0.0:80, otherwise - default to 127.0.0.1:8090)",
	)

	command.PersistentFlags().StringVar(
		&httpsAddr,
		"https",
		"",
		"TCP address to listen for the HTTPS server\n(if domain args are specified - default to 0.0.0.0:443, otherwise - default to empty)",
	)

	return command
}
