package flot

import (
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
	"github.com/glebarez/sqlite"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/spf13/cobra"
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
}

func New() *Flot {
	baseDir, isUsingGoRun := inspectRuntime()
	dataDir := filepath.Join(baseDir, "flot_data")

	opts := &server.Options{
		JetStream: true,
		StoreDir:  dataDir + "/nats",
	}

	ns, _ := server.NewServer(opts)

	go ns.Start()

	if !ns.ReadyForConnections(5 * time.Second) {
		panic("not ready for connection")
	}

	db, err := gorm.Open(sqlite.Open(filepath.Join(dataDir, "data.db")), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	return NewWithConfig(Config{
		DefaultDev: isUsingGoRun,
		NatsURL:    ns.ClientURL(),
		Db:         db,
	})
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

	flot := &Flot{
		RootCmd: &cobra.Command{
			Use:     filepath.Base(os.Args[0]),
			Short:   "Flot CLI",
			Version: Version,
			FParseErrWhitelist: cobra.FParseErrWhitelist{
				UnknownFlags: true,
			},
			CompletionOptions: cobra.CompletionOptions{
				DisableDefaultCmd: true,
			},
		},
		devFlag:           config.DefaultDev,
		dataDirFlag:       config.DefaultDataDir,
		encryptionKeyFlag: config.DefaultEncryptionKey,
	}

	flot.RootCmd.SetErr(newErrWriter())

	flot.appWrapper = &appWrapper{core.NewBaseApp(core.BaseAppConfig{
		IsDev:         flot.devFlag,
		DataDir:       flot.dataDirFlag,
		EncryptionEnv: flot.encryptionKeyFlag,
		Nc:            nc,
		Db:            config.Db,
	})}

	return flot
}

func (f *Flot) Start() error {
	f.RootCmd.AddCommand(cmd.NewServeCommand(f.appWrapper, true))
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
