package core

import (
	"github.com/nats-io/nats.go"
	"gorm.io/gorm"
)

type App interface {
	DataDir() string
	EncryptionKey() string
	Bootstrap() error
	Db() *gorm.DB
	NatsConn() *nats.Conn
	IsDev() bool
}
