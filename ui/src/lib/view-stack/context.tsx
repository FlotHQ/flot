import { createContext, type ReactNode } from "react";

export type ViewStackContext = {
	pushView: (view: ReactNode) => void;
	popView: () => void;
};

export const viewStackContext = createContext<ViewStackContext>(
	{} as ViewStackContext,
);
