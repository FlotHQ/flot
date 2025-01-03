package emitter

import (
	"time"

	"github.com/nats-io/nats.go"
)

type Msg interface {
	Data() []byte
	Headers() nats.Header
	Ack() error
	Nak() error
	NakWithDelay(delay time.Duration) error
	Term() error
}

type EmitOptions struct {
	IdempotencyKey string
}

type EmitOption = func(e *EmitOptions)

func (e *EmitOptions) WithIdempotencyKey(key string) {
	e.IdempotencyKey = key
}

type Emitter interface {
	Emit(event string, data []byte, opts ...EmitOption) error
	Request(event string, data []byte, timeout time.Duration) (Msg, error)
	Listen(event string, handler func(msg Msg)) error
}
