import { Input } from "~/components/ui/input";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";

export function DateField(props: BaseFieldProps<number>) {
	const error = validateDateField(props);

	return (
		<BaseFieldWrapper {...props} error={error}>
			<Input type="date" id={props.id} placeholder={props.placeholder} />
		</BaseFieldWrapper>
	);
}

export function validateDateField(props: BaseFieldProps<number>) {
	if (!props.optional && props.value === undefined) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
