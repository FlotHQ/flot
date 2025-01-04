import { CartesianGrid, Line, LineChart, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useState } from "react";
import { Button, buttonVariants } from "~/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { motion } from "motion/react";

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <h3>
        Welcome back, <span className="font-bold">John Doe</span>
      </h3>
    </motion.header>
  );
}

const chartConfig = {
  executions: {
    label: "Executions",
    color: "hsl(var(--chart-1))",
  },
  successful: {
    label: "Successful",
    color: "#22c55e",
  },
  failed: {
    label: "Failed",
    color: "#ef4444",
  },
  timeout: {
    label: "Timeout",
    color: "#f97316",
  },
  count: {
    label: "Count",
    color: "hsl(var(--chart-2))",
  },
};

const executionTrendData = [
  { date: "Mon", executions: 145 },
  { date: "Tue", executions: 232 },
  { date: "Wed", executions: 186 },
  { date: "Thu", executions: 256 },
  { date: "Fri", executions: 198 },
  { date: "Sat", executions: 134 },
  { date: "Sun", executions: 167 },
];

const executionStatusData = [
  { name: "Successful", value: 845, fill: "var(--color-successful)" },
  { name: "Failed", value: 124, fill: "var(--color-failed)" },
  { name: "Timeout", value: 42, fill: "var(--color-timeout)" },
];

const recentExecutions: Execution[] = [
  {
    id: 1,
    workflowId: "wf001",
    version: 5,
    name: "Daily Backup",
    status: "success",
    time: "2 minutes ago",
    log: null,
    duration: "45 seconds",
    trigger: "Schedule",
    nextScheduled: "Tomorrow at 2:00 AM",
  },
  {
    id: 2,
    workflowId: "wf002",
    version: 3,
    name: "Data Sync",
    status: "error",
    time: "5 minutes ago",
    log: "Error: Connection refused - Failed to connect to database",
    duration: "2 minutes",
    trigger: "Manual",
    retries: {
      count: 3,
      max: 3,
    },
  },
  {
    id: 3,
    workflowId: "wf003",
    version: 1,
    name: "Invoice Generation",
    status: "success",
    time: "10 minutes ago",
    log: null,
    duration: "10 minutes",
    trigger: "Schedule",
    nextScheduled: "Tomorrow at 2:00 AM",
  },
  {
    id: 4,
    workflowId: "wf004",
    version: 2,
    name: "Email Campaign",
    status: "timeout",
    time: "15 minutes ago",
    log: "Error: Operation timed out after 30 seconds",
    duration: "15 minutes",
    trigger: "Manual",
    retries: {
      count: 1,
      max: 3,
    },
  },
  {
    id: 5,
    workflowId: "wf005",
    version: 4,
    name: "Analytics Export",
    status: "error",
    time: "20 minutes ago",
    log: "Error: Invalid credentials - Please check your API key",
    duration: "20 minutes",
    trigger: "Schedule",
    retries: {
      count: 3,
      max: 3,
    },
  },
];

type ExecutionStatus = "success" | "error" | "timeout";

type StatusFilter = ExecutionStatus | "all";

type Execution = {
  id: number;
  workflowId: string;
  version: number;
  name: string;
  status: ExecutionStatus;
  time: string;
  log: string | null;
  duration?: string;
  trigger?: string;
  nextScheduled?: string;
  retries?: {
    count: number;
    max: number;
  };
};

type Template = {
  id: string;
  title: string;
  description: string;
  category: string;
  popularity: number;
  services: Array<{
    name: string;
    icon: string;
  }>;
};

