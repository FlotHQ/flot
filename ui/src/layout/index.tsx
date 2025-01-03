import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "~/components/ui/sonner";
import { ScrollArea } from "~/components/ui/scroll-area";
import { AppSidebar } from "~/components/app-shell/sidebar";
import { Separator } from "~/components/ui/separator";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";


export function Layout() {

	const location = useLocation();

	return (
		<>
			<Toaster />
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4  pt-0">
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
				</SidebarInset>
			</SidebarProvider>
		</>
	)

}

export function DashboardLayout() {

	return (
		<>
			<Toaster />
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
						<ScrollArea className="flex-grow max-h-screen h-[calc(100vh-160px)]  overflow-y-auto">
							<div className="bg-zinc-50 dark:bg-inherit min-h-full ">
								<div className="px-4  sm:px-6 lg:px-8 w-full gap-4 flex flex-col max-w-screen-lg mx-auto pt-12 ">
									<Outlet />
								</div>
							</div>
						</ScrollArea>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	)

}
