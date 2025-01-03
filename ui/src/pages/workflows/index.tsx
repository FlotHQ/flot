import { Input } from "~/components/ui/input";
import { Search, PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { CSS } from "@dnd-kit/utilities";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { GripVertical } from "lucide-react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
	Form,
} from "~/components/ui/form";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
} from "~/components/ui/context-menu";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type Workflow = {
	id: string;
	title: string;
	description: string;
	services: {
		name: string;
		// apple.com, figma.com
		icon: string;
	}[];
	updatedAt: number;
};

const workflows: Workflow[] = [
	{
		id: "wf001",
		title: "Customer Onboarding",
		description: "Process for welcoming and setting up new customers",
		services: [
			{ name: "Gmail", icon: "gmail.com" },
			{ name: "Slack", icon: "slack.com" },
			{ name: "Zoom", icon: "zoom.us" },
		],
		updatedAt: Date.now(),
	},
	{
		id: "wf002",
		title: "Sales Pipeline Management",
		description: "Track and manage sales opportunities",
		services: [
			{ name: "Salesforce", icon: "salesforce.com" },
			{ name: "HubSpot", icon: "hubspot.com" },
			{ name: "LinkedIn", icon: "linkedin.com" },
		],
		updatedAt: Date.now() - 86400000, // 1 day ago
	},
	{
		id: "wf003",
		title: "Employee Onboarding",
		description: "Process for integrating new employees",
		services: [
			{ name: "Workday", icon: "workday.com" },
			{ name: "Google Workspace", icon: "google.com" },
			{ name: "Asana", icon: "asana.com" },
		],
		updatedAt: Date.now() - 172800000, // 2 days ago
	},
	{
		id: "wf004",
		title: "Content Marketing",
		description: "Create and distribute marketing content",
		services: [
			{ name: "WordPress", icon: "wordpress.org" },
			{ name: "Canva", icon: "canva.com" },
			{ name: "Hootsuite", icon: "hootsuite.com" },
		],
		updatedAt: Date.now() - 345600000, // 4 days ago
	},
	{
		id: "wf005",
		title: "IT Support Ticketing",
		description: "Manage and resolve IT support requests",
		services: [
			{ name: "Jira", icon: "atlassian.com" },
			{ name: "Zendesk", icon: "zendesk.com" },
			{ name: "Microsoft Teams", icon: "microsoft.com" },
		],
		updatedAt: Date.now() - 518400000, // 6 days ago
	},
	{
		id: "wf006",
		title: "Product Development",
		description: "Coordinate product design and development",
		services: [
			{ name: "GitHub", icon: "github.com" },
			{ name: "Figma", icon: "figma.com" },
			{ name: "Trello", icon: "trello.com" },
		],
		updatedAt: Date.now() - 691200000, // 8 days ago
	},
	{
		id: "wf001",
		title: "Customer Onboarding",
		description: "Process for welcoming and setting up new customers",
		services: [
			{ name: "Gmail", icon: "gmail.com" },
			{ name: "Slack", icon: "slack.com" },
			{ name: "Zoom", icon: "zoom.us" },
		],
		updatedAt: Date.now(),
	},
	{
		id: "wf002",
		title: "Sales Pipeline Management",
		description: "Track and manage sales opportunities",
		services: [
			{ name: "Salesforce", icon: "salesforce.com" },
			{ name: "HubSpot", icon: "hubspot.com" },
			{ name: "LinkedIn", icon: "linkedin.com" },
		],
		updatedAt: Date.now() - 86400000, // 1 day ago
	},
	{
		id: "wf003",
		title: "Employee Onboarding",
		description: "Process for integrating new employees",
		services: [
			{ name: "Workday", icon: "workday.com" },
			{ name: "Google Workspace", icon: "google.com" },
			{ name: "Asana", icon: "asana.com" },
		],
		updatedAt: Date.now() - 172800000, // 2 days ago
	},
	{
		id: "wf004",
		title: "Content Marketing",
		description: "Create and distribute marketing content",
		services: [
			{ name: "WordPress", icon: "wordpress.org" },
			{ name: "Canva", icon: "canva.com" },
			{ name: "Hootsuite", icon: "hootsuite.com" },
		],
		updatedAt: Date.now() - 345600000, // 4 days ago
	},
	{
		id: "wf005",
		title: "IT Support Ticketing",
		description: "Manage and resolve IT support requests",
		services: [
			{ name: "Jira", icon: "atlassian.com" },
			{ name: "Zendesk", icon: "zendesk.com" },
			{ name: "Microsoft Teams", icon: "microsoft.com" },
		],
		updatedAt: Date.now() - 518400000, // 6 days ago
	},
	{
		id: "wf006",
		title: "Product Development",
		description: "Coordinate product design and development",
		services: [
			{ name: "GitHub", icon: "github.com" },
			{ name: "Figma", icon: "figma.com" },
			{ name: "Trello", icon: "trello.com" },
		],
		updatedAt: Date.now() - 691200000, // 8 days ago
	},
	{
		id: "wf001",
		title: "Customer Onboarding",
		description: "Process for welcoming and setting up new customers",
		services: [
			{ name: "Gmail", icon: "gmail.com" },
			{ name: "Slack", icon: "slack.com" },
			{ name: "Zoom", icon: "zoom.us" },
		],
		updatedAt: Date.now(),
	},
	{
		id: "wf002",
		title: "Sales Pipeline Management",
		description: "Track and manage sales opportunities",
		services: [
			{ name: "Salesforce", icon: "salesforce.com" },
			{ name: "HubSpot", icon: "hubspot.com" },
			{ name: "LinkedIn", icon: "linkedin.com" },
		],
		updatedAt: Date.now() - 86400000, // 1 day ago
	},
	{
		id: "wf003",
		title: "Employee Onboarding",
		description: "Process for integrating new employees",
		services: [
			{ name: "Workday", icon: "workday.com" },
			{ name: "Google Workspace", icon: "google.com" },
			{ name: "Asana", icon: "asana.com" },
		],
		updatedAt: Date.now() - 172800000, // 2 days ago
	},
	{
		id: "wf004",
		title: "Content Marketing",
		description: "Create and distribute marketing content",
		services: [
			{ name: "WordPress", icon: "wordpress.org" },
			{ name: "Canva", icon: "canva.com" },
			{ name: "Hootsuite", icon: "hootsuite.com" },
		],
		updatedAt: Date.now() - 345600000, // 4 days ago
	},
	{
		id: "wf005",
		title: "IT Support Ticketing",
		description: "Manage and resolve IT support requests",
		services: [
			{ name: "Jira", icon: "atlassian.com" },
			{ name: "Zendesk", icon: "zendesk.com" },
			{ name: "Microsoft Teams", icon: "microsoft.com" },
		],
		updatedAt: Date.now() - 518400000, // 6 days ago
	},
	{
		id: "wf006",
		title: "Product Development",
		description: "Coordinate product design and development",
		services: [
			{ name: "GitHub", icon: "github.com" },
			{ name: "Figma", icon: "figma.com" },
			{ name: "Trello", icon: "trello.com" },
		],
		updatedAt: Date.now() - 691200000, // 8 days ago
	},
];