const relatedTemplates: Template[] = [
  {
    id: "t001",
    title: "Automated Data Backup",
    description: "Secure backup workflow for critical data with multi-cloud support and encryption",
    category: "Data Management",
    popularity: 2451,
    services: [
      { name: "AWS S3", icon: "aws.amazon.com" },
      { name: "Google Cloud", icon: "cloud.google.com" },
      { name: "Azure", icon: "azure.microsoft.com" },
    ],
  },
  {
    id: "t002",
    title: "Customer Onboarding Flow",
    description: "Streamline your customer onboarding process with automated welcome emails and resource provisioning",
    category: "Customer Success",
    popularity: 1832,
    services: [
      { name: "Salesforce", icon: "salesforce.com" },
      { name: "Gmail", icon: "gmail.com" },
      { name: "Slack", icon: "slack.com" },
    ],
  },
  {
    id: "t003",
    title: "Invoice Processing & Payment",
    description: "Automated invoice handling with approval workflows and payment processing integration",
    category: "Finance",
    popularity: 1654,
    services: [
      { name: "QuickBooks", icon: "quickbooks.intuit.com" },
      { name: "Stripe", icon: "stripe.com" },
      { name: "DocuSign", icon: "docusign.com" },
    ],
  },
  {
    id: "t004",
    title: "Social Media Campaign Manager",
    description: "Schedule and publish content across multiple social platforms with analytics tracking",
    category: "Marketing",
    popularity: 1423,
    services: [
      { name: "Buffer", icon: "buffer.com" },
      { name: "Twitter", icon: "twitter.com" },
      { name: "LinkedIn", icon: "linkedin.com" },
    ],
  },
  {
    id: "t005",
    title: "HR Employee Onboarding",
    description: "Comprehensive employee onboarding workflow with document signing and system access setup",
    category: "Human Resources",
    popularity: 1298,
    services: [
      { name: "Workday", icon: "workday.com" },
      { name: "DocuSign", icon: "docusign.com" },
      { name: "Google Workspace", icon: "workspace.google.com" },
    ],
  },
  {
    id: "t006",
    title: "Support Ticket Automation",
    description: "Intelligent ticket routing and automated response system with SLA monitoring",
    category: "Customer Support",
    popularity: 1187,
    services: [
      { name: "Zendesk", icon: "zendesk.com" },
      { name: "Slack", icon: "slack.com" },
      { name: "Jira", icon: "atlassian.com" },
    ],
  },
];

function ExecutionTrends() {
  return (
    <section className="rounded-lg border px-5 pt-5 h-full space-y-2">
      <h4 className="text-sm font-medium mb-1.5">Execution Trends</h4>
      <div className="h-[calc(100%-1.875rem)] -ml-8 w-full">
        <ChartContainer className="h-full w-full " config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={executionTrendData} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-sm text-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} className="text-sm text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="executions" stroke="var(--color-executions)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </section>
  );
}

