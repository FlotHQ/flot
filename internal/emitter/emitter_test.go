package emitter

import (
	"context"
	"testing"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

func setup() *nats.Conn {
	opts := &server.Options{
		JetStream: true,
	}

	// Initialize new server with options
	ns, err := server.NewServer(opts)

	if err != nil {
		panic(err)
	}

	// Start the server via goroutine
	go ns.Start()

	// Wait for server to be ready for connections
	if !ns.ReadyForConnections(4 * time.Second) {
		panic("not ready for connection")
	}

	// Connect to server
	nc, err := nats.Connect(ns.ClientURL())

	if err != nil {
		panic(err)
	}

	return nc
}

func TestEmitter(t *testing.T) {

	nc := setup()
	tests := map[string]func(t *testing.T, emitter Emitter){
		"emit": _TestEmit,
	}

	js, err := jetstream.New(nc)
	if err != nil {
		panic(err)
	}

	stream, err := js.CreateOrUpdateStream(context.Background(), jetstream.StreamConfig{
		Name:      "test",
		Subjects:  []string{"test.*"},
		Retention: jetstream.WorkQueuePolicy,
	})

	if err != nil {
		panic(err)
	}

	natsEmitter, _ := NewNatsEmitter(stream, js, nc)

	for name, test := range tests {
		t.Run(name, func(t *testing.T) {
			test(t, natsEmitter)
		})
	}
}

func _TestEmit(t *testing.T, emitter Emitter) {
	callCount := make(map[string]int)

	handler1 := func(msg Msg) { callCount["handler1"]++ }

	err := emitter.Listen("test.*", handler1)
	if err != nil {
		panic(err)
	}

	err = emitter.Emit("test.specific", nil)
	if err != nil {
		t.Fatalf("Emit returned unexpected error: %v", err)
	}

}
