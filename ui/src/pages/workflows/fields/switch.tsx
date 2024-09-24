import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { Switch } from "~/components/ui/switch";

export function SwitchField(props: BaseFieldProps<boolean>) {
	return (
		<BaseFieldWrapper {...props}>
			<Switch
				id={props.id}
				checked={props.value}
				onCheckedChange={props.onChange}
			/>
		</BaseFieldWrapper>
	);
}
