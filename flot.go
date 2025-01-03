package flot

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/fatih/color"
	"github.com/flothq/flot/cmd"
	"github.com/flothq/flot/core"
	"github.com/flothq/flot/internal/metrics"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var _ core.App = (*Flot)(nil)

var Version = "(untracked)"

type appWrapper struct {
	core.App
}

type Flot struct {
	*appWrapper
	devFlag           bool
	dataDirFlag       string
	encryptionKeyFlag string

	RootCmd *cobra.Command
}

type Config struct {
	DefaultDev           bool
	DefaultDataDir       string
	DefaultEncryptionKey string
	NatsURL              string
	Db                   *gorm.DB
	Ctx                  context.Context
}

func New() *Flot {

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	baseDir, isUsingGoRun := inspectRuntime()
	dataDir := filepath.Join(baseDir, "flot_data")

	opts := &server.Options{
		JetStream: true,
		StoreDir:  dataDir + "/nats",
	}

	ns, _ := server.NewServer(opts)

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		println("Gracefully shutting down...")
		ns.Shutdown()
		ns.WaitForShutdown()
		println("Exiting...")
		os.Exit(0)
	}()

	// ns.ConfigureLogger()

	go ns.Start()

	if !ns.ReadyForConnections(5 * time.Second) {
		panic("not ready for connection")
	}

	db, err := gorm.Open(sqlite.New(sqlite.Config{
		DriverName: "libsql",
		DSN:        "file:" + filepath.Join(dataDir, "flot.db?cache=shared&mode=rwc"),
	}), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	fmt.Println("OpenTelemetry tracing and metrics initialized successfully.")

	return NewWithConfig(Config{
		DefaultDev: isUsingGoRun,
		NatsURL:    ns.ClientURL(),
		Db:         db,
		Ctx:        ctx,
	})
}

type NatsWriter struct {
	nc      *nats.Conn
	subject string
}

func (w NatsWriter) Write(p []byte) (n int, err error) {
	err = w.nc.Publish(w.subject, p)
	if err != nil {
		return 0, err
	}
	return len(p), nil
}

func NewWithConfig(config Config) *Flot {
	if config.DefaultDataDir == "" {
		baseDir, _ := inspectRuntime()
		config.DefaultDataDir = filepath.Join(baseDir, "flot_data")
	}

	nc, err := nats.Connect(config.NatsURL)
	if err != nil {
		panic(err)
	}

	otelShutdown, err := metrics.SetupOTelSDK(config.Ctx, nc)
	if err != nil {
		panic(err)
	}

	defer func() {
		err = errors.Join(err, otelShutdown(context.Background()))
	}()

	rootCmd := &cobra.Command{
		Use:     filepath.Base(os.Args[0]),
		Short:   "Flot CLI",
		Version: Version,
		FParseErrWhitelist: cobra.FParseErrWhitelist{
			UnknownFlags: true,
		},
		CompletionOptions: cobra.CompletionOptions{
			DisableDefaultCmd: true,
		},
	}
	flot := &Flot{
		RootCmd:           rootCmd,
		devFlag:           config.DefaultDev,
		dataDirFlag:       config.DefaultDataDir,
		encryptionKeyFlag: config.DefaultEncryptionKey,
	}

	flot.appWrapper = &appWrapper{core.NewBaseApp(core.BaseAppConfig{
		IsDev:         flot.devFlag,
		DataDir:       flot.dataDirFlag,
		EncryptionEnv: flot.encryptionKeyFlag,
		Nc:            nc,
		Db:            config.Db,
		Ctx:           config.Ctx,
	})}

	rootCmd.PersistentPreRun = func(cmd *cobra.Command, args []string) {

		logLevel, err := zerolog.ParseLevel(cmd.Flag("log-level").Value.String())

		if err != nil {
			panic(fmt.Errorf("failed to parse log level: %w", err))
		}

		zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

		zerolog.SetGlobalLevel(logLevel)

		consoleWriter := zerolog.ConsoleWriter{Out: os.Stdout}
		consoleWriter.TimeFormat = zerolog.TimeFormatUnix
		consoleWriter.TimeLocation = time.FixedZone("UTC", 0)

		consoleWriter.FormatTimestamp = func(i interface{}) string {
			jsonNumber, _ := i.(json.Number)
			num, _ := jsonNumber.Int64()
			return time.Unix(num, 0).UTC().Format(time.RFC3339)
		}

		natsWriter := NatsWriter{nc: nc, subject: "logs"}
		multi := zerolog.MultiLevelWriter(consoleWriter, natsWriter)

		log.Logger = log.Output(multi)
	}

	return flot
}

func (f *Flot) Start() error {
	f.RootCmd.AddCommand(cmd.NewServeCommand(f.appWrapper, true))
	f.RootCmd.AddCommand(cmd.NewWorkerCommand(f.appWrapper, true))

	f.RootCmd.PersistentFlags().String("log-level", "error", "Log level (eg. info,warn,error,fatal,panic)")

	return f.Execute()
}

func (f *Flot) Execute() (err error) {

	done := make(chan bool, 1)

	// listen for interrupt signal to gracefully shutdown the application
	go func() {
		sigch := make(chan os.Signal, 1)
		signal.Notify(sigch, os.Interrupt, syscall.SIGTERM)
		<-sigch

		done <- true
	}()

	// execute the root command
	go func() {
		// note: leave to the commands to decide whether to print their error
		f.RootCmd.Execute()

		done <- true
	}()

	<-done

	return
}

func inspectRuntime() (baseDir string, withGoRun bool) {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// probably ran with go run
		withGoRun = true
		baseDir, _ = os.Getwd()
	} else {
		// probably ran with go build
		withGoRun = false
		baseDir = filepath.Dir(os.Args[0])
	}
	return
}

func newErrWriter() *coloredWriter {
	return &coloredWriter{
		w: os.Stderr,
		c: color.New(color.FgRed),
	}
}

type coloredWriter struct {
	w io.Writer
	c *color.Color
}

func (colored *coloredWriter) Write(p []byte) (n int, err error) {
	colored.c.SetWriter(colored.w)
	defer colored.c.UnsetWriter(colored.w)

	return colored.c.Print(string(p))
}