function ExecutionStatus() {
  return (
    <section className="rounded-lg border px-5 pt-5 h-full space-y-2">
      <h4 className="text-sm font-medium mb-1.5">Execution Status</h4>
      <div className="h-[calc(100%-1.875rem)] w-full">
        <ChartContainer className="h-full w-full" config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
              <Pie
                data={executionStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                label
              >
                {executionStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </section>
  );
}

function ExecutionItem({ execution }: { execution: Execution }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const canRetry =
    (execution.status === "error" || execution.status === "timeout") &&
    (!execution.retries || execution.retries.count < execution.retries.max);

  const handleRetry = () => {
    toast.success(`Retrying execution of ${execution.name}`);
  };

  return (
    <div className="flex flex-col border-b mb-2 pb-2 last:border-0">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium">{execution.name}</p>
            <p className="text-xs text-muted-foreground">{execution.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              execution.status === "success"
                ? "bg-green-500"
                : execution.status === "error"
                ? "bg-red-500"
                : "bg-orange-500"
            }`}
          />
          <span className="text-xs text-muted-foreground capitalize">{execution.status}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 pl-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p>{execution.duration}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trigger</p>
              <p>{execution.trigger}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Version</p>
              <p>v{execution.version}</p>
            </div>
            {execution.retries && (
              <div>
                <p className="text-xs text-muted-foreground">Retries</p>
                <p>
                  {execution.retries.count} of {execution.retries.max}
                </p>
              </div>
            )}
            {execution.nextScheduled && (
              <div>
                <p className="text-xs text-muted-foreground">Next Scheduled Run</p>
                <p>{execution.nextScheduled}</p>
              </div>
            )}
          </div>

          {execution.log && (
            <div className="rounded bg-muted/50 p-2">
              <code className="text-xs text-muted-foreground font-mono">{execution.log}</code>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7" disabled={!canRetry} onClick={handleRetry}>
              {canRetry
                ? "Retry Execution"
                : execution.status === "error" || execution.status === "timeout"
                ? "Maximum retry attempts reached"
                : "Retry Execution"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 gap-2"
              onClick={() => navigate(`/workflows/${execution.workflowId}`)}
            >
              View Workflow
              <ExternalLinkIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentExecutions() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredExecutions = recentExecutions.filter(
    (execution) => statusFilter === "all" || execution.status === statusFilter
  );

  return (
    <section className="rounded-lg border px-5 pt-5 h-full">
      <div className="flex items-center justify-between mb-4 flex-col md:flex-row gap-2">
        <h4 className="text-sm font-medium">Recent Executions</h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="text-xs h-7"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "success" ? "default" : "outline"}
            onClick={() => setStatusFilter("success")}
            className="text-xs h-7"
          >
            Successful
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "error" ? "default" : "outline"}
            onClick={() => setStatusFilter("error")}
            className="text-xs h-7"
          >
            Failed
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "timeout" ? "default" : "outline"}
            onClick={() => setStatusFilter("timeout")}
            className="text-xs h-7"
          >
            Timeout
          </Button>
        </div>
      </div>

      <ScrollArea scrollHideDelay={20} className="flex max-h-60 flex-col gap-2 overflow-y-auto -mr-3 pr-3">
        {filteredExecutions.map((execution) => (
          <ExecutionItem key={execution.id} execution={execution} />
        ))}
      </ScrollArea>
    </section>
  );
}

const recentWorkflows = [
  {
    id: "wf001",
    title: "Daily Backup",
    description: "Automated backup of critical systems",
    updatedAt: "2 minutes ago",
    status: "deployed" as const,
  },
  {
    id: "wf002",
    title: "Customer Data Sync",
    description: "Synchronize customer data across platforms",
    updatedAt: "1 hour ago",
    status: "draft" as const,
  },
  {
    id: "wf003",
    title: "Invoice Generation",
    description: "Automated invoice creation and delivery",
    updatedAt: "3 hours ago",
    status: "error" as const,
  },
];

function WorkflowCard({ workflow }: { workflow: (typeof recentWorkflows)[0] }) {
  const statusColors = {
    deployed: "text-green-600/75",
    draft: "text-yellow-600/75",
    error: "text-red-600/75",
  };

  return (
    <Card className={cn("transition-all duration-200 rounded-md")}>
      <CardHeader className="p-3 pb-2">
        <Link to={`/workflows/${workflow.id}`} className="hover:underline">
          <CardTitle className="text-sm">{workflow.title}</CardTitle>
          <CardDescription className="text-xs line-clamp-1">{workflow.description}</CardDescription>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{workflow.updatedAt}</span>
          <span className={cn("text-xs capitalize", statusColors[workflow.status])}>{workflow.status}</span>
        </div>
      </CardHeader>
    </Card>
  );
}

function RecentWorkflowsPanel() {
  return (
    <section className="rounded-lg border px-4 pt-4 h-full">
      <h4 className="text-sm font-medium mb-3">Recent Workflows</h4>
      <ScrollArea className="flex max-h-60 flex-col gap-2 overflow-y-auto -mr-3 pr-3">
        <div className="space-y-2">
          {recentWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

function TemplateCarousel() {
  return (
    <section className="rounded-lg border p-6 w-full">
      <div className="flex justify-between items-center mb-6 ">
        <div className="flex items-center justify-between w-full">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Templates You Might Like</h4>
            <p className="text-sm text-muted-foreground">Start with a pre-built workflow template</p>
          </div>
          <div className="flex gap-2 ml-4">
            <Link to="/templates" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <span>View All Templates</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {relatedTemplates.map((template) => (
          <Card className="transition-all w-full duration-200 hover:border-primary/20 flex flex-col">
            <CardHeader className="flex-none pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm line-clamp-1">{template.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 pb-5">
              <Badge variant="secondary" className="text-xs ml">
                {template.category}
              </Badge>
            </CardContent>
            <CardFooter className="flex-none flex justify-between items-center">
              <div className="flex gap-2 ">
                {template.services.map((service) => (
                  <img
                    key={service.name}
                    src={`https://cdn.brandfetch.io/${service.icon}/w/400/h/400`}
                    alt={service.name}
                    title={service.name}
                    className="w-5 h-5 rounded-md"
                  />
                ))}
              </div>
              <Link to={`/templates/${template.id}`}>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function Component() {
  return (
    <div className="space-y-4 pb-24">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full space-y-2 flex flex-col"
      >
        <div className="gap-2 w-full flex flex-col xl:flex-row items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="h-[240px] flex-[3]"
          >
            <ExecutionTrends />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="h-[240px] flex-[1]"
          >
            <ExecutionStatus />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.035 }}
          className="h-[320px] flex-[2]"
        >
          <hr className="w-full my-6" />
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="h-[320px] flex-[2]"
          >
            <RecentExecutions />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="h-[320px] flex-[2]"
          >
            <RecentWorkflowsPanel />
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <TemplateCarousel />
      </motion.div>
    </div>
  );
}
