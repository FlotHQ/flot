package emitter

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

type NatsEmitter struct {
	stream jetstream.Stream
	js     jetstream.JetStream
	nc     *nats.Conn
}

func NewNatsEmitter(stream jetstream.Stream, js jetstream.JetStream, nc *nats.Conn) (*NatsEmitter, error) {

	return &NatsEmitter{
		stream: stream,
		js:     js,
		nc:     nc,
	}, nil
}

func (e *NatsEmitter) Emit(subject string, data []byte, opts ...EmitOption) error {
	nMsg := nats.NewMsg(subject)
	options := &EmitOptions{}
	for _, opt := range opts {
		opt(options)
	}

	nMsg.Data = data

	if options.IdempotencyKey != "" {
		nMsg.Header.Add("Nats-Msg-Id", options.IdempotencyKey)
	}

	_, err := e.js.PublishMsg(context.Background(), nMsg)
	return err
}

func (e *NatsEmitter) Request(subject string, data []byte, timeout time.Duration) (Msg, error) {
	println(fmt.Sprintf("Requesting %s", subject))
	msg, err := e.nc.Request(subject, data, timeout)
	if err != nil {
		return nil, err
	}

	return &NatsMsg{msg}, nil
}

func (e *NatsEmitter) Listen(subject string, handler func(Msg)) error {

	name := strings.ReplaceAll(subject, "*", "")
	name = strings.ReplaceAll(name, ">", "")
	name = strings.ReplaceAll(name, ".", "")

	cons, err := e.stream.CreateOrUpdateConsumer(context.Background(), jetstream.ConsumerConfig{
		Name:          name,
		Durable:       name,
		FilterSubject: subject,
		BackOff:       []time.Duration{time.Second, time.Second * 2, time.Second * 5},
	})

	if err != nil {
		return err
	}

	ch := make(chan Msg, 5000)
	for i := 0; i < 5000; i++ {
		go func() {
			for msg := range ch {
				handler(msg)
			}
		}()
	}

	_, err = cons.Consume(func(msg jetstream.Msg) {
		ch <- msg
	})

	return err
}
