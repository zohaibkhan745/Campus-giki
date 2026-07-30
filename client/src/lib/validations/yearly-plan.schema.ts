import { z } from 'zod';

export const plannedEventSchema = z.object({
    eventName: z.string().min(2, 'Event name must be at least 2 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    venue: z.string().min(2, "Venue is required").max(150, "Venue too long"),
    rules: z.string().optional(),
    societyRules: z.string().optional(),
  });

export const yearlyPlanFormSchema = z.object({
  year: z.number().min(2024).max(2100),
  events: z
    .array(plannedEventSchema)
    .min(1, 'Please add at least one planned event to your yearly calendar'),
});

export interface YearlyPlanFormData {
  year: number;
  events: {
    eventName: string;
    startDate: string;
    endDate: string;
    description: string;
    venue: string;
    rules?: string;
    societyRules?: string;
  }[];
}
