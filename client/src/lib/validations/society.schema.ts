import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || val === '' || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL address (e.g. https://example.com)' },
  );

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || val === '' || z.string().email().safeParse(val).success,
    { message: 'Must be a valid email address' },
  );

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
  presidentName: z.string().optional(),
  presidentRegNum: z.string().optional(),
  presidentContact: z.string().optional(),
});

export type SocietySetupFormData = z.infer<typeof societySetupSchema>;
