package core

import (
	"github.com/flothq/flot/internal/engine"
	"github.com/nats-io/nats.go"
	"gorm.io/gorm"
)

type App interface {
	DataDir() string
	EncryptionKey() string
	Bootstrap() error
	Db() *gorm.DB
	Engine() *engine.WorkflowEngine
	IsDev() bool
	ManifestStore() *nats.KeyValue
	Nats() *nats.Conn
}
