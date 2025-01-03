import { useContext } from "react";
import { fieldReferenceContext } from "./context";

export function useFieldReference() {
	return useContext(fieldReferenceContext);
}
