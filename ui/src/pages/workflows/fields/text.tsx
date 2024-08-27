import { Input } from "~/components/ui/input";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";

type Props = {
	pattern?: { value: string; message: string };
} & BaseFieldProps<string>;

export function TextField(props: Props) {
	const [value, setValue] = useState(props.value);
	const error = validateTextField({ ...props, value });

	return (
		<BaseFieldWrapper {...props} error={error}>
			<Input
				size={12}
				type="text"
				id={props.id}
				value={value}
				onChange={(e) => setValue(e.target.value)}
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
