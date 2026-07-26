import { z } from 'zod';

const optionalUrl = z
  .string()
  .url('Must be a valid URL address (e.g. https://example.com)')
  .or(z.literal(''))
  .optional();

const optionalEmail = z
  .string()
  .email('Must be a valid email address')
  .or(z.literal(''))
  .optional();

export const societySetupSchema = z.object({
  name: z
    .string()
    .min(2, 'Society name must be at least 2 characters')
    .max(100, 'Society name cannot exceed 100 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  shortDescription: z
    .string()
    .min(10, 'Short description must be at least 10 characters')
    .max(250, 'Short description cannot exceed 250 characters'),
  longDescription: z
    .string()
    .min(20, 'Long description must be at least 20 characters'),
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  instagram: optionalUrl,
  facebook: optionalUrl,
  linkedin: optionalUrl,
  website: optionalUrl,
  email: optionalEmail,
});

export type SocietySetupFormData = z.infer<typeof societySetupSchema>;
