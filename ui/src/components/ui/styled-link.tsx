import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "react-router-dom";
import { cn } from "~/lib/utils";

const linkVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
				outline:
					"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface LinkProps
	extends React.ButtonHTMLAttributes<HTMLAnchorElement>,
		VariantProps<typeof linkVariants> {
	loading?: boolean;
	to: string;
}

const StyledLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
	({ className, variant, loading, size, ...props }, ref) => {
		return (
			<Link
				ref={ref}
				className={cn(
					loading && "opacity-80  pointer-events-none flex items-center gap-2",
					linkVariants({ variant, size, className }),
					className,
				)}
				disabled={loading}
				{...props}
			>
				{props.children}
			</Link>
		);
	},
);
StyledLink.displayName = "Button";

export { StyledLink };
