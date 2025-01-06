import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Progress } from "~/components/ui/progress";
import { ServiceSearch } from "~/components/service-search";
import { onboardingSchema, type OnboardingData, type Service } from "~/lib/schemas/onboarding";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "~/components/ui/scroll-area";

type BaseOption<T extends string = string> = {
  label: string;
  value: T;
};

type Step = {
  title: string;
  field: keyof OnboardingData;
  options?: BaseOption<string>[];
  component?: string;
};

type AutomationGoal =
  | "save_time"
  | "reduce_errors"
  | "integrate_tools"
  | "improve_collaboration"
  | "data_sync"
  | "customer_experience"
  | "other";

const steps: Step[] = [
  {
    title: "What industry are you in?",
    field: "industry",
    options: [
      { label: "Technology", value: "technology" },
      { label: "Marketing", value: "marketing" },
      { label: "Sales", value: "sales" },
      { label: "Finance", value: "finance" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Education", value: "education" },
      { label: "Other", value: "other" },
    ],
  },
  {
    title: "What's your team size?",
    field: "teamSize",
    options: [
      { label: "Solo", value: "solo" },
      { label: "2-10 people", value: "2-10" },
      { label: "11-50 people", value: "11-50" },
      { label: "51-200 people", value: "51-200" },
      { label: "201-1000 people", value: "201-1000" },
      { label: "1000+ people", value: "1000+" },
    ],
  },
  {
    title: "What are your automation goals?",
    field: "automationGoals",
    options: [
      { label: "Save time on repetitive tasks", value: "save_time" },
      { label: "Reduce manual errors", value: "reduce_errors" },
      { label: "Connect different tools", value: "integrate_tools" },
      { label: "Improve team collaboration", value: "improve_collaboration" },
      { label: "Keep data in sync", value: "data_sync" },
      { label: "Enhance customer experience", value: "customer_experience" },
      { label: "Other", value: "other" },
    ] as Array<BaseOption<AutomationGoal>>,
  },
  {
    title: "Which services do you use or plan to use?",
    field: "services",
    component: "service-search",
    options: [],
  },
  {
    title: "What's your automation experience level?",
    field: "experienceLevel",
    options: [
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
    ],
  },
];

export function Component() {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      automationGoals: [],
      services: [],
      experienceLevel: "beginner",
    },
  });

  function onSubmit(data: OnboardingData) {
    console.log(data);
  }

  const currentField = steps[currentStep].field;
  const isMultiSelect = currentField === "automationGoals";
  const isServiceSearch = currentField === "services";

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col pt-10 sm:pt-20 pb-10">
      <div className="container max-w-2xl px-4">
        <div className="space-y-1 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Flot</h1>
          <p className="text-muted-foreground">Let's get you set up in a few quick steps</p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% completed</span>
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute inset-0 w-full"
            >
              <Card className="border-2">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl sm:text-2xl">{steps[currentStep].title}</CardTitle>
                  {isServiceSearch && (
                    <CardDescription>
                      Search and select the services you use or plan to use in your workflows
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                      <FormField
                        control={form.control}
                        name={currentField}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <ScrollArea className="h-[350px]">
                              {isServiceSearch ? (
                                <ServiceSearch
                                  selectedServices={field.value as Service[]}
                                  onServiceSelect={(service) => {
                                    const currentServices = field.value as Service[];
                                    field.onChange([...currentServices, service]);
                                  }}
                                  onServiceRemove={(service) => {
                                    const currentServices = field.value as Service[];
                                    field.onChange(currentServices.filter((s) => s.id !== service.id));
                                  }}
                                />
                              ) : isMultiSelect ? (
                                <div className="grid gap-4 pr-4">
                                  {steps[currentStep].options?.map((option) => (
                                    <FormField
                                      key={option.value}
                                      control={form.control}
                                      name={currentField}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <label
                                              className={cn(
                                                "flex items-center space-x-3 rounded-lg border-2 border-muted p-4 w-full",
                                                "cursor-pointer transition-all hover:bg-muted/50",
                                                Array.isArray(field.value) &&
                                                  field.value.includes(option.value as AutomationGoal) &&
                                                  "border-primary bg-primary/5"
                                              )}
                                            >
                                              <Checkbox
                                                checked={
                                                  Array.isArray(field.value) &&
                                                  field.value.includes(option.value as AutomationGoal)
                                                }
                                                onCheckedChange={(checked) => {
                                                  const value = field.value as AutomationGoal[];
                                                  return checked
                                                    ? field.onChange([...value, option.value as AutomationGoal])
                                                    : field.onChange(value.filter((v) => v !== option.value));
                                                }}
                                              />
                                              <span className="font-normal text-sm">{option.label}</span>
                                            </label>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value as string}
                                    className="grid gap-4 pr-4"
                                  >
                                    {steps[currentStep].options?.map((option) => (
                                      <FormItem key={option.value}>
                                        <FormControl>
                                          <label
                                            className={cn(
                                              "flex items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4",
                                              "cursor-pointer transition-all hover:bg-muted/50",
                                              field.value === option.value && "border-primary bg-primary/5"
                                            )}
                                          >
                                            <FormLabel className="font-normal">{option.label}</FormLabel>
                                            <RadioGroupItem value={option.value} />
                                          </label>
                                        </FormControl>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                              )}
                            </ScrollArea>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between pt-4 mt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                          disabled={currentStep === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          type={currentStep === steps.length - 1 ? "submit" : "button"}
                          onClick={() => {
                            if (currentStep < steps.length - 1) {
                              setCurrentStep((step) => step + 1);
                            }
                          }}
                        >
                          {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="h-[350px] invisible" aria-hidden="true" />
      </div>
    </div>
  );
}
