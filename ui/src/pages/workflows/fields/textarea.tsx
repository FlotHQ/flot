import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";
import { Textarea } from "~/components/ui/textarea";

type Props = BaseFieldProps<string>;

export function TextAreaField(props: Props) {
	const [value, setValue] = useState(props.value);
	const error = validateTextAreaField({ ...props, value });

	return (
		<BaseFieldWrapper {...props} error={error}>
			<Textarea
				id={props.id}
				value={value}
				onChange={(e) => setValue(e.target.value)}
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
