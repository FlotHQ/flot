import type { Editor } from "@tiptap/core";
import { createContext } from "react";
import type { RefObject, FocusEventHandler } from "react";

export type FieldReferenceState = {
	selectedField: { nodeId: string; fieldKey: string } | null;
	selectField: (
		selectedField: { nodeId: string; fieldKey: string } | null,
	) => void;
	register: (
		nodeId: string,
		fieldKey: string,
	) => {
		onBlur: FocusEventHandler<HTMLElement>;
		onFocus: FocusEventHandler<HTMLElement>;
	};
	inject: (
		accessor: string,
		metadata?: {
			label: string;
			type?: string;
		},
	) => void;
	ref?: RefObject<HTMLDivElement>;
	setEditor: (editor: Editor | null) => void;
};

export const fieldReferenceContext = createContext<FieldReferenceState>(
	{} as FieldReferenceState,
);
