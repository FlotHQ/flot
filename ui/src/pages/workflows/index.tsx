import { Input } from "~/components/ui/input";
import { Search, PlusIcon, Activity, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
import { Badge } from "~/components/ui/badge";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "~/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { motion, AnimatePresence } from "motion/react";
import { useUrlParams } from "~/hooks/useUrlParams/useUrlParams";
import { UrlParamsProvider } from "~/hooks/useUrlParams";

dayjs.extend(relativeTime);

const HealthTimeLineOptions = ["healthy", "warning", "error", "inactive"];

type Workflow = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  services: {
    name: string;
    icon: string;
  }[];
  lastRan: number; // Unix timestamp
  avgRunTime: number;
  healthTimeline: ("healthy" | "warning" | "error" | "inactive")[];
  tags: string[];
};

const randomHealthTimeline = () => {
  return Array.from(
    { length: 5 },
    () => HealthTimeLineOptions[Math.floor(Math.random() * HealthTimeLineOptions.length)]
  ) as ("healthy" | "warning" | "error" | "inactive")[];
};

const workflows: Workflow[] = [
  {
    id: "wf001",
    title: "Customer Onboarding",
    description: "Process for welcoming and setting up new customers",
    enabled: true,
    services: [
      { name: "Gmail", icon: "gmail.com" },
      { name: "Slack", icon: "slack.com" },
      { name: "Zoom", icon: "zoom.us" },
    ],
    lastRan: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    avgRunTime: 100 + Math.random() * 100,
    healthTimeline: randomHealthTimeline(),
    tags: ["development", "communication"],
  },
  {
    id: "wf002",
    title: "Sales Pipeline Management",
    description: "Track and manage sales opportunities",
    enabled: true,
    services: [
      { name: "Salesforce", icon: "salesforce.com" },
      { name: "HubSpot", icon: "hubspot.com" },
      { name: "LinkedIn", icon: "linkedin.com" },
    ],
    lastRan: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    avgRunTime: 100 + Math.random() * 100,
    healthTimeline: randomHealthTimeline(),
    tags: ["sales", "management"],
  },
  {
    id: "wf003",
    title: "Employee Onboarding",
    description: "Process for integrating new employees",
    enabled: true,
    services: [
      { name: "Workday", icon: "workday.com" },
      { name: "Google Workspace", icon: "google.com" },
      { name: "Asana", icon: "asana.com" },
    ],
    lastRan: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    avgRunTime: 100 + Math.random() * 100,
    healthTimeline: randomHealthTimeline(),
    tags: ["human-resources", "onboarding"],
  },
  {
    id: "wf004",
    title: "Content Marketing",
    description: "Create and distribute marketing content",
    enabled: true,
    services: [
      { name: "WordPress", icon: "wordpress.org" },
      { name: "Canva", icon: "canva.com" },
      { name: "Hootsuite", icon: "hootsuite.com" },
    ],
    lastRan: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    avgRunTime: 100 + Math.random() * 100,
    healthTimeline: randomHealthTimeline(),
    tags: ["marketing", "content-creation"],
  },
  {
    id: "wf005",
    title: "IT Support Ticketing",
    description: "Manage and resolve IT support requests",
    enabled: true,
    services: [
      { name: "Jira", icon: "atlassian.com" },
      { name: "Zendesk", icon: "zendesk.com" },
      { name: "Microsoft Teams", icon: "microsoft.com" },
    ],
    lastRan: Date.now() - 6 * 24 * 60 * 60 * 1000,
    avgRunTime: 100 + Math.random() * 100,
    healthTimeline: randomHealthTimeline(),
    tags: ["it", "support"],
  },
  {
    id: "wf006",
    title: "Product Development",
    description: "Coordinate product design and development",
    enabled: true,
    services: [
      { name: "GitHub", icon: "github.com" },
      { name: "Figma", icon: "figma.com" },
      { name: "Trello", icon: "trello.com" },
    ],
    lastRan: Date.now() - 8 * 24 * 60 * 60 * 1000,
    avgRunTime: 100 + Math.random() * 100,
    healthTimeline: randomHealthTimeline(),
    tags: ["development", "product-design"],
  },
];

const renderHealthTimeline = (healthTimeline: ("healthy" | "warning" | "error" | "inactive")[]) => {
  const baseClasses = "w-[6.5px] h-[6.5px] rounded-full";
  const colorClasses = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    inactive: "bg-gray-500",
  };

  return (
    <div className="flex space-x-0.5">
      {healthTimeline.map((status, i) => (
        <div key={i} className={`${baseClasses} ${colorClasses[status]}`} />
      ))}
    </div>
  );
};

