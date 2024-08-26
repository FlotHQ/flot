import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button.tsx";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { FlotLogo } from "~/components/logo";

export function Component() {
	return (
		<div className="flex   shrink-0 justify-center h-full ">
			<div className="flex-col  flex items-center   shrink-0 mt-[250px] ">
				<div className="flex flex-col items-center gap-4">
					<FlotLogo />
					<Badge>Public Alpha</Badge>
				</div>
				<div className=" space-y-2 mt-8">
					<p className="text-xs max-w-[240px] text-center mb-4">
						Signup to Flot to start building your workflows.
					</p>
					<form
						action={`${import.meta.env.DEV ? "http://localhost:3000" : "https://api.flot.so"}/api/oauth/login/google`}
						method="get"
					>
						<Button
							className="space-x-3"
							variant="outline"
							type="submit"
							size="lg"
						>
							{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
							<svg
								stroke="currentColor"
								fill="currentColor"
								strokeWidth="0"
								viewBox="0 0 488 512"
								height="18px"
								width="18px"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
							</svg>
							<p> Sign up with Google</p>
						</Button>
					</form>
					<form
						action={`${import.meta.env.DEV ? "http://localhost:3000" : "https://api.flot.so"}/api/oauth/login/github`}
						method="get"
					>
						<Button
							className="space-x-3"
							variant="outline"
							type="submit"
							size="lg"
						>
							<GitHubLogoIcon width={18} height={18} />
							<p>Sign up with GitHub</p>
						</Button>
					</form>
				</div>
				<div className="mt-6 max-w-[280px] text-center text-xs text-muted-foreground">
					Already have an account?{" "}
					<a href="/login" className="text-blue-600 hover:underline">
						Sign in
					</a>
				</div>
				<div className="mt-6 max-w-[280px] text-center text-xs text-muted-foreground">
					By continuing you agree to and accept our <br />
					<a
						href="https://tryflot.com/terms"
						target="_blank"
						rel="noreferrer"
						className="hover:underline text-blue-600"
					>
						Terms of Service
					</a>{" "}
					and{" "}
					<a
						href="https://tryflot.com/privacy"
						target="_blank"
						rel="noreferrer"
						className="hover:underline text-blue-600"
					>
						Privacy Policy
					</a>
					.
				</div>
			</div>
		</div>
	);
}
