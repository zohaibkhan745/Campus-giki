import { z } from 'zod';

export const onboardSocietySchema = z.object({
  name: z
    .string()
    .min(3, 'Society name must be at least 3 characters')
    .max(100, 'Society name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s\-\.,]+$/, 'Society name can only contain letters, spaces, dashes, commas, and dots'),
  presidentName: z
    .string()
    .min(2, 'President name must be at least 2 characters')
    .max(100, 'President name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s\-\.,]+$/, 'President name can only contain letters, spaces, dashes, commas, and dots'),
  categoryId: z.string().min(1, 'Please select a society category'),
  presidentEmail: z
    .string()
    .min(1, 'Society email is required')
    .email('Please enter a valid email address'),
  advisorId: z.string().min(1, 'Please select an assigned faculty advisor'),
});

export type OnboardSocietyFormData = z.infer<typeof onboardSocietySchema>;
