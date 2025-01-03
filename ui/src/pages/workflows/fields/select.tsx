import { Label } from "~/components/ui/label";
import { BaseFieldWrapper, type BaseFieldProps } from "./base";
import { useState } from "react";
import {
	Command,
	CommandInput,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

type Props = {
	options: { label: string; value: string }[];
} & BaseFieldProps<string>;

export function SelectField(props: Props) {
	const [open, setOpen] = useState(false);

	const error = validateSelectField(props);

	const selected = props.options?.find((o) => o.value === props.value);

	return (
		<BaseFieldWrapper
			id={`${props.nodeId}-${props.fieldKey}`}
			{...props}
			error={error}
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					className={cn(
						"flex h-9 w-full items-center relative justify-between whitespace-nowrap rounded-md border border-foreground/15 bg-input-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
						error && "border-red-500",
					)}
				>
					{selected ? (
						<Label>{selected.label}</Label>
					) : (
						<Label className="text-muted-foreground text-xs">
							Select an option
						</Label>
					)}

					<SelectPrimitive.Icon asChild>
						<CaretSortIcon className="h-4 w-4 opacity-50 absolute right-2" />
					</SelectPrimitive.Icon>
				</PopoverTrigger>
				<PopoverContent className="p-0">
					<Command>
						<CommandInput placeholder="" className="h-9" />
						<CommandEmpty>No Results for "{props.value}"</CommandEmpty>
						<CommandList>
							<CommandGroup>
								{props.options.map((option) => (
									<CommandItem
										key={option.value}
										onSelect={() => {
											props.onValueChange?.(option.value);
											setOpen(false);
										}}
										value={option.value}
										className="hover:cursor-pointer"
									>
										{option.label}
										<CheckIcon
											className={cn(
												"ml-auto h-4 w-4",
												props.value === option.value
													? "opacity-100"
													: "opacity-0",
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</BaseFieldWrapper>
	);
}

export function validateSelectField(props: BaseFieldProps<string>) {
	if (!props.optional && (props.value === undefined || props.value === "")) {
		return { type: "error", message: `${props.label} is required` };
	}

	return;
}
