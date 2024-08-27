import { Input } from "~/components/ui/input";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";

export function NumberField(props: BaseFieldProps<number>) {
	const error = validateNumberField(props);
	return (
		<BaseFieldWrapper {...props} error={error}>
			<Input type="number" id={props.id} placeholder={props.placeholder} />
		</BaseFieldWrapper>
	);
}

export function validateNumberField(props: BaseFieldProps<number>) {
	if (!props.optional && props.value === undefined) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
