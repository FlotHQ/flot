import { useContext } from "react";
import { viewStackContext } from "./context";

export const useViewStack = () => {
    return useContext(viewStackContext);
};
