import { useContext } from "react";
import { themeContext } from "./context";

export function useTheme() {
	return useContext(themeContext);
}
