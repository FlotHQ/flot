import { LoginForm } from "~/components/login-form";
import { Logo } from "~/components/logo";

export function Component() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div className="themes-wrapper bg-background">
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <a href="#" className="flex items-center gap-2 self-center font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Logo height={22} width={35} />
              </div>
              Flot
            </a>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
