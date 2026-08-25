import { z } from 'zod';

export const NewsCategoryEnum = z.enum([
  'ANNOUNCEMENT',
  'MAINTENANCE_OUTAGE',
  'WATER_SAFETY',
  'TARIFF_POLICY',
]);

export const GetNewsQuerySchema = z.object({
  category: NewsCategoryEnum.optional(),
  isOutageAlert: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export const CreateNewsSchema = z.object({
  title: z.string().min(5).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and dashes'),
  summary: z.string().min(10).max(500),
  content: z.string().min(20),
  category: NewsCategoryEnum.default('ANNOUNCEMENT'),
  isOutageAlert: z.boolean().default(false),
  affectedArea: z.string().max(255).optional(),
  outageStartTime: z.string().datetime().optional(),
  outageEndTime: z.string().datetime().optional(),
  isPublished: z.boolean().default(true),
});

export type GetNewsQuery = z.infer<typeof GetNewsQuerySchema>;
export type CreateNewsInput = z.infer<typeof CreateNewsSchema>;
