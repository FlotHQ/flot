package flot

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/flothq/flot/cmd"
	"github.com/flothq/flot/config"
	"github.com/flothq/flot/internal/kv"
	"github.com/flothq/flot/services"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Flot struct {
	config   config.FlotConfig
	nats     *NatsServer
	natsConn *nats.Conn
	db       *gorm.DB
	RootCmd  *cobra.Command
}

type NatsServer struct {
	server *server.Server
	url    string
}

func New() *Flot {
	config := config.NewDefaultConfig()
	return NewWithConfig(config)
}

func NewWithConfig(config config.FlotConfig) *Flot {
	flot := &Flot{
		config:  config,
		RootCmd: createRootCommand(),
	}

	if err := flot.initialize(); err != nil {
		panic(err)
	}

	return flot
}

func (f *Flot) initialize() error {
	if err := f.initNats(); err != nil {
		return fmt.Errorf("failed to initialize NATS: %w", err)
	}

	if err := f.initDatabase(); err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}

	f.initCommandFlags()
	return nil
}

func (f *Flot) initNats() error {
	opts := &server.Options{
		JetStream: f.config.NatsConfig.JetStream,
		StoreDir:  f.config.NatsConfig.StoreDir,
	}

	ns, err := server.NewServer(opts)
	if err != nil {
		return fmt.Errorf("failed to create NATS server: %w", err)
	}

	go ns.Start()

	if !ns.ReadyForConnections(5 * time.Second) {
		return fmt.Errorf("NATS server not ready for connections")
	}

	f.nats = &NatsServer{
		server: ns,
		url:    ns.ClientURL(),
	}

	nc, err := nats.Connect(f.nats.url)
	if err != nil {
		return fmt.Errorf("failed to connect to NATS: %w", err)
	}
	f.natsConn = nc

	go f.handleNatsShutdown()
	return nil
}

func (f *Flot) initDatabase() error {
	db, err := gorm.Open(sqlite.New(sqlite.Config{
		DriverName: f.config.DatabaseConfig.DriverName,
		DSN:        f.config.DatabaseConfig.DSN,
	}), &gorm.Config{})

	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	f.db = db
	return nil
}

func (f *Flot) initCommandFlags() {
	f.RootCmd.PersistentFlags().String("log-level", "error", "Log level (eg. info,warn,error,fatal,panic)")
}

func (f *Flot) handleNatsShutdown() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	<-c
	f.Shutdown()
}

func (f *Flot) Shutdown() {
	log.Info().Msg("Gracefully shutting down...")

	if f.natsConn != nil {
		f.natsConn.Close()
	}

	if f.nats != nil && f.nats.server != nil {
		f.nats.server.Shutdown()
		f.nats.server.WaitForShutdown()
	}

	log.Info().Msg("Shutdown complete")
	os.Exit(0)
}

func createRootCommand() *cobra.Command {
	return &cobra.Command{
		Use:     filepath.Base(os.Args[0]),
		Short:   "Flot CLI",
		Version: "0.0.1",
		FParseErrWhitelist: cobra.FParseErrWhitelist{
			UnknownFlags: true,
		},
		CompletionOptions: cobra.CompletionOptions{
			DisableDefaultCmd: true,
		},
	}
}

func (f *Flot) Start() error {
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()

	js, err := jetstream.New(f.natsConn)
	if err != nil {
		return fmt.Errorf("failed to create JetStream context: %w", err)
	}

	sessionKv, err := js.CreateOrUpdateKeyValue(context.Background(), jetstream.KeyValueConfig{
		Bucket: "sessions",
	})
	if err != nil {
		return fmt.Errorf("failed to create session KV: %w", err)
	}

	sessionStore := kv.NewNatsKv(sessionKv)

	userService := services.NewUserService(f.db, logger)
	authService := services.NewAuthService(userService, sessionStore, logger)
	profileService := services.NewProfileService(userService)

	services := services.NewContainer(authService, userService, profileService)

	f.RootCmd.AddCommand(cmd.NewServeCommand(f.config, f.db, f.natsConn, services, sessionStore))

	return f.Execute()
}

func (f *Flot) Execute() error {
	return f.RootCmd.Execute()
}

func (f *Flot) NatsURL() string {
	return f.nats.url
}

func (f *Flot) IsDev() bool {
	return f.config.Dev
}

func (f *Flot) DataDir() string {
	return f.config.DataDir
}

func (f *Flot) EncryptionKey() string {
	return f.config.EncryptionKey
}

func (f *Flot) Bootstrap() error {
	return nil
}

func (f *Flot) NatsConn() *nats.Conn {
	return f.natsConn
}
