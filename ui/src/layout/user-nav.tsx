import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import { useTheme } from "~/lib/theme/hooks";
import { useUser } from "~/lib/user/hooks";

export function UserNav() {
	const { user, logout } = useUser();

	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8 border-[1px]">
						<AvatarImage src={user?.avatar ?? ""} alt="@shadcn" />
						<AvatarFallback>{user?.name[0]}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user?.name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user?.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-normal">
						<div className="flex justify-between items-center py-1">
							<p className="text-sm font-medium leading-none">Theme</p>
							<div className="flex items-center gap-2">
								<Sun className="h-4 w-4" />
								<Switch
									checked={theme === "dark"}
									onCheckedChange={(checked) => {
										setTheme(checked ? "dark" : "light");
									}}
								/>
								<Moon className="h-4 w-4" />
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuGroup>
					<Link to="/billing">
						<DropdownMenuItem className="hover:cursor-pointer">
							Billing
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="hover:cursor-pointer" onClick={logout}>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
