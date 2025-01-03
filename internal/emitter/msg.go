package emitter

import (
	"time"

	"github.com/nats-io/nats.go"
)

type MsgImpl struct {
	data    []byte
	headers nats.Header
	Subject string
}

func NewMsg(subject string) *MsgImpl {
	return &MsgImpl{}
}

func (m *MsgImpl) Data() []byte {
	return m.data
}

func (m *MsgImpl) SetData(data []byte) {
	m.data = data
}

func (m *MsgImpl) Headers() nats.Header {
	return m.headers
}

func (m *MsgImpl) Ack() error {
	return nil
}

func (m *MsgImpl) Nak() error {
	return nil
}

func (m *MsgImpl) NakWithDelay(delay time.Duration) error {
	return nil
}

func (m *MsgImpl) Term() error {
	return nil
}
