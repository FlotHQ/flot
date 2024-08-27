import type { NodeProps } from "reactflow";
import type { NodeData } from "./types";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useTheme } from "~/lib/theme/hooks";
import { RelativeHandle } from "./handle";
import { Input } from "~/components/ui/input";
import { useRef, useState } from "react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "~/components/ui/popover";
import { Field } from "../fields";
import { ScrollArea } from "~/components/ui/scroll-area";

export function GeneralNode(props: NodeProps<NodeData>) {
	const { theme } = useTheme();

	const [input, setInput] = useState<Record<string, unknown>>({});
	const nameRef = useRef<HTMLInputElement>(null);
	const [nodeName] = useState(props.data.label);

	const handleFieldChange = <T,>(field: string, value: T) => {
		console.log(field, value);
		setInput((prev) => ({ ...prev, [field]: value }));
	};

	const fields = [
		{
			key: "name",
			label: "Name",
			type: "text",
			placeholder: "Enter a name",
			optional: true,
			description: "Enter a name",
		},
		{
			key: "description",
			label: "Description",
			type: "text",
			placeholder: "Enter a description",
		},
		{
			key: "email",
			label: "Email",
			type: "text",
			placeholder: "john.doe@example.com",
			pattern: {
				value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
				message: "Invalid email address",
			},
		},
		{
			key: "frequency",
			label: "Frequency",
			type: "number",
			placeholder: "Enter a frequency",
		},
		{
			key: "gender",
			label: "Gender",
			type: "select",
			options: [
				{ label: "Male", value: "male" },
				{ label: "Female", value: "female" },
				{ label: "Other", value: "other" },
			],
		},
		{
			key: "image",
			label: "Image",
			type: "file",
			accept: "image/*",
			maxSize: 1024 * 1024 * 2,
		},
		{ key: "isActive", label: "Is Active", type: "boolean" },
		{ key: "date", label: "Date", type: "date" },
		{
			key: "description",
			label: "Description",
			type: "textarea",
			optional: true,
			description: "Describe what kind of data you want to collect",
		},
	];

	return (
		<Popover modal>
			<PopoverTrigger>
				<div className="relative">
					{props.data.isTrigger && (
						<Badge
							variant="outline"
							className="-z-20 absolute bottom-[calc(100%-0.5px)] h-[21px] border-b-0 rounded-b-none font-medium right-4 bg-background"
						>
							Trigger
						</Badge>
					)}
					<Card
						style={{
							background:
								theme === "dark"
									? "radial-gradient(at top left,  #101010 60%, #0d0d0d)"
									: "radial-gradient(at left top, rgb(255 255 255) 60%, hsl(0,0%,98%))",
						}}
						className={cn(
							" bg-background border-foreground/15  hover:cursor-pointer z-50  rounded-lg   group relative w-[300px] border-[1px] p-0 ",
						)}
					>
						<CardHeader className="px-3 py-4 pb-4 h-full relative ">
							<div className="absolute  right-[15px]  z-50 top-0 h-full flex items-center ">
								{props.data.icon !== "return" && (
									<RelativeHandle
										className="pointer-events-auto"
										nodeId={props.id}
										type="source"
										handlePos="right"
										maxConnections={-1}
									/>
								)}
							</div>
							{!props.data.isTrigger && (
								<div className="absolute pointer-events-none z-50 -left-[9px] -top-[6px] h-full flex items-center ">
									<RelativeHandle
										maxConnections={-1}
										className="pointer-events-auto"
										nodeId={props.id}
										handlePos="left"
										type="target"
									/>
								</div>
							)}
							<div
								style={{ margin: 0 }}
								className="pl-2 h-full flex justify-between relative "
							>
								<div className="space-x-[11px] w-full flex items-center">
									<div className="h-[29px] w-[29px]">
										<img src={props.data.icon} alt="" />
									</div>

									<div className="w-full flex flex-col justify-center">
										<p className="text-foreground/80 w-max  -mb-[1px] font-[550] text-[12px] leading-none">
											{props.data.collection}
										</p>
										<div className="group flex items-center">
											<Input
												ref={nameRef}
												readOnly={true}
												defaultValue={nodeName}
												className={cn(
													"px-0 py-0 font-semibold text-[13px]  pointer-events-none  w-full max-w-[180px] border-y-0 h-5 rounded-none border-x-0 focus-visible:ring-0 shadow-none",
												)}
												size={12}
											/>
										</div>
									</div>
								</div>
							</div>
						</CardHeader>
					</Card>
				</div>
			</PopoverTrigger>
			<PopoverContent
				align="center"
				side="right"
				className="w-[400px] pl-3 pr-[1px] pt-4 pb-0 "
			>
				<ScrollArea className=" h-[500px] w-full pr-3 ">
					<div className="space-y-3 px-[1px] pb-8">
						{fields.map((field) => (
							<Field
								{...field}
								key={field.key}
								value={input[field.key]}
								onChange={(value: unknown) =>
									handleFieldChange(field.key, value)
								}
								label={field.label}
								id={field.key}
							/>
						))}
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
