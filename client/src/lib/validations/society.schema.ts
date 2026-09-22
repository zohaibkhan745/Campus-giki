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

export const isValidPhone = (val?: string | null) => {
  if (!val || val.trim() === '') return true;
  const clean = val.trim().replace(/[\s\-()]/g, '');
  return /^(\+?\d{10,15})$/.test(clean);
};

export const isValidRegNum = (val?: string | null) => {
  if (!val || val.trim() === '') return true;
  const clean = val.trim().replace(/[\s\-]/g, '');
  return /^\d{7}$/.test(clean);
};

export const executiveMemberSchema = z
  .object({
    role: z.string().optional().or(z.literal('')),
    name: z.string().optional().or(z.literal('')),
    regNum: z.string().optional().or(z.literal('')),
    faculty: z.string().optional().or(z.literal('')),
    contact: z.string().optional().or(z.literal('')),
    email: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    const name = data.name?.trim() || '';
    const regNum = data.regNum?.trim() || '';
    const contact = data.contact?.trim() || '';
    const email = data.email?.trim() || '';
    const faculty = data.faculty?.trim() || '';

    // If completely empty, it's valid (optional member)
    const isStarted = Boolean(name || regNum || contact || email || faculty);
    if (!isStarted) {
      return;
    }

    if (!name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name is required if member is entered',
        path: ['name'],
      });
    } else if (!/^[a-zA-Z., \-]+$/.test(name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only letters, spaces, dots, commas, and dashes allowed',
        path: ['name'],
      });
    }

    if (regNum && !isValidRegNum(regNum)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be exactly 7 digits',
        path: ['regNum'],
      });
    }

    if (contact && !isValidPhone(contact)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be a valid phone number (e.g. 03001234567 or +923001234567)',
        path: ['contact'],
      });
    }

    if (email && !z.string().email().safeParse(email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid email address',
        path: ['email'],
      });
    }
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
  presidentName: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.trim() === '' || /^[a-zA-Z., \-]+$/.test(val),
      { message: 'Only letters, spaces, dots, commas, and dashes allowed' },
    ),
  presidentRegNum: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      isValidRegNum,
      { message: 'Must be exactly 7 digits' },
    ),
  presidentFaculty: z.string().optional().or(z.literal('')),
  presidentContact: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      isValidPhone,
      { message: 'Must be a valid phone number (e.g. 03001234567 or +923001234567)' },
    ),
  presidentEmail: optionalEmail,
  vp: executiveMemberSchema,
  gs: executiveMemberSchema,
  ec: executiveMemberSchema,
  treasurer: executiveMemberSchema,
  dl: executiveMemberSchema,
  otherMembers: z.array(executiveMemberSchema).optional(),
});

export type SocietySetupFormData = z.infer<typeof societySetupSchema>;







