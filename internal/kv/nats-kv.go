package kv

import (
	"context"

	"github.com/nats-io/nats.go/jetstream"
)

type NatsKeyValue struct {
	kv jetstream.KeyValue
}

func NewNatsKv(kv jetstream.KeyValue) *NatsKeyValue {
	return &NatsKeyValue{kv}
}

func (k *NatsKeyValue) Get(key string) ([]byte, error) {
	result, err := k.kv.Get(context.Background(), key)
	if err != nil {
		return nil, err
	}

	return result.Value(), nil
}

func (k *NatsKeyValue) Put(key string, value []byte) error {
	_, err := k.kv.Put(context.Background(), key, value)
	return err
}
