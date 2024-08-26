import { userContext } from "./context";
import type { User } from "./context";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const user: User | undefined = {
		id: "1",
		name: "John Doe",
		email: "john.doe@example.com",
		avatar: "https://avatars.githubusercontent.com/u/132486?v=4",
		selectedOrganization: { id: "1", name: "Personal" },
		selectedProject: { id: "2", name: "Project" },
	};

	function logout() {
		console.log("logout");
	}

	if (!user) {
		return <div>Loading...</div>;
	}
	return (
		<userContext.Provider value={{ user, logout }}>
			{children}
		</userContext.Provider>
	);
};
