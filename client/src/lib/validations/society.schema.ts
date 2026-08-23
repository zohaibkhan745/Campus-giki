import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || val === '' || z.string().url().safeParse(val).success || val.startsWith('/') || val.startsWith('/'),
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

export const executiveMemberSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  name: z.string().regex(/^[a-zA-Z., \\-]+$/, 'Only letters, spaces, dots, commas, and dashes allowed').min(1, 'Name is required'),
  regNum: z.string().regex(/^\d{7}$/, 'Must be exactly 7 digits'),
  faculty: z.string().min(1, 'Faculty is required'),
  contact: z.string().regex(/^\d{11}$/, 'Must be exactly 11 digits'),
  email: z.string().email('Invalid email address'),
});

export const societySetupSchema = z.object({
  name: z
    .string()
    .min(2, 'Society name must be at least 2 characters')
    .max(100, 'Society name cannot exceed 100 characters'),
  type: z.enum(['SOCIETY', 'CLUB', 'TEAM']),
  categoryId: z.string().min(1, 'Please select a category'),
  
  longDescription: z
    .string()
    .min(20, 'Description must be at least 20 characters'),
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  instagram: optionalUrl,
  facebook: optionalUrl,
  linkedin: optionalUrl,
  website: optionalUrl,
  email: optionalEmail,
  presidentName: z.string().regex(/^[a-zA-Z., \\\-]+$/, 'Only letters, spaces, dots, commas, and dashes allowed').min(1, 'President name is required'),
  presidentRegNum: z.string().regex(/^\d{7}$/, 'Must be exactly 7 digits').optional().or(z.literal('')),
  presidentFaculty: z.string().min(1, 'Faculty is required'),
  presidentContact: z.string().regex(/^\d{11}$/, 'Must be exactly 11 digits').optional().or(z.literal('')),
  presidentEmail: z.string().email('Invalid email address'),
  vp: executiveMemberSchema,
  gs: executiveMemberSchema,
  ec: executiveMemberSchema,
  treasurer: executiveMemberSchema,
  otherMembers: z.array(executiveMemberSchema).optional(),
});

export type SocietySetupFormData = z.infer<typeof societySetupSchema>;






