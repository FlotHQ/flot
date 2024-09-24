import { createRef, type ReactNode, useState } from "react";
import type { FieldReferenceState } from "./context";
import { fieldReferenceContext } from "./context";
import type { FocusEventHandler } from "react";
import { toast } from "sonner";
import type { Editor } from "@tiptap/core";

type Props = {
	children: ReactNode;
};

export function FieldReferenceProvider(props: Props) {
	const [state, setState] =
		useState<FieldReferenceState["selectedField"]>(null);
	const ref = createRef<HTMLDivElement>();
	const [editor, setEditor] = useState<Editor | null>(null);

	const selectField = (
		selectedField: { nodeId: string; fieldKey: string } | null,
	) => {
		setState(selectedField);
	};

	const register = (nodeId: string, fieldKey: string) => {
		const onBlur: FocusEventHandler<HTMLElement> = (e) => {
			if (ref === undefined) {
				toast.error("Field reference panel is not mounted");
				return;
			}
			if (
				e.relatedTarget &&
				(ref.current?.contains(e.relatedTarget) ||
					ref.current === e.relatedTarget)
			) {
				e.currentTarget.focus();
				return;
			}
			console.log("related", e.relatedTarget);
			selectField(null);
			setEditor(null);
		};

		const onFocus: FocusEventHandler<HTMLElement> = () => {
			if (!nodeId) return;
			selectField({ nodeId, fieldKey });
		};

		return {
			onBlur,
			onFocus,
		};
	};

	const inject = (
		accessor: string,
		metadata?: {
			label: string;
			type?: string;
		},
	) => {
		if (!editor) {
			toast.error("Editor is not initialized");
			return;
		}

		editor
			.chain()
			.insertContent(
				`<flot-ref data-reference="${accessor}" data-label="${metadata?.label}" data-type="${metadata?.type}"></flot-ref>`,
			)
			.run();
	};
	return (
		<fieldReferenceContext.Provider
			value={{
				setEditor,
				inject,
				selectedField: state,
				selectField,
				ref,
				register,
			}}
		>
			{props.children}
		</fieldReferenceContext.Provider>
	);
}
