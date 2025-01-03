package core

import (
	"os"

	"github.com/flothq/flot/internal/engine"
	"github.com/nats-io/nats.go"
	"gorm.io/gorm"
)

type BaseApp struct {
	isDev         bool
	dataDir       string
	encryptionEnv string
	db            *gorm.DB
	engine        *engine.WorkflowEngine
	nc            *nats.Conn
	manifestStore *nats.KeyValue
}

type BaseAppConfig struct {
	IsDev         bool
	DataDir       string
	EncryptionEnv string
	Db            *gorm.DB
	Engine        *engine.WorkflowEngine
	Nc            *nats.Conn
	ManifestStore nats.KeyValue
}

func NewBaseApp(config BaseAppConfig) *BaseApp {

	return &BaseApp{
		isDev:         config.IsDev,
		dataDir:       config.DataDir,
		encryptionEnv: config.EncryptionEnv,
		db:            config.Db,
		engine:        config.Engine,
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

func (app *BaseApp) Db() *gorm.DB {
	return app.db
}

func (app *BaseApp) Engine() *engine.WorkflowEngine {
	return app.engine
}

func (app *BaseApp) ManifestStore() *nats.KeyValue {
	return app.manifestStore
}

func (app *BaseApp) Nats() *nats.Conn {
	return app.nc
}

func (app *BaseApp) Bootstrap() error {

	if err := os.MkdirAll(app.DataDir(), os.ModePerm); err != nil {
		return err
	}

	return nil
}
