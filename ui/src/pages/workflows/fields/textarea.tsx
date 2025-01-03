import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";
import { useNodeId } from "reactflow";
import { TagInput } from "~/components/tag-input/tag";
import { useFieldReference } from "~/lib/fields/hooks";

type Props = BaseFieldProps<string>;

export function TextAreaField(props: Props) {
	const [value, setValue] = useState(props.value);
	const error = validateTextAreaField({ ...props, value });
	const nodeId = useNodeId();

	const { register } = useFieldReference();

	if (!nodeId) {
		return;
	}
	return (
		<BaseFieldWrapper 
			id={`${props.fieldKey}-${nodeId}`}
		{...props} error={error}>
			<TagInput
				type="textarea"
				fieldKey={props.fieldKey}
				nodeId={nodeId}
				id={`${props.fieldKey}-${nodeId}`}
				value={value}
				{...register(nodeId, props.fieldKey)}
				onValueChange={(value) => setValue(value)}
				placeholder={props.placeholder}
			/>
		</BaseFieldWrapper>
	);
}

export function validateTextAreaField(props: Props) {
	if (!props.optional && (props.value === undefined || props.value === "")) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