function SearchBar() {
	return (
		<div className="relative flex-1 md:grow-0 w-full">
			<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search..."
				className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
			/>
		</div>
	);
}

function Header() {
	return (
		<div className="space-y-4 w-full xl:max-w-screen-md mx-auto">
			<div>
				<h2>Workflows</h2>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed</p>
			</div>
			<div className="flex justify-between items-center w-full flex-col md:flex-row gap-2">
				<SearchBar />
				<Button className="w-full md:w-auto">
					<PlusIcon className="w-4 h-4 mr-2" />
					New Workflow
				</Button>
			</div>
		</div>
	);
}

type WorkflowCardProps = {
	workflow: Workflow;
};

function WorkflowCard({ workflow }: WorkflowCardProps) {
	return (
		<Card
			className={cn(
				"transition-all duration-200 flex flex-col justify-between",
			)}
		>
			<CardHeader>
				<Link to={`/workflows/${workflow.id}`} className="hover:underline">
					<CardTitle>{workflow.title}</CardTitle>
					<CardDescription>{workflow.description}</CardDescription>
				</Link>
			</CardHeader>
			<CardContent className="flex justify-between items-end">
				<div className="flex flex-wrap gap-[6px]">
					{workflow.services.map((service) => (
						<img
							key={service.name}
							className="w-5 h-5 rounded-sm"
							src={`https://cdn.brandfetch.io/${service.icon}/w/400/h/400`}
							alt={service.name}
						/>
					))}
				</div>
				<Label
					onClick={(e) => e.stopPropagation()}
					className="flex items-center gap-2 hover:cursor-pointer"
				>
					Enabled
					<Switch />
				</Label>
			</CardContent>
		</Card>
	);
}

type Folder = {
	id: string;
	name: string;
	order: number;
	workflowCount: number;
};

type FolderCardProps = {
	folder: Folder;
	deleteFolder: (id: string) => void;
	renameFolder: (id: string, newName: string) => void;
};

function FolderCard(props: FolderCardProps) {
	const [isEditable, setIsEditable] = useState(false);
	const cardTitleRef = useRef<HTMLDivElement>(null);
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.folder.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const handleDeleteFolder = () => {
		if (props.folder.workflowCount > 0) {
			toast.error("Folder cannot be deleted because it has workflows", {
				richColors: true,
			});
			return;
		}
		props.deleteFolder(props.folder.id);
	};

	const handleRenameFolder = (newName: string) => {
		setIsEditable(false);
		props.renameFolder(props.folder.id, newName);
	};

	const handleEditName = () => {
		setIsEditable(true);
		setTimeout(() => {
			if (cardTitleRef.current) {
				cardTitleRef.current.focus();
				const range = document.createRange();
				const selection = window.getSelection();
				if (!selection) return;
				range.selectNodeContents(cardTitleRef.current);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}, 50);
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<Card
					ref={setNodeRef}
					style={style}
					className="hover:cursor-pointer group hover:border-blue-700 transition-colors duration-200 p-2 flex justify-between items-center"
				>
					<CardTitle
						ref={cardTitleRef}
						contentEditable={isEditable}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleRenameFolder(e.currentTarget.textContent || "");
							}
						}}
						onBlur={(e) =>
							handleRenameFolder(e.currentTarget.textContent || "")
						}
						className={cn("text-sm w-full outline-none")}
					>
						{props.folder.name}
					</CardTitle>
					<GripVertical
						{...attributes}
						{...listeners}
						className="hidden group-hover:block w-4 h-4 outline-none hover:cursor-grab active:cursor-grabbing text-muted-foreground"
					/>
				</Card>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={handleEditName}>
					<Pencil1Icon className="w-4 h-4 mr-2 text-muted-foreground" />
					Rename
				</ContextMenuItem>
				<ContextMenuItem onClick={handleDeleteFolder} className="text-red-500">
					<TrashIcon className="w-4 h-4 mr-2" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}

