import * as React from "react";
import { AudioWaveform, BookOpen, Command, GalleryVerticalEnd, Gauge, Settings2 } from "lucide-react";

import { NavUser } from "~/components/app-shell/user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/components/ui/sidebar";
import { NavResource } from "~/components/app-shell/resources";
import { NavMain } from "~/components/app-shell/main";
import { Workflow, LayoutTemplate } from "lucide-react";
import { Logo } from "../logo";
import { Link } from "react-router-dom";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navResources: [
    {
      title: "Documentation",
      url: "https://flot.so/docs",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],
  navMain: [
    {
      name: "Dashboard",
      url: "/",
      icon: Gauge,
    },
    {
      name: "Workflows",
      url: "/workflows",
      regex: /^\/workflows/,
      icon: Workflow,
    },
    {
      name: "Templates",
      url: "/templates",
      icon: LayoutTemplate,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="@container/sidebar" {...props}>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 pl-0  mt-0 @[10rem]/sidebar:pl-2 @[10rem]/sidebar:mt-3 ">
          <div className="flex aspect-square size-8 p-2 items-center justify-center rounded-lg bg-foreground text-sidebar-primary-foreground">
            <Logo />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Flot</span>
            <span className="truncate text-xs text-muted-foreground">Make it flow</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain projects={data.navMain} />
        <NavResource items={data.navResources} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
