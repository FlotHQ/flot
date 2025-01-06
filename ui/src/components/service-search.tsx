import { type Service } from "~/lib/schemas/onboarding";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useFlexSearch } from "~/hooks/use-flex-search";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";

type ServiceSearchProps = {
  selectedServices: Service[];
  onServiceSelect: (service: Service) => void;
  onServiceRemove: (service: Service) => void;
};

export function ServiceSearch({ selectedServices, onServiceSelect, onServiceRemove }: ServiceSearchProps) {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/datasets/third_party_services.json");
      const data = await response.json();
      return data.items;
    },
  });

  const { data: indexData } = useQuery({
    queryKey: ["index"],
    queryFn: async () => {
      const response = await fetch("/indexes/third_party_services.json");
      const data = await response.json();
      return data;
    },
  });

  const { search, setSearch, ids } = useFlexSearch({
    searchKeys: ["name", "id", "category", "description"],
    indexData,
  });

  const [results, setResults] = useState<Service[]>([]);

  useEffect(() => {
    if (!services) return;

    if (ids.length === 0) {
      setResults(
        services
          .filter((service: Service) => !selectedServices.some((selected) => selected.id === service.id))
          .slice(0, 10)
      );
      return;
    }

    const filtered = services.filter(
      (service: Service) => ids.includes(service.id) && !selectedServices.some((selected) => selected.id === service.id)
    );
    setResults(filtered);
  }, [ids, services, selectedServices]);

  if (isLoading || !services) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedServices
          .filter((service) => service && service.id && service.name)
          .map((service) => (
            <Badge
              key={service.id}
              variant="secondary"
              className={cn(
                "pl-2 pr-1 py-1 h-7",
                "flex items-center justify-between gap-2",
                "hover:bg-secondary/60 transition-colors"
              )}
            >
              <div className="flex items-center gap-2">
                <img
                  src={`https://cdn.brandfetch.io/${service.id}/w/400/h/400`}
                  alt={service.name}
                  className="w-4 h-4 rounded-sm object-contain"
                />
                <span className="text-xs font-medium">{service.name}</span>
              </div>
              <button
                type="button"
                onClick={() => onServiceRemove(service)}
                className={cn(
                  "ml-1 rounded-full p-0.5",
                  "hover:bg-secondary-foreground/10",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "transition-colors"
                )}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {service.name}</span>
              </button>
            </Badge>
          ))}
      </div>
      <Command shouldFilter={false} className="border rounded-lg">
        <CommandInput placeholder="Search services..." value={search} onValueChange={setSearch} autoFocus={true} />
        <ScrollArea className="h-[200px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {results.map((service) => (
              <CommandItem key={service.id} value={service.id} onSelect={() => onServiceSelect(service)}>
                <div className="flex items-center gap-2">
                  <img
                    src={`https://cdn.brandfetch.io/${service.id}/w/400/h/400`}
                    alt={service.name}
                    title={service.name}
                    className="w-6 h-6 rounded-md"
                  />
                  <div className="flex flex-col">
                    <span>{service.name}</span>
                    <span className="text-sm text-muted-foreground">{service.category}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </ScrollArea>
      </Command>
    </div>
  );
}
