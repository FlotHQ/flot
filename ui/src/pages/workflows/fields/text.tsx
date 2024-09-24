import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";

import { useFieldReference } from "~/lib/fields/hooks";
import { useNodeId } from "reactflow";
import { TagInput } from "~/components/tag-input/tag";

type Props = {
	pattern?: { value: string; message: string };
} & BaseFieldProps<string>;

export function TextField(props: Props) {
	const [value, setValue] = useState(props.value);
	const error = validateTextField({ ...props, value });
	const nodeId = useNodeId();

	const { register } = useFieldReference();

	if (!nodeId) {
		return;
	}

	return (
		<BaseFieldWrapper {...props} error={error}>
			<TagInput
				key={nodeId}
				type="text"
				fieldKey={props.fieldKey}
				nodeId={nodeId}
				{...register(nodeId, props.fieldKey)}
				value={value}
				onValueChange={(value) => {
					console.log(value);
					setValue(value);
				}}
				placeholder={props.placeholder}
			/>
		</BaseFieldWrapper>
	);
}

export function validateTextField(props: Props) {
	console.log(props);
	// check if value is not optional and is empty
	if (!props.optional && (props.value === undefined || props.value === "")) {
		return { type: "error", message: `${props.label} is required` };
	}

	// check if value has a pattern property and does not match the pattern
	if (props.pattern?.value && !props.value.match(props.pattern.value)) {
		return { type: "error", message: props.pattern.message };
	}

	return;
}
