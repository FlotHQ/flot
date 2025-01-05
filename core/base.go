package core

import (
	"context"
	"os"

	"github.com/nats-io/nats.go"
	"github.com/rs/zerolog"
	"gorm.io/gorm"
)

type BaseApp struct {
	isDev         bool
	dataDir       string
	encryptionEnv string
	nc            *nats.Conn
	db            *gorm.DB
	logger        zerolog.Logger
	ctx           context.Context
}

type BaseAppConfig struct {
	IsDev         bool
	DataDir       string
	EncryptionEnv string
	Nc            *nats.Conn
	Db            *gorm.DB
	Logger        zerolog.Logger
	Ctx           context.Context
}

func NewBaseApp(config BaseAppConfig) *BaseApp {
	app := &BaseApp{
		isDev:         config.IsDev,
		dataDir:       config.DataDir,
		encryptionEnv: config.EncryptionEnv,
		nc:            config.Nc,
		db:            config.Db,
		logger:        config.Logger,
		ctx:           config.Ctx,
	}

	return app
}

func (app *BaseApp) IsDev() bool {
	return app.isDev
}

func (app *BaseApp) SetLogger(logger zerolog.Logger) {
	app.logger = logger
}

func (app *BaseApp) DataDir() string {
	return app.dataDir
}

func (app *BaseApp) EncryptionKey() string {
	return app.encryptionEnv
}

func (app *BaseApp) NatsConn() *nats.Conn {
	return app.nc
}

func (app *BaseApp) Logger() zerolog.Logger {
	return app.logger
}
func (app *BaseApp) Db() *gorm.DB {
	return app.db
}

func (app *BaseApp) Bootstrap() error {

	if err := os.MkdirAll(app.DataDir(), os.ModePerm); err != nil {
		return err
	}

	return nil
}
