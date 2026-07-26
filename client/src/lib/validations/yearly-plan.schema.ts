import { z } from 'zod';

export const plannedEventItemSchema = z.object({
  eventName: z
    .string()
    .min(2, 'Event name must be at least 2 characters'),
  plannedDate: z.string().min(1, 'Planned date is required'),
  notes: z.string().optional(),
});

export const yearlyPlanFormSchema = z.object({
  year: z.number().min(2024).max(2100),
  events: z
    .array(plannedEventItemSchema)
    .min(1, 'Please add at least one planned event to your yearly calendar'),
});

export type YearlyPlanFormData = z.infer<typeof yearlyPlanFormSchema>;
