package core

import (
	"os"

	"github.com/nats-io/nats.go"
	"gorm.io/gorm"
)

type BaseApp struct {
	isDev         bool
	dataDir       string
	encryptionEnv string
	nc            *nats.Conn
	db            *gorm.DB
}

type BaseAppConfig struct {
	IsDev         bool
	DataDir       string
	EncryptionEnv string
	Nc            *nats.Conn
	Db            *gorm.DB
}

func NewBaseApp(config BaseAppConfig) *BaseApp {

	return &BaseApp{
		isDev:         config.IsDev,
		dataDir:       config.DataDir,
		encryptionEnv: config.EncryptionEnv,
		nc:            config.Nc,
		db:            config.Db,
	}
}

func (app *BaseApp) IsDev() bool {
	return app.isDev
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

func (app *BaseApp) Db() *gorm.DB {
	return app.db
}

func (app *BaseApp) Bootstrap() error {

	if err := os.MkdirAll(app.DataDir(), os.ModePerm); err != nil {
		return err
	}

	return nil
}
