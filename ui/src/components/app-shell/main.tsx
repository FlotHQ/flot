import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export function NavMain({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    regex?: RegExp;
    icon: LucideIcon;
  }[];
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className={
                item.regex
                  ? item.regex.test(currentPath)
                    ? "bg-accent text-accent-foreground"
                    : ""
                  : currentPath === item.url
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Link to={item.url} target={item.url.startsWith("https") ? "_blank" : undefined}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
