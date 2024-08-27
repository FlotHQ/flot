import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
    Command,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
} from "../components/ui/command";
import {
    CaretSortIcon,
    CheckIcon,
    PlusCircledIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Form } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import React from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/dialog";
import { FormField } from "../components/ui/form";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useUser } from "../lib/user/hooks";

type Props = {
    className?: string;
};

export function OrganizationSwitcher({ className }: Props) {
    const [open, setOpen] = useState(false);
    const { user } = useUser();

    const selectProject = (projectId: string) => {
        toast.error("Not implemented yet", {
            description: `${projectId} is not implemented yet`,
        });
    };

    const selectOrganization = (organizationId: string) => {
        toast.error("Not implemented yet", {
            description: `${organizationId} is not implemented yet`,
        });
    };

    const organizations: unknown[] = [];
    const projects: { id: string; name: string }[] = [];

    if (!organizations || !projects) {
        return <Skeleton className="w-[300px] h-10" />;
    }

    const groups = [
        {
            label: "Currently selected",
            organizations: [
                {
                    label: user.selectedOrganization.name ?? "",
                    value: user.selectedOrganization.id,
                },
            ],
        },
        {
            label: "Organizations",
            organizations: organizations
                .filter(
                    //@ts-expect-error TODO: fix types
                    (organization) => organization.id !== user.selectedOrganization.id,
                )

                .map((organization) => ({
                    //@ts-expect-error TODO: fix types
                    label: organization.name,
                    //@ts-expect-error TODO: fix types
                    value: organization.id,
                })),
        },
    ];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select an organization and project"
                    className={cn("w-[250px] h-10 justify-between rounded-lg", className)}
                >
                    <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                            src={`https://avatar.vercel.sh/${user.selectedProject.id}.png`}
                            alt={user.selectedProject.name}
                            className="grayscale"
                        />
                        <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-[3px] items-start">
                        <p className="text-xs">
                            {user.selectedOrganization.name}
                        </p>
                        <p className="text-[10px] leading-none">
                            {user.selectedProject.name}
                        </p>
                    </div>
                    <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        {groups.map((group) => (
                            <CommandGroup key={group.label} heading={group.label}>
                                {group.organizations.map((organization) => (
                                    <CommandItem
                                        key={organization.value}
                                        onSelect={() => {
                                            selectOrganization(organization.value);
                                            setOpen(false);
                                        }}
                                        className="text-sm"
                                    >
                                        <Avatar className="mr-2 h-5 w-5">
                                            <AvatarImage
                                                src={`https://avatar.vercel.sh/${organization.value}.png`}
                                                alt={organization.label}
                                                className="grayscale"
                                            />
                                            <AvatarFallback>SC</AvatarFallback>
                                        </Avatar>
                                        {organization.label}
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                user.selectedOrganization.id === organization.value
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                                {group.label === "Currently selected" && (
                                    <CommandGroup
                                        key="projects"
                                        heading={"Projects"}
                                        className="ml-[18px] pl-2 border-l-[1px] border-foreground/20"
                                    >
                                        <CommandList>
                                            {projects.map((project) => (
                                                <CommandItem
                                                    key={project.id}
                                                    className="hover:cursor-pointer"
                                                    onSelect={() => {
                                                        selectProject(project.id);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Avatar className="mr-2 h-5 w-5">
                                                        <AvatarImage
                                                            src={`https://avatar.vercel.sh/${project.id}.png`}
                                                            alt={project.name}
                                                            className="grayscale"
                                                        />
                                                        <AvatarFallback>SC</AvatarFallback>
                                                    </Avatar>
                                                    {project.name}
                                                    <CheckIcon
                                                        className={cn(
                                                            "ml-auto h-4 w-4",
                                                            user.selectedProject.id === project.id
                                                                ? "opacity-100"
                                                                : "opacity-0",
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                            <CreateProjectDialog />
                                        </CommandList>
                                    </CommandGroup>
                                )}
                            </CommandGroup>
                        ))}
                    </CommandList>
                    <CommandSeparator />
                    <CommandList>
                        <CommandGroup>
                            <CreateOrganizationDialog />
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

const newProjectSchema = z.object({
    name: z.string().min(3, {
        message: "Project name must be at least 3 characters long",
    }),
});

function CreateProjectDialog() {
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [isLoading] = useState(false);

    const newProjectForm = useForm<z.infer<typeof newProjectSchema>>({
        resolver: zodResolver(newProjectSchema),
        defaultValues: {
            name: "",
        },
    });

    function onProjectSubmit(values: z.infer<typeof newProjectSchema>) {
        toast.error("Not implemented yet", {
            description: `${values.name} is not implemented yet`,
        });
    }

    return (
        <Dialog
            open={showNewProjectDialog}
            onOpenChange={setShowNewProjectDialog}
        >
            <DialogTrigger className="w-full">
                <CommandItem>
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create Project
                </CommandItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create project</DialogTitle>
                    <DialogDescription>
                        Add a new project to manage products and customers.
                    </DialogDescription>
                </DialogHeader>
                <Form {...newProjectForm}>
                    <form onSubmit={newProjectForm.handleSubmit(onProjectSubmit)}>
                        <div>
                            <div className="space-y-4 py-2 pb-4">
                                <FormField
                                    control={newProjectForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <div>
                                            <Label htmlFor="name">Project name</Label>
                                            <Input id="name" placeholder="Acme Inc." {...field} />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                disabled={isLoading}
                                onClick={() => setShowNewProjectDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={isLoading}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

const CreateOrganizationDialog = () => {
    const [showNewOrganizationDialog, setShowNewOrganizationDialog] = React.useState(false);
    const [isLoading] = useState(false);
    const newOrganizationSchema = z.object({
        name: z.string(),
    });

    const newOrganizationForm = useForm<z.infer<typeof newOrganizationSchema>>({
        resolver: zodResolver(newOrganizationSchema),
        defaultValues: {
            name: "",
        },
    });

    function onOrganizationSubmit(values: z.infer<typeof newOrganizationSchema>) {
        toast.error("Not implemented yet", {
            description: `${values.name} is not implemented yet`,
        });
    }

    return (
        <Dialog
            open={showNewOrganizationDialog}
            onOpenChange={setShowNewOrganizationDialog}
        >
            <DialogTrigger className="w-full">
                <CommandItem>
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create Organization
                </CommandItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create organization</DialogTitle>
                    <DialogDescription>
                        Add a new organization to manage your projects.
                    </DialogDescription>
                </DialogHeader>
                <Form {...newOrganizationForm}>
                    <form onSubmit={newOrganizationForm.handleSubmit(onOrganizationSubmit)}>
                        <div>
                            <div className="space-y-4 py-2 pb-4">
                                <FormField
                                    control={newOrganizationForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <div>
                                            <Label htmlFor="name">Organization name</Label>
                                            <Input id="name" placeholder="Acme Inc." {...field} />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                disabled={isLoading}
                                onClick={() => setShowNewOrganizationDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={isLoading}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
