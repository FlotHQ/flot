import { Label } from "~/components/ui/label";

export type BaseFieldProps<T> = {
	value: T;
	onChange: (value: T) => void;
	label: string;
	id: string;
	type: string;
	optional?: boolean;
	placeholder?: string;
	description?: string;
};

type Props = {
	children: React.ReactNode;
	label: string;
	description?: string;
	id: string;
	error?: { type: string; message: string };
};

export function BaseFieldWrapper(props: Props) {
	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor={props.id}>{props.label}</Label>
			{props.children}
			{props.description && (
				<p className="text-xs text-muted-foreground">{props.description}</p>
			)}
			{props.error && (
				<p className="text-xs text-destructive">{props.error.message}</p>
			)}
		</div>
	);
}
