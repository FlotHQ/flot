import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useHover } from "usehooks-ts";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-[4px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				"gradient-border": "",
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

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	showLoader?: boolean;
}

type GradientBackgroundProps = {
	onHover?: boolean;
	children: React.ReactNode;
};
export const GradientBackground = (props: GradientBackgroundProps) => {
	const ref = React.useRef<HTMLDivElement>(null);
	const isHovering = useHover(ref);

	return (
		<div
			ref={ref}
			style={{
				background:
					props.onHover && isHovering
						? "linear-gradient(40deg, #57ec99 -22.11%, #1371ef 24.2%, #fc1cd5 70.52%, #fccc05 116.83%)"
						: !props.onHover
							? "linear-gradient(40deg, #57ec99 -22.11%, #1371ef 24.2%, #fc1cd5 70.52%, #fccc05 116.83%)"
							: "transparent",
			}}
			className="p-[1px] shadow-xs px-[px] h-min whitespace-nowrap hover:brightness-95  rounded-md "
		>
			{props.children}
		</div>
	);
};

const Button = React.forwardRef<
	HTMLButtonElement,
	ButtonProps & {
		gradientClassName?: string;
		shape?: "rounded" | "pill" | "square";
	}
>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			loading,
			showLoader = true,
			shape = "pill",
			gradientClassName,
			...props
		},
		ref,
	) => {
		if (variant === "gradient-border") {
			return (
				<div
					style={{
						background:
							"linear-gradient(40deg, #57ec99 -22.11%, #1371ef 24.2%, #fc1cd5 70.52%, #fccc05 116.83%)",
					}}
					className={cn(
						"p-[2px] shadow-xs h-min whitespace-nowrap hover:brightness-75 ",
						gradientClassName,
						shape === "rounded" && "rounded-xl",
						shape === "pill" && "rounded-full",
						shape === "square" && "rounded-md",
					)}
				>
					<button
						className={cn(
							" transition-colors hover:bg-muted flex items-center outline-none gap-2 w-full duration-150 bg-background text-foreground px-8 py-2 h-10  font-semibold text-sm",
							className,
							shape === "rounded" && "rounded-xl",
							shape === "pill" && "rounded-full",
							shape === "square" && "rounded-md",
						)}
						ref={ref}
						disabled={loading}
						{...props}
					>
						{loading && showLoader && (
							<Loader2 className="w-4 h-4 animate-spin" />
						)}
						{props.children}
					</button>
				</div>
			);
		}

		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(
					loading && "opacity-80  pointer-events-none flex items-center gap-2",
					buttonVariants({ variant, size, className }),
					className,
				)}
				ref={ref}
				disabled={loading}
				{...props}
			>
				{loading && showLoader && <Loader2 className="w-4 h-4 animate-spin" />}
				{props.children}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button };
