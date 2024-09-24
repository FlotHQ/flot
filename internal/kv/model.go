package kv

type KeyValue interface {
	Get(key string) ([]byte, error)
	Put(key string, value []byte) error
}
