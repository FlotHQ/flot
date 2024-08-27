/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseFieldProps } from "./base";
import { FileField } from "./file";
import { NumberField } from "./number";
import { SelectField } from "./select";
import { TextField } from "./text";
import { DateField } from "./date";
import { SwitchField } from "./switch";
import { TextAreaField } from "./textarea";

const fields = {
	text: TextField,
	number: NumberField,
	select: SelectField,
	file: FileField,
	date: DateField,
	boolean: SwitchField,
	textarea: TextAreaField,
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function Field(props: BaseFieldProps<any>) {
	const FieldComponent = fields[props.type as keyof typeof fields];

	if (!FieldComponent) {
		return <p>Unknown field type</p>;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return <FieldComponent {...(props as any)} />;
}
