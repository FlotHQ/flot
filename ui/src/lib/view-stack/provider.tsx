import { type ReactNode, useState } from "react";
import { viewStackContext } from "./context";
import { Button } from "~/components/ui/button";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

export const ViewStackProvider = ({ children }: { children: ReactNode }) => {
	const [viewStack, setViewStack] = useState<ReactNode[]>([]);

	const pushView = (view: ReactNode) => {
		setViewStack((prev) => [...prev, view]);
	};

	const popView = () => {
		setViewStack((prev) => prev.slice(0, -1));
	};

	return (
		<viewStackContext.Provider
			value={{
				pushView,
				popView,
			}}
		>
			{viewStack.length > 0 ? (
				<>
					<Button size="sm" className="pl-1" variant="ghost" onClick={popView}>
						<ChevronLeftIcon className="w-4 h-4" /> <p>Back</p>
					</Button>
					{viewStack[viewStack.length - 1]}
				</>
			) : (
				children
			)}
		</viewStackContext.Provider>
	);
};
