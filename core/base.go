package core

import (
	"context"
	"os"

	"github.com/nats-io/nats.go"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type BaseApp struct {
	isDev         bool
	dataDir       string
	encryptionEnv string
	nc            *nats.Conn
	db            *gorm.DB
	logger        *zap.Logger
	ctx           context.Context
}

type BaseAppConfig struct {
	IsDev         bool
	DataDir       string
	EncryptionEnv string
	Nc            *nats.Conn
	Db            *gorm.DB
	Logger        *zap.Logger
	Ctx           context.Context
}

func NewBaseApp(config BaseAppConfig) *BaseApp {

	return &BaseApp{
		config.IsDev,
		config.DataDir,
		config.EncryptionEnv,
		config.Nc,
		config.Db,
		config.Logger,
		config.Ctx,
	}
}

func (app *BaseApp) IsDev() bool {
	return app.isDev
}

func (app *BaseApp) SetLogger(logger *zap.Logger) {
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

func (app *BaseApp) Logger() *zap.Logger {
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
