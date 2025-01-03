import { Input } from "~/components/ui/input";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";

export function NumberField(props: BaseFieldProps<number>) {
	const [value, setValue] = useState(props.value);

	const error = validateNumberField({ ...props, value });
	return (
		<BaseFieldWrapper {...props} error={error}>
			<Input
				type="number"
				placeholder={props.placeholder}
				value={value}
				onChange={(e) => setValue(e.target.valueAsNumber)}
			/>
		</BaseFieldWrapper>
	);
}

export function validateNumberField(props: BaseFieldProps<number>) {
	if (!props.optional && props.value === undefined) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
