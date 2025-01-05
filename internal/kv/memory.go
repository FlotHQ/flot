package kv

import (
	"errors"
	"sync"
)

type MemoryStore struct {
	mu    sync.RWMutex
	store map[string][]byte
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		store: make(map[string][]byte),
	}
}

func (m *MemoryStore) Get(key string) ([]byte, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if value, ok := m.store[key]; ok {
		return value, nil
	}
	return nil, errors.New("key not found")
}

func (m *MemoryStore) Put(key string, value []byte) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.store[key] = value
	return nil
}

func (m *MemoryStore) Delete(key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.store, key)
	return nil
}
