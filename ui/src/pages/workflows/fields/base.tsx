import { Label } from "~/components/ui/label";

export type BaseFieldProps<T> = {
	value: T;
	onValueChange: (value: T) => void;
	label?: string;
	fieldKey: string;
	type: string;
	nodeId: string;
	key: string;
	optional?: boolean;
	placeholder?: string;
	description?: string;
};

type Props = {
	children: React.ReactNode;
	label?: string;
	description?: string;
	fieldKey: string;
	nodeId: string;
	error?: { type: string; message: string };
	collapsable?: boolean;
};

export function BaseFieldWrapper(props: Props) {
	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			{props.label && (
				<Label htmlFor={`${props}-${props.nodeId}`}>{props.label}</Label>
			)}
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
