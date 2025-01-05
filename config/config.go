package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type FlotConfig struct {
	Dev            bool
	DataDir        string
	EncryptionKey  string
	NatsConfig     NatsConfig
	DatabaseConfig DatabaseConfig
}

type NatsConfig struct {
	URL       string
	StoreDir  string
	JetStream bool
}

type DatabaseConfig struct {
	DriverName string
	DSN        string
}

func NewDefaultConfig() FlotConfig {
	baseDir, isUsingGoRun := inspectRuntime()
	dataDir := filepath.Join(baseDir, "flot_data")

	return FlotConfig{
		Dev:     isUsingGoRun,
		DataDir: dataDir,
		NatsConfig: NatsConfig{
			JetStream: true,
			StoreDir:  filepath.Join(dataDir, "nats"),
		},
		DatabaseConfig: DatabaseConfig{
			DriverName: "libsql",
			DSN:        fmt.Sprintf("file:%s?cache=shared&mode=rwc", filepath.Join(dataDir, "flot.db")),
		},
	}
}

func inspectRuntime() (baseDir string, withGoRun bool) {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		withGoRun = true
		baseDir, _ = os.Getwd()
	} else {
		withGoRun = false
		baseDir = filepath.Dir(os.Args[0])
	}
	return
}
