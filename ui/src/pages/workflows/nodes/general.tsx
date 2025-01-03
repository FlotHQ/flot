import type { NodeData } from "./types";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useTheme } from "~/lib/theme/hooks";
import { RelativeHandle } from "./handle";
import { Input } from "~/components/ui/input";
import { useEffect, useRef, useState } from "react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverAnchor,
	PopoverArrow,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useFieldReference } from "~/lib/fields/hooks";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { NodeProps } from "reactflow";
import type { Field as FieldType } from "../fields/types";
import { Field } from "../fields";
import { ViewStackProvider } from "~/lib/view-stack/provider";

export function GeneralNode(props: NodeProps<NodeData>) {
	const { theme } = useTheme();

	const [input, setInput] = useState<Record<string, unknown>>({});
	const nameRef = useRef<HTMLInputElement>(null);
	const [nodeName] = useState(props.data.label);

	const handleFieldChange = <T,>(field: string, value: T) => {
		setInput((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const fields = [
		{
			key: "query",
			label: "Query",
			type: "query",
			placeholder: "Modify filters",
			description: "Filter the records",
		},
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
		{
			key: "group",
			label: "Group",
			type: "group",
			fields: [
				{ key: "date1", label: "Date", type: "date", description: "testing" },
				{ key: "date2", label: "Date", type: "datetime" },
				{ key: "date3", label: "Date", type: "time" },
			],
		},
		{
			key: "description2",
			label: "Description",
			type: "textarea",
			optional: true,
			description: "Describe what kind of data you want to collect",
		},
	] as FieldType[];

	return (
		<Popover modal>
			<PopoverTrigger>
				<div className="relative ">
					{props.data.isTrigger && (
						<Badge
							variant="outline"
							className="-z-20 absolute bottom-[calc(100%-0.5px)] h-[21px] border-b-0 rounded-b-none font-medium right-4"
						>
							Trigger
						</Badge>
					)}

					<Card
						className={cn(
							"hover:cursor-pointer z-50  rounded-lg   group relative w-[300px] border-[1px] p-0 ",
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
									<img
										className="object-cover h-[29px] w-[29px]  rounded-sm"
										src={`https://cdn.brandfetch.io/${props.data.icon}/icon/theme/${theme}/fallback/transparent/h/200/w/200`}
										alt={props.data.collection}
									/>

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
													"px-0 py-0 bg-transparent font-semibold text-[13px]  pointer-events-none  w-full max-w-[180px] border-y-0 h-5 rounded-none border-x-0 focus-visible:ring-0 shadow-none",
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

			<FieldsPanel
				input={input}
				nodeId={props.id}
				fields={fields}
				handleFieldChange={handleFieldChange}
			/>
		</Popover>
	);
}

type FieldsPanelProps = {
	fields: FieldType[];
	nodeId: string;
	input: Record<string, unknown>;
	handleFieldChange: <T>(field: string, value: T) => void;
};

function FieldsPanel(props: FieldsPanelProps) {
	const { selectedField, ref, inject } = useFieldReference();

	const reactflowPaneRef = useRef<HTMLDivElement>();

	useEffect(() => {
		//TODO: fix this later
		const pane = document.querySelector(".react-flow__pane") as HTMLDivElement;
		if (!pane) {
			toast.error("pane not found");
			return;
		}
		reactflowPaneRef.current = pane;
	}, []);

	const fieldPanelRef = useRef<HTMLDivElement>(null);

	return (
		<PopoverContent
			align="center"
			autoFocus={false}
			collisionBoundary={
				reactflowPaneRef.current ? [reactflowPaneRef.current] : []
			}
			side="right"
			ref={fieldPanelRef}
			className="w-[400px] pl-3 pr-[1px] pt-4 pb-0 "
		>
			<PopoverArrow className="fill-foreground/20" />
			<ScrollArea className=" h-[500px] w-full pr-3 ">
				<div className="space-y-3 px-[1px] pb-8">
					<ViewStackProvider>
						{props.fields.map((field) => (
							<Popover
								key={field.key}
								open={!!selectedField && selectedField.fieldKey === field.key}
							>
								<PopoverAnchor>
									<Field
										{...field}
										key={field.key}
										nodeId={props.nodeId}
										value={props.input[field.key]}
										onValueChange={(value: unknown) =>
											props.handleFieldChange(field.key, value)
										}
										label={field.label}
										fieldKey={field.key}
									/>
								</PopoverAnchor>
								<PopoverPrimitive.Portal container={fieldPanelRef.current}>
									<PopoverPrimitive.Content
										ref={ref}
										sideOffset={16}
										autoFocus={false}
										side="left"
										align="start"
										alignOffset={18}
										collisionBoundary={
											reactflowPaneRef.current
												? [reactflowPaneRef.current, fieldPanelRef.current]
												: []
										}
										collisionPadding={{
											left: -200,
										}}
										sticky="always"
										className={cn(
											"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
										)}
									>
										<Button
											autoFocus={false}
											onFocus={() => toast.success("on focus")}
											onClick={() => {
												inject("user.name", {
													label: "Name",
													type: "text",
												});
											}}
										>
											Click me
										</Button>
									</PopoverPrimitive.Content>
								</PopoverPrimitive.Portal>
							</Popover>
						))}
					</ViewStackProvider>
				</div>
			</ScrollArea>
		</PopoverContent>
	);
}
