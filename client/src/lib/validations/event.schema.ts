import { z } from 'zod';

const optionalUrl = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => !val || val.trim() === '' || val.startsWith('/uploads/') || val.startsWith('http://') || val.startsWith('https://') || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL address (e.g. https://example.com) or uploaded image' }
  );

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Event title must be at least 3 characters')
      .max(150, 'Event title cannot exceed 150 characters'),
    description: z
      .string()
      .min(10, 'Event description must be at least 10 characters'),
    eventDate: z.string().min(1, 'Event date is required'),
    startTime: z
      .string()
      .min(1, 'Start time is required')
      .regex(timeRegex, 'Start time must be in HH:mm 24-hour format'),
    endTime: z
      .string()
      .min(1, 'End time is required')
      .regex(timeRegex, 'End time must be in HH:mm 24-hour format'),
    venue: z
      .string()
      .min(2, 'Venue location must be at least 2 characters')
      .max(100, 'Venue cannot exceed 100 characters'),
    coverImageUrl: optionalUrl,
    videoUrl: optionalUrl,
    registrationLink: optionalUrl,
    eventType: z.string().optional(),
    inChargeName: z.string().optional(),
    inChargeRegNum: z.string().optional(),
    inChargeContact: z.string().optional(),
    submitForApproval: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (!data.eventDate) return true;
      const selected = new Date(data.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    },
    {
      message: 'Event date cannot be in the past',
      path: ['eventDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      return endH * 60 + endM > startH * 60 + startM;
    },
    {
      message: 'End time must be strictly after start time',
      path: ['endTime'],
    },
  );

export type EventFormData = z.infer<typeof eventFormSchema>;
