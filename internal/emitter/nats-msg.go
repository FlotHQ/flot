package emitter

import (
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

type NatsMsg struct {
	m *nats.Msg
}

type JetstreamMsg struct {
	m jetstream.Msg
}

func (m *JetstreamMsg) Data() []byte {
	return m.m.Data()
}

func (m *JetstreamMsg) SetData(data []byte) {}

func (m *JetstreamMsg) Headers() nats.Header {
	return m.m.Headers()
}

func (m *JetstreamMsg) Ack() error {
	return m.m.Ack()
}

func (m *JetstreamMsg) Nak() error {
	return m.m.Nak()
}

func (m *JetstreamMsg) NakWithDelay(delay time.Duration) error {
	return m.m.NakWithDelay(delay)
}

func (m *JetstreamMsg) Term() error {
	return m.m.Term()
}

func (m *NatsMsg) Data() []byte {
	return m.m.Data
}

func (m *NatsMsg) SetData(data []byte) {
	m.m.Data = data
}

func (m *NatsMsg) Headers() nats.Header {
	return m.m.Header
}

func (m *NatsMsg) Ack() error {
	return m.m.Ack()
}

func (m *NatsMsg) Nak() error {
	return m.m.Nak()
}

func (m *NatsMsg) NakWithDelay(delay time.Duration) error {
	return m.m.NakWithDelay(delay)
}

func (m *NatsMsg) Term() error {
	return m.m.Term()
}

func NewNatsMsg(subject string) *NatsMsg {
	nats := nats.NewMsg(subject)
	msg := &NatsMsg{
		m: nats,
	}
	return msg
}

func NewJetstreamMsg(msg jetstream.Msg) JetstreamMsg {
	return JetstreamMsg{
		m: msg,
	}
}