function NewTagDialog({ onAddTag }: { onAddTag: (tag: string) => void }) {
  const [newTag, setNewTag] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(newTag.trim().toLowerCase());
      setNewTag("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge variant="outline" className="cursor-pointer border-dashed h-[22px] mt-[3px]">
          <PlusIcon className="h-[8px] w-[8px] mr-1" />
          Add Tag
        </Badge>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag name"
            className="mt-2"
          />
          <Button type="submit" className="w-full">
            Create Tag
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Header() {
  const { search, tags, setParams } = useUrlParams<{ search: string; tags: string[] }>();
  const [searchTerm, setSearchTerm] = useState(search);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (deferredSearchTerm == search) {
      return;
    }
    setParams({ search: deferredSearchTerm });
  }, [deferredSearchTerm, setParams]);

  useEffect(() => {
    console.log("selectedTags", selectedTags, tags);

    setParams({ tags: selectedTags });
  }, [selectedTags, tags, setParams]);

  const allTags = useMemo(() => Array.from(new Set(["a", "b", ...customTags])), [customTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleAddTag = (newTag: string) => {
    if (!allTags.includes(newTag)) {
      setCustomTags((prev) => [...prev, newTag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setTagToDelete(null);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2>Workflows</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage and monitor your automated processes</p>
      </motion.div>
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search workflows"
                className="pl-9 py-1 text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <PlusIcon className="mr-1 h-4 w-4" /> New
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ScrollArea className="max-h-[60px]">
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <ContextMenu key={tag}>
                  <ContextMenuTrigger>
                    <Badge
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setTagToDelete(tag)}
                    >
                      Delete Tag
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
              <NewTagDialog onAddTag={handleAddTag} />
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This will remove it from all workflows.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tagToDelete && handleRemoveTag(tagToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type WorkflowCardProps = {
  workflow: Workflow;
  index: number;
};

function ManageTagsDialog({
  workflow,
  allTags,
  onUpdateTags,
  open,
  onOpenChange,
}: {
  workflow: Workflow;
  allTags: string[];
  onUpdateTags: (workflowId: string, tags: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>(workflow.tags);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    onUpdateTags(workflow.id, selectedTags);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-1 mt-4 whitespace-nowrap">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Button onClick={handleSave} className="w-full mt-4">
            Save Changes
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function WorkflowCard({ workflow, index }: WorkflowCardProps) {
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUpdateTags = (workflowId: string, newTags: string[]) => {
    console.log("Updating tags for workflow", workflowId, newTags);
  };

  const handleDelete = () => {
    console.log("Deleting workflow", workflow.id);
    setDeleteDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.45 + index * 0.1,
        ease: "easeOut",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className="overflow-hidden rounded-lg transition-colors duration-200 hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <Link to={`/workflows/${workflow.id}`} className="flex-1">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">{workflow.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{workflow.description}</p>
                    <div className="flex items-center space-x-1 text-xs pt-1">
                      {workflow.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-1 py-0 text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
                <Switch checked={workflow.enabled} className="ml-2" />
              </CardHeader>
              <CardContent className="bg-muted/30 py-2 px-4 flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  {workflow.services.map((service) => (
                    <span key={service.name} className="bg-background rounded-lg">
                      <img
                        className="w-[20px] h-[20px] rounded-lg"
                        src={`https://cdn.brandfetch.io/${service.icon}/w/400/h/400`}
                        alt={service.name}
                      />
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-muted-foreground flex items-center">
                    {renderHealthTimeline(workflow.healthTimeline)}
                  </span>
                  <span className="text-muted-foreground flex items-center justify-end w-20">
                    <Activity className="h-3 w-3 mr-1" /> {dayjs(workflow.lastRan).fromNow()}
                  </span>
                  <span className="text-muted-foreground flex items-center justify-end w-[88px]">
                    <Clock className="h-3 w-3 mr-1" /> Avg: {Math.round(workflow.avgRunTime)} ms
                  </span>
                </div>
              </CardContent>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => setManageTagsOpen(true)}>Manage Tags</ContextMenuItem>
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Workflow
            </ContextMenuItem>
          </ContextMenuContent>

          <ManageTagsDialog
            workflow={workflow}
            allTags={Array.from(new Set(workflows.flatMap((w) => w.tags)))}
            onUpdateTags={handleUpdateTags}
            open={manageTagsOpen}
            onOpenChange={setManageTagsOpen}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this workflow? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ContextMenu>
      </motion.div>
    </motion.div>
  );
}

function WorkflowList() {
  const { search } = useUrlParams<{ search: string; tags: string[] }>();

  const filteredWorkflows = workflows.filter((workflow) => workflow.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-2">
      {filteredWorkflows.map((workflow, index) => (
        <WorkflowCard key={workflow.id} workflow={workflow} index={index} />
      ))}
    </div>
  );
}

export function Component() {
  return (
    <UrlParamsProvider defaultValues={{ search: "", tags: [] }}>
      <section className="px-4 sm:px-6 lg:px-8 w-full gap-4 flex flex-col pt-12  mx-auto">
        <Header />
        <ScrollArea className="h-[calc(100vh-325px)] relative -mr-3 pr-3">
          <AnimatePresence mode="wait">
            <WorkflowList />
          </AnimatePresence>
        </ScrollArea>
      </section>
    </UrlParamsProvider>
  );
}
