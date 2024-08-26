import { useContext } from "react";
import { userContext } from "./context";

export function useUser() {
	return useContext(userContext);
}
