package lock

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/nats-io/nats.go/jetstream"
)

type NatsLock struct {
	key             string
	js              jetstream.JetStream
	kv              jetstream.KeyValue
	pollingInterval time.Duration
	timeout         time.Duration
}

type NatsLockOption func(*NatsLock)

func WithPollingInterval(interval time.Duration) NatsLockOption {
	return func(l *NatsLock) {
		l.pollingInterval = interval
	}
}

func WithTimeout(timeout time.Duration) NatsLockOption {
	return func(l *NatsLock) {
		l.timeout = timeout
	}
}

func NewNatsLock(key string, js jetstream.JetStream, opts ...NatsLockOption) (*NatsLock, error) {

	lock := &NatsLock{
		key: key,
		js:  js,
	}

	for _, opt := range opts {
		opt(lock)
	}

	if lock.pollingInterval == 0 {
		lock.pollingInterval = 20 * time.Millisecond
	}

	if lock.timeout == 0 {
		lock.timeout = 10 * time.Second
	}

	kv, err := js.CreateOrUpdateKeyValue(context.Background(), jetstream.KeyValueConfig{
		Bucket: fmt.Sprintf("locks-%s", key),
		TTL:    time.Duration(lock.timeout),
	})

	if err != nil {
		return nil, err
	}

	lock.kv = kv

	return lock, nil
}

func (l *NatsLock) Lock(key string) error {
	ctx, cancel := context.WithTimeout(context.Background(), l.timeout)
	defer cancel()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			_, err := l.kv.Create(ctx, key, nil)
			if err != nil {
				if errors.Is(err, jetstream.ErrKeyExists) {
					println("lock already exists", key)
					select {
					case <-ctx.Done():
						return ctx.Err()
					case <-time.After(l.pollingInterval):

					}
				} else {
					println("error creating lock", err.Error())
				}

			} else {
				return nil
			}
		}
	}
}

func (l *NatsLock) Unlock(key string) error {
	err := l.kv.Delete(context.Background(), key)
	if err != nil {
		return err
	}

	return nil
}

func (l *NatsLock) TryLock(key string) bool {
	_, err := l.kv.Create(context.Background(), key, nil)
	if err != nil {
		if !errors.Is(err, jetstream.ErrKeyExists) {
			return false
		}
	}
	return true
}
