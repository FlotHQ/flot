import { Label } from "~/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { toast } from "sonner";
import { TemplateCard } from "./template-card";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { UrlParamsProvider } from "~/hooks/useUrlParams/context";
import { useUrlParams } from "~/hooks/useUrlParams";

const Header = () => {
  return (
    <header className="border-b-[1px] flex w-full justify-between items-center  pb-3">
      <div>
        <h3>Templates</h3>
        <p className=" text-sm max-w-[380px] text-foreground/50">
          Discover and use premade templates to jumpstart your workflow.
        </p>
      </div>
    </header>
  );
};

type UrlParams = {
  type: "all" | "official" | "community";
  categories: string[];
  search: string;
  view: "grid" | "list";
};

function TemplatesContent() {
  const { setParams, categories: paramsCategories, type } = useUrlParams<UrlParams>();

  const categories = {
    data: [],
    isLoading: false,
    error: {
      message: "Something went wrong",
    },
  };

  const templates = {
    data: [
      {
        id: "1",
        name: "Example",
        description: "Example",
        services: [
          { name: "Example", icon: GitHubLogoIcon },
          { name: "Example", icon: GitHubLogoIcon },
        ],
      },
    ],
    isLoading: false,
    error: null,
    isInitialLoading: false,
  };

  const createWorkflowFromTemplate = () => {
    toast.error("Not implemented yet");
  };

  return (
    <div className="w-full">
      <Header />
      <div className="mt-6 flex flex-col gap-6">
        {categories.error && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{categories.error.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-12">
          <FilterPanel
            onFilterChange={(newFilter) => {
              setParams({ ...newFilter }, { replace: true });
            }}
            value={{ type, categories: paramsCategories }}
          />
          <div className="space-y-3 w-full">
            <div className="w-full ">
              <h5>Templates</h5>
            </div>
            <ScrollArea
              style={{
                height: "calc(100vh - 330px)",
              }}
            >
              <ul className="flex flex-wrap gap-2">
                {templates.isInitialLoading &&
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  Array.from({ length: 5 }).map((_, i) => <TemplateCard.Skeleton size="base" />)}
                {templates.data?.map((template) => (
                  <TemplateCard
                    size="base"
                    onClick={createWorkflowFromTemplate}
                    isLoading={false}
                    key={template.id}
                    template={template}
                  />
                ))}

                {templates.data?.length === 0 && <p className="text-sm ">No templates found</p>}
              </ul>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Component() {
  return (
    <UrlParamsProvider<UrlParams>
      defaultValues={{
        type: "all",
        categories: [],
        search: "",
        view: "grid",
      }}
    >
      <TemplatesContent />
    </UrlParamsProvider>
  );
}

type Filter = {
  type: "all" | "official" | "community";
  categories: string[];
};

type CheckboxWithLabelProps = {
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
  value: boolean;
};

const CheckboxWithLabel = (props: CheckboxWithLabelProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox onCheckedChange={props.onChange} checked={props.value} id={props.id} />
      <label
        htmlFor={props.id}
        className="text-sm hover:cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {props.label}
      </label>
    </div>
  );
};

type FilterPanelProps = {
  onFilterChange: (filter: Filter) => void;
  value: Filter;
};

const FilterPanel = (props: FilterPanelProps) => {
  const categories = {
    data: [
      {
        id: "1",
        label: "Example",
      },
    ],
    isLoading: false,
    error: null,
  };

  if (categories.isLoading) {
    return <Skeleton className="w-48 shrink-0 h-[600px] " />;
  }

  return (
    <section className=" max-w-48 shrink-0 w-full">
      <header className="flex pb-4 justify-between items-center w-full">
        <p className="text-md font-semibold">Filters</p>
      </header>
      <div>
        <div className="space-y-3">
          <Label>Template Type</Label>
          <ul className="space-y-2 pl-1">
            <RadioGroup
              value={props.value.type}
              onValueChange={(value) => {
                props.onFilterChange({
                  ...props.value,
                  type: value as Filter["type"],
                });
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="r1" />
                <Label htmlFor="r1" className="hover:cursor-pointer">
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="official" id="r2" />
                <Label htmlFor="r2" className="hover:cursor-pointer">
                  Official
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="community" id="r3" />
                <Label htmlFor="r3" className="hover:cursor-pointer">
                  Community
                </Label>
              </div>
            </RadioGroup>
          </ul>
        </div>
        <div className="bg-muted h-[1px] my-3" />
        <div className="space-y-3">
          <Label>Categories</Label>
          <ul className=" space-y-2 pl-1">
            {categories.data?.map((category) => (
              <li key={category.id}>
                <CheckboxWithLabel
                  id={category.id}
                  label={category.label}
                  value={props.value.categories.includes(category.id)}
                  onChange={(checked) => {
                    props.onFilterChange({
                      ...props.value,
                      categories: checked
                        ? [...props.value.categories, category.id]
                        : props.value.categories.filter((c) => c !== category.id),
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
