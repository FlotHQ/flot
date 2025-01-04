import { Link } from "react-router-dom";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Template } from "~/types";

type TemplateCardProps = {
  template: Template;
};

const TemplateCard = ({ template }: TemplateCardProps) => {
  return (
    <Card className="transition-all w-full duration-200 hover:border-primary/20 flex flex-col">
      <CardHeader className="flex-none pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm line-clamp-1">{template.title}</CardTitle>
          <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pb-5">
        {template.categories.map((category) => (
          <Badge variant="secondary" className="text-xs ml">
            {category}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="flex-none flex justify-between items-center">
        <div className="flex gap-2 ">
          {template.services.map((service) => (
            <img
              key={service.name}
              src={`https://cdn.brandfetch.io/${service.icon}/w/400/h/400`}
              alt={service.name}
              title={service.name}
              className="w-5 h-5 rounded-md"
            />
          ))}
        </div>
        <Link to={`/templates/${template.id}`}>
          <Button variant="outline" size="sm">
            Use Template
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

TemplateCard.Skeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </div>
      </CardHeader>
      <CardFooter className="mt-auto flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-5 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-[4px]" />
      </CardFooter>
    </Card>
  );
};

export { TemplateCard };
