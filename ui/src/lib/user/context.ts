import { createContext } from "react";

export type User = {
	id: string;
	name: string;
	email: string;
	avatar: string;
	selectedOrganization: { id: string; name: string };
	selectedProject: { id: string; name: string };
};

type UserContext = {
	user: User;
	logout: () => void;
};

export const userContext = createContext<UserContext>({} as UserContext);
