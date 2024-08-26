import { createContext } from "react";

export function getTheme() {
	if (typeof window === "undefined") return "dark";
	const theme = localStorage.getItem("theme");
	if (!theme) {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	return theme as Theme;
}
export type Theme = "light" | "dark";

export const themeContext = createContext<{
	theme: Theme | undefined;
	setTheme: (theme: Theme) => void;
}>({
	theme: getTheme(),
	setTheme: () => {},
});