const newFolderSchema = z.object({
	name: z
		.string()
		.min(1, "Must be at least 1 character")
		.max(20, "Name must be less than 20 characters"),
});

function NewFolderDialog(props: {
	children: React.ReactNode;
	onSubmit: (
		data: z.infer<typeof newFolderSchema>,
	) => Promise<string | undefined> | undefined;
}) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	const form = useForm<z.infer<typeof newFolderSchema>>({
		resolver: zodResolver(newFolderSchema),
		defaultValues: {
			name: "",
		},
	});

	const handleSubmit = async (data: z.infer<typeof newFolderSchema>) => {
		const error = await props.onSubmit(data);
		if (error) {
			setError(error);
			return;
		}
		setOpen(false);
		form.reset();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>{props.children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Folder</DialogTitle>
					<DialogDescription>
						Create a new folder to organize your workflows
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{error && <FormMessage>{error}</FormMessage>}
						<Button type="submit" className="w-full mt-4">
							Create folder
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function FolderPanel() {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
	const [folders, setFolders] = useState<Folder[]>([
		{
			id: "folder002",
			name: "Folder 2",
			workflowCount: 8,
			order: 2,
		},
		{
			id: "folder001",
			name: "Folder 1",
			workflowCount: 2,
			order: 1,
		},
		{
			id: "folder003",
			name: "Folder 1",
			workflowCount: 0,
			order: 3,
		},
	]);

	const handleDragEnd = (event: DragEndEvent) => {
		enableAnimations(false);
		const { active, over } = event;

		if (active.id !== over?.id) {
			setFolders((folders) => {
				const oldIndex = folders.findIndex((folder) => folder.id === active.id);
				const newIndex = folders.findIndex((folder) => folder.id === over?.id);
				return arrayMove(folders, oldIndex, newIndex);
			});
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		enableAnimations(true);
	}, [folders.length, enableAnimations]);

	const handleNewFolder = async (data: z.infer<typeof newFolderSchema>) => {
		setFolders((folders) => [
			{
				id: crypto.randomUUID(),
				name: data.name,
				workflowCount: 0,
				order: folders.length + 1,
			},
			...folders,
		]);
		return undefined;
	};

	const handleDeleteFolder = (id: string) => {
		setFolders((folders) => folders.filter((folder) => folder.id !== id));
	};

	const handleRenameFolder = (id: string, newName: string) => {
		setFolders((folders) =>
			folders.map((folder) =>
				folder.id === id ? { ...folder, name: newName } : folder,
			),
		);
	};
	return (
		<Card className="w-full xl:max-w-[360px] ml-auto">
			<CardHeader className="flex-row justify-between">
				<div>
					<CardTitle>Folders</CardTitle>
					<CardDescription className="max-w-xs text-wrap">
						Organize your workflows
					</CardDescription>
				</div>
				<NewFolderDialog onSubmit={handleNewFolder}>
					<Button variant="outline" size="sm">
						<PlusIcon className="w-4 h-4 mr-2" />
						New Folder
					</Button>
				</NewFolderDialog>
			</CardHeader>
			<CardContent>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={folders}
						strategy={verticalListSortingStrategy}
					>
						<div ref={parent} className="flex flex-col gap-2">
							{folders.map((folder) => (
								<FolderCard
									deleteFolder={handleDeleteFolder}
									renameFolder={handleRenameFolder}
									key={folder.id}
									folder={folder}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			</CardContent>
		</Card>
	);
}

export function Component() {
	return (
		<section className="px-4 sm:px-6 lg:px-8 w-full mt-24  gap-4 flex flex-col">
			<Header />
			<div className=" flex items-start flex-wrap gap-2 justify-start w-full">
				<div className="w-full h-full flex-1 ">
					<FolderPanel />
				</div>
				<ScrollArea
					type="scroll"
					className="h-[calc(100vh-400px)] xl:h-[calc(100vh-300px)] xl:max-w-screen-md w-full"
				>
					<div className="flex flex-col gap-2">
						{workflows.map((workflow) => (
							<WorkflowCard key={workflow.id} workflow={workflow} />
						))}
					</div>
				</ScrollArea>
				<div className="w-full bg-blue-300 flex-1" />
			</div>
		</section>
	);
}
