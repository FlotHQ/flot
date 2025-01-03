import { Link, Outlet, useLocation } from "react-router-dom";
import {
	type LucideIcon,
	Component,
	Workflow,
	Home,
	CreditCard,
	LayoutTemplate,
	Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { ProjectSwitcher } from "./project-switcher";
import { UserNav } from "./user-nav";
import { PinLeftIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";
import { StyledLink } from "~/components/ui/styled-link";
import { Label } from "~/components/ui/label";
import { ExpandedLogo, Logo } from "~/components/logo";
import { Toaster } from "~/components/ui/sonner";
import { useLocalStorage } from "usehooks-ts";
import { ScrollArea } from "~/components/ui/scroll-area";
import { AppSidebar } from "~/components/app-shell/sidebar";
import { Separator } from "~/components/ui/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";

const links: LinkEntry[] = [
	{ label: "Home", href: "/", icon: Home },
	{
		label: "Workflows",
		href: "/workflows",
		icon: Workflow,
		match: /workflows\/.*/,
	},
	{ label: "Collections", href: "/collections", icon: Component },
	{ label: "Templates", href: "/templates", icon: LayoutTemplate },
	{ label: "Organizations", href: "/organizations", icon: Users },
	{ label: "Billing", href: "/billing", icon: CreditCard },
];

export function Layout() {

	const location = useLocation();

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="grid auto-rows-min gap-4 md:grid-cols-3">
						<div className="aspect-video rounded-xl bg-muted/50" />
						<div className="aspect-video rounded-xl bg-muted/50" />
						<div className="aspect-video rounded-xl bg-muted/50" />
					</div>
					<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)

	return (
		<>
			<Toaster />
			<div className="flex fixed inset-0">
				<SideBar links={links} />
				<div className="flex flex-col w-full">
					<Header />
					{/workflows\/.*/.test(location.pathname) ? (
						<div className="bg-zinc-50 dark:bg-inherit h-full">
							<Outlet />
						</div>
					) : (
						<ScrollArea className="flex-grow">
							<div className="bg-zinc-50 dark:bg-inherit h-full">
								<Outlet />
							</div>
						</ScrollArea>
					)}
				</div>
			</div>
		</>
	);
}

export function DashboardLayout() {

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="grid auto-rows-min gap-4 md:grid-cols-3">
						<div className="aspect-video rounded-xl bg-muted/50" />
						<div className="aspect-video rounded-xl bg-muted/50" />
						<div className="aspect-video rounded-xl bg-muted/50" />
					</div>
					<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)

	return (
		<>
			<Toaster />
			<div className="flex fixed inset-0">
				<SideBar links={links} />
				<div className="flex flex-col w-full">
					<Header />
					<ScrollArea className="flex-grow h-full max-h-screen overflow-y-auto">
						<div className="bg-zinc-50 dark:bg-inherit min-h-full">
							<div className="px-4  sm:px-6 lg:px-8 w-full py-24 gap-4 flex flex-col max-w-screen-lg mx-auto">
								<Outlet />
							</div>
						</div>
					</ScrollArea>
				</div>
			</div>
		</>
	);
}

function Header() {
	return (
		<header
			id="main-header"
			className="dark:bg-[#111] pointer-events-auto h-[72px] w-full shrink-0 border-b border-foreground/5 flex items-center justify-between px-[50px]"
		>
			<div className="w-full flex justify-end gap-4 items-center">
				<Link to="https://community.flot.dev/c/support" target="_blank">
					<Button variant="outline" size="sm">
						Support
					</Button>
				</Link>
				<ProjectSwitcher />
				<UserNav />
			</div>
		</header>
	);
}

type LinkEntry = {
	label: string;
	href: string;
	icon: LucideIcon;
	match?: RegExp;
};

type SideBarProps = {
	links: LinkEntry[];
};

function SideBar(props: SideBarProps) {
	const [expanded, setExpanded] = useLocalStorage("sidebar-expanded", true);
	const location = useLocation();


	function toggleExpanded() {
		const newExpanded = !expanded;
		localStorage.setItem("sidebar-expanded", newExpanded.toString());
		setExpanded(newExpanded);
	}

	return (
		<div
			className={cn(
				"sticky hidden md:flex dark:bg-[#111] w-18 transition-all duration-150 ease-in-out h-screen pointer-events-auto z-[1000]  gap-24 left-0 top-0 border-r  pb-2 flex-col  shrink-0 border-foreground/10  items-center pt-12 ",
			)}
			style={{
				width: expanded ? "200px" : "70px",
			}}
		>
			<Link to="/" className="h-[48px]">
				{expanded ? <ExpandedLogo /> : <Logo />}
			</Link>
			<div className="flex flex-col gap-1 w-full px-2">
				{props.links.map((link) => (
					<StyledLink
						variant={
							link.match
								? link.match.test(location.pathname)
									? "default"
									: link.href === location.pathname
										? "default"
										: "ghost"
								: link.href === location.pathname
									? "default"
									: "ghost"
						}
						key={link.label}
						to={link.href}
						className="w-full flex items-center justify-start gap-2 hover:cursor-pointer"
					>
						<link.icon
							strokeWidth={1.8}
							className="w-5 h-5  shrink-0 hover:cursor-pointer"
						/>
						{expanded && (
							<Label className="font-normal hover:cursor-pointer">
								{link.label}
							</Label>
						)}
					</StyledLink>
				))}
			</div>
			<div className={cn("mt-auto", expanded ? "ml-auto" : "")}>
				<Button onClick={toggleExpanded} size="sm" variant="link">
					<PinLeftIcon
						className={cn(
							"w-5 h-5 transition-transform duration-300 ease-in-out text-muted-foreground ",
							expanded ? "rotate-180" : "",
						)}
					/>
				</Button>
			</div>
		</div>
	);
}
