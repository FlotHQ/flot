import { Input } from "~/components/ui/input";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";

type Props = {
	accept?: string;
	maxSize?: number;
	value?: { name: string; size: number };
} & BaseFieldProps<string>;

export function FileField(props: Props) {
	const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.files);
	};
	const error = validateFileField(props);

	return (
		<BaseFieldWrapper {...props} error={error}>
			<Input
				type="file"
				accept={props.accept}
				id={props.id}
				placeholder={props.placeholder}
				onChange={handleUpload}
			/>
		</BaseFieldWrapper>
	);
}

export function validateFileField(props: Props) {
	if (!props.optional && (props.value === undefined || props.value === "")) {
		return { type: "error", message: `${props.label} is required` };
	}

	if (props.maxSize) {
		const maxBytes = props.maxSize;
		if (props.value && props.value.size > maxBytes) {
			return {
				type: "error",
				message: `File size exceeded, max size is ${props.maxSize} KB`,
			};
		}
	}

	return;
}
