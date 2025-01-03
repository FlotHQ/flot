import { BaseFieldWrapper } from "./base";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "~/components/ui/collapsible";
import { Field } from ".";
import type { GroupField as GroupFieldProps } from "./types";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function GroupField({ label, ...props }: GroupFieldProps) {
	const [value, setValue] = useState(props.value ?? {});
	const [open, setOpen] = useState(props.isInitiallyOpen ?? false);

	const [parent] = useAutoAnimate({ duration: 250, easing: "ease-in-out" });

	const handleFieldChange = <T,>(field: string, value: T) => {
		console.log(field, value);
		setValue((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<BaseFieldWrapper {...props}>
			<Collapsible open={open} onOpenChange={setOpen}>
				<CollapsibleTrigger className="text-sm pb-1 border-b-[1px] w-full flex justify-between items-center">
					<p>{label}</p>
					<ChevronDownIcon className={cn()} />
				</CollapsibleTrigger>
				<CollapsibleContent className="py-2 px-2 space-y-3" ref={parent}>
					{props.fields.map((field) => (
						<Field
							{...field}
							key={field.key}
							value={value[field.key]}
							onValueChange={(value: unknown) =>
								handleFieldChange(field.key, value)
							}
							label={field.label}
						/>
					))}
				</CollapsibleContent>
			</Collapsible>
		</BaseFieldWrapper>
	);
}
