package lock

type Lock interface {
	Lock(key string) error
	Unlock(key string) error
	TryLock(key string) bool
}
