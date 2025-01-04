import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type Template = {
  name: string;
  description: string;
  services: {
    name: string;
    icon: (props: { className: string }) => React.ReactNode;
  }[];
};

type TemplateCardProps = {
  template: Template;
  onClick?: () => void;
  isLoading?: boolean;
  href?: string;
  size: "sm" | "base";
};

const TemplateCard = (props: TemplateCardProps) => {
  return (
    <div
      className={cn(
        "p-3 relative flex-col flex border-[1px] border-muted w-80 transition-all duration-150 h-[124px] rounded-[4px]",
        props.size === "sm" ? "w-72" : "w-80"
      )}
    >
      <div className={cn(props.isLoading && "pointer-events-none")}>
        <h6 className="text-sm font-semibold line-clamp-1">{props.template.name}</h6>
        <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{props.template.description}</p>
      </div>

      <div className="mt-auto flex justify-between items-center">
        <div className={cn("flex gap-2", props.isLoading && "pointer-events-none")}>
          {props.template.services.map((service) => (
            <service.icon key={service.name} className="h-5 w-5" />
          ))}
        </div>
        <Button
          className="rounded-[4px]"
          isLoading={props.isLoading}
          onClick={props.onClick}
          size="sm"
          variant="secondary"
        >
          Use Template
        </Button>
      </div>
    </div>
  );
};

type TemplateCardSkeletonProps = {
  size: "sm" | "base";
};

TemplateCard.Skeleton = (props: TemplateCardSkeletonProps) => {
  return (
    <div
      className={cn(
        "p-3 relative flex-col flex border-[1px] transition-all duration-150  h-[124px] rounded-[4px] border-muted",
        props.size === "sm" ? "w-72" : "w-80"
      )}
    >
      <div className="animate-pulse">
        <h6 className="bg-foreground/10 h-[20px] w-[80%] rounded-md"></h6>
        <p className="bg-foreground/10 h-[16px] w-[60%] rounded-md mt-1"></p>
      </div>
    </div>
  );
};

export { TemplateCard };
