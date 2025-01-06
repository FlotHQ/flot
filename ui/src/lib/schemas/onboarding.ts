import { z } from "zod";

export const industrySchema = z.enum([
    "technology",
    "marketing",
    "sales",
    "finance",
    "healthcare",
    "education",
    "other",
]);

export const teamSizeSchema = z.enum([
    "solo",
    "2-10",
    "11-50",
    "51-200",
    "201-1000",
    "1000+",
]);

export const automationGoalsSchema = z.array(
    z.enum([
        "save_time",
        "reduce_errors",
        "integrate_tools",
        "improve_collaboration",
        "data_sync",
        "customer_experience",
        "other",
    ])
).min(1);

export const serviceSchema = z.object({
    name: z.string(),
    id: z.string(),
    category: z.string(),
    description: z.string(),
});

export const servicesSchema = z.array(serviceSchema).min(1);

export const experienceLevelSchema = z.enum([
    "beginner",
    "intermediate",
    "advanced",
]);

export const onboardingSchema = z.object({
    industry: industrySchema,
    teamSize: teamSizeSchema,
    automationGoals: automationGoalsSchema,
    services: servicesSchema,
    experienceLevel: experienceLevelSchema,
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type Service = z.infer<typeof serviceSchema>; 