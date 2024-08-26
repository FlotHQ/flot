import { useLayoutEffect } from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "~/lib/theme/provider";
import { UserProvider } from "~/lib/user/provider";

export default function App() {
	useLayoutEffect(() => {
		if (
			localStorage.theme === "dark" ||
			(!("theme" in localStorage) &&
				window.matchMedia("(prefers-color-scheme: dark)").matches)
		) {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		} else {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.add("light");
		}
	}, []);

	return (
		<UserProvider>
			<ThemeProvider>
				<Outlet />
			</ThemeProvider>
		</UserProvider>
	);
}
