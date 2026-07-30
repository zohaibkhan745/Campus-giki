import { z } from 'zod';

export const onboardSocietySchema = z.object({
  name: z
    .string()
    .min(3, 'Society name must be at least 3 characters')
    .max(100, 'Society name cannot exceed 100 characters'),
  categoryId: z.string().min(1, 'Please select a society category'),
  presidentEmail: z
    .string()
    .min(1, 'Society email is required')
    .email('Please enter a valid email address'),
  advisorId: z.string().min(1, 'Please select an assigned faculty advisor'),
});

export type OnboardSocietyFormData = z.infer<typeof onboardSocietySchema>;
