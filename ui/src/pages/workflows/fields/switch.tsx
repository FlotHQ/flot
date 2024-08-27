import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { Switch } from "~/components/ui/switch";

export function SwitchField(props: BaseFieldProps<boolean>) {
	const error = validateSwitchField(props);
	return (
		<BaseFieldWrapper {...props} error={error}>
			<Switch
				id={props.id}
				checked={props.value}
				onCheckedChange={props.onChange}
			/>
		</BaseFieldWrapper>
	);
}

export function validateSwitchField(props: BaseFieldProps<boolean>) {
	if (!props.optional && props.value === undefined) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
