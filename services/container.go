package services

type Container struct {
	auth    AuthService
	user    UserService
	profile ProfileService
}

func NewContainer(
	auth AuthService,
	user UserService,
	profile ProfileService,
) *Container {
	return &Container{
		auth:    auth,
		user:    user,
		profile: profile,
	}
}

func (c *Container) Auth() AuthService {
	return c.auth
}

func (c *Container) User() UserService {
	return c.user
}

func (c *Container) Profile() ProfileService {
	return c.profile
}
