import { useState } from "react";
import { getTheme, themeContext } from "./context";
import type { Theme } from "./context";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setInnerTheme] = useState<"light" | "dark">(getTheme());

	const handleSetTheme = (theme: Theme) => {
		const root = document.documentElement;
		root.classList.remove(theme === "dark" ? "light" : "dark");
		root.classList.add(theme);
		localStorage.setItem("theme", theme);
		setInnerTheme(theme);
	};

	return (
		<themeContext.Provider
			value={{
				theme,
				setTheme: handleSetTheme,
			}}
		>
			{children}
		</themeContext.Provider>
	);
};
