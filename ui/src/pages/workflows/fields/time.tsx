import { Input } from "~/components/ui/input";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";

export function TimeField(props: BaseFieldProps<string>) {
	const [value, setValue] = useState(props.value);
	const error = validateDateField({ ...props, value });

	return (
		<BaseFieldWrapper {...props} error={error}>
			<Input
				type="time"
				id={props.id}
				placeholder={props.placeholder}
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
		</BaseFieldWrapper>
	);
}

export function validateDateField(props: BaseFieldProps<string>) {
	if (!props.optional && props.value === undefined) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
