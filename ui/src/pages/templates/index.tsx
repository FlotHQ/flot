import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { TemplateCard } from "./template-card";
import { UrlParamsProvider } from "~/hooks/useUrlParams/context";
import { useUrlParams } from "~/hooks/useUrlParams";
import templateFixtures from "~/../__fixtures__/templates.json";
import { cn } from "~/lib/utils";
import { useState, useEffect, useDeferredValue, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";

const Header = () => {
  return (
    <header className="flex w-full flex-col sm:flex-row justify-between items-start sm:items-center pb-3">
      <div className="w-full space-y-6">
        <div>
          <h2>Templates</h2>
          <p className="text-sm max-w-[380px] text-foreground/50 mt-1">
            Discover and use premade templates to jumpstart your workflow.
          </p>
        </div>
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
  const { setParams, categories: paramsCategories, type, search } = useUrlParams<UrlParams>();
  const deferredSearch = useDeferredValue(search);
  const [searchTerm, setSearchTerm] = useState(search);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    if (deferredSearchTerm === search) {
      return;
    }
    setParams({ search: deferredSearchTerm });
  }, [deferredSearchTerm, setParams, search]);

  const templates = {
    data: templateFixtures.templates,
    isLoading: false,
    error: null,
    isInitialLoading: false,
  };

  const filteredTemplates = useMemo(() => {
    return templates.data?.filter((template) => template.title.toLowerCase().includes(deferredSearch.toLowerCase()));
  }, [templates.data, deferredSearch]);

  return (
    <div className="w-full">
      <Header />
      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-12">
          <FilterPanel
            onFilterChange={(newFilter) => {
              setParams({ ...newFilter }, { replace: true });
            }}
            value={{ type, categories: paramsCategories }}
          />
          <div className="space-y-4 w-full">
            <div className="w-full flex justify-between items-center">
              <h5>Templates</h5>
              <div className="relative w-full sm:max-w-[300px]">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search templates"
                  autoFocus
                  className="pl-9 py-1 text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-285px)] xl:h-[calc(100vh-285px)] pr-3 -mr-3">
              <ul className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                {templates.isInitialLoading &&
                  Array.from({ length: 5 }).map((_, i) => <TemplateCard.Skeleton key={i} />)}
                {filteredTemplates?.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
                {filteredTemplates?.length === 0 && <p className="text-sm col-span-full">No templates found</p>}
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
        categories: ["all"],
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
} & React.HTMLAttributes<HTMLDivElement>;

const CheckboxWithLabel = ({ id, label, onChange, className, value, ...props }: CheckboxWithLabelProps) => {
  return (
    <div className={cn("flex items-center space-x-2 h-min", className)} {...props}>
      <Checkbox onCheckedChange={onChange} checked={value} id={id} />
      <label
        htmlFor={id}
        className="text-sm hover:cursor-pointer font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
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
    data: templateFixtures.categories,
    isLoading: false,
    error: null,
  };

  if (categories.isLoading) {
    return <Skeleton className="w-full lg:w-64 shrink-0 h-[600px]" />;
  }

  return (
    <section className="w-full xl:max-w-56">
      <header className="flex pb-4 justify-between items-center w-full border-b">
        <p className="text-lg font-semibold">Filters</p>
      </header>

      <div className="flex flex-wrap flex-row xl:gap-6  gap-6 py-4 xl:flex-col">
        <div className=" w-fit h-min space-y-4">
          <Label className="text-sm font-medium text-foreground/70">Template Type</Label>
          <ul className="space-y-3 pl-1">
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
                <Label htmlFor="r1" className="hover:cursor-pointer text-sm font-normal">
                  All Templates
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="official" id="r2" />
                <Label htmlFor="r2" className="hover:cursor-pointer text-sm font-normal">
                  Official Templates
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="community" id="r3" />
                <Label htmlFor="r3" className="hover:cursor-pointer text-sm font-normal">
                  Community Templates
                </Label>
              </div>
            </RadioGroup>
          </ul>
        </div>

        <div className="w-fit space-y-4  xl:h-full">
          <Label className="text-sm font-medium text-foreground/70">Categories</Label>
          <div className="flex flex-wrap gap-3 flex-row xl:flex-col pl-1 ">
            {categories.data?.map((category) => (
              <CheckboxWithLabel
                id={category.id}
                label={category.label}
                value={props.value.categories.includes(category.id)}
                onChange={(checked) => {
                  if (category.id === "all") {
                    props.onFilterChange({
                      ...props.value,
                      categories: ["all"],
                    });
                  } else {
                    props.onFilterChange({
                      ...props.value,
                      categories: (checked
                        ? [...props.value.categories, category.id]
                        : props.value.categories.filter((c) => c !== category.id)
                      ).filter((c) => c !== "all"),
                    });
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
