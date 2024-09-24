import { EditorContent, useEditor } from "@tiptap/react";
import { createExtensions } from "./extensions";
import { cn } from "~/lib/utils";
import { type HTMLAttributes, useEffect, useState } from "react";
import {
	type BaseFieldProps,
	BaseFieldWrapper,
} from "~/pages/workflows/fields/base";
import { cva } from "class-variance-authority";
import { useFieldReference } from "~/lib/fields/hooks";

const tagInputVariants = cva(
	"text-[14px] [&_.ProseMirror]:p-2 box-border [&_.ProseMirror]:py-[6.5px] bg-input-background border rounded-md border-input",
	{
		variants: {
			type: {
				// add the min hight to the child with .ProseMirror
				text: "min-h-[34px]",
				textarea: "min-h-20 [&_.ProseMirror]:min-h-20",
			},
		},
		defaultVariants: {
			type: "text",
		},
	},
);

type Props = {
	type: "text" | "textarea";
} & BaseFieldProps<string> &
	HTMLAttributes<HTMLDivElement>;

export function TagInput({ type, ...props }: Props) {
	const fieldRef = useFieldReference();
	const [content] = useState(props.value);

	const editor = useEditor({
		extensions: createExtensions({
			placeholder: props.placeholder,
		}),
		content,
		onBlur: ({ event }) => {
			if (fieldRef.ref) {
				if (
					event.relatedTarget &&
					(fieldRef.ref.current?.contains(event.relatedTarget as Node) ||
						fieldRef.ref.current === event.relatedTarget)
				) {
					editor?.commands.focus();
					return;
				}
			}
		},
		onFocus: () => {
			fieldRef.setEditor(editor);
			fieldRef.selectField({
				nodeId: props.nodeId,
				fieldKey: props.fieldKey,
			});
		},
		onUpdate(props) {
			console.log(props);
		},
	});

	useEffect(() => {
		console.log(fieldRef.selectedField);
		if (
			editor &&
			fieldRef.selectedField?.fieldKey === props.id &&
			fieldRef.selectedField?.nodeId === props.id
		) {
			fieldRef.setEditor(editor);
		}
	}, [editor, fieldRef.selectedField, props.id, fieldRef, fieldRef.setEditor]);

	const [isError] = useState(false);

	return (
		<BaseFieldWrapper id={`${props.fieldKey}-${props.nodeId}`} {...props}>
			<EditorContent
				{...props}
				placeholder={props.placeholder}
				onError={(e) => {
					console.error(e);
				}}
				className={cn(
					tagInputVariants({ type }),
					isError && "border-destructive",
				)}
				editor={editor}
			/>
		</BaseFieldWrapper>
	);
}
