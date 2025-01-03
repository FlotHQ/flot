import { useLayoutEffect } from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "~/lib/theme/provider";
import { UserProvider } from "~/lib/user/provider";

export default function App() {
	useLayoutEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		
		const handleChange = (e: MediaQueryListEvent) => {
			if (!('theme' in localStorage)) {
				if (e.matches) {
					document.documentElement.classList.add('dark');
					document.documentElement.classList.remove('light');
				} else {
					document.documentElement.classList.remove('dark');
					document.documentElement.classList.add('light');
				}
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	return (
		<UserProvider>
			<ThemeProvider>
				<Outlet />
			</ThemeProvider>
		</UserProvider>
	);
}
