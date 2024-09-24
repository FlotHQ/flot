/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseFieldProps } from "./base";
import { FileField } from "./file";
import { NumberField } from "./number";
import { SelectField } from "./select";
import { TextField } from "./text";
import { DateField } from "./date";
import { SwitchField } from "./switch";
import { TextAreaField } from "./textarea";
import { DateTimeField } from "./datetime";
import { TimeField } from "./time";
import { GroupField } from "./group";
import { QueryField } from "./query/query-field";

const fields = {
	text: TextField,
	number: NumberField,
	select: SelectField,
	file: FileField,
	date: DateField,
	datetime: DateTimeField,
	time: TimeField,
	boolean: SwitchField,
	textarea: TextAreaField,
	group: GroupField,
	query: QueryField,
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
