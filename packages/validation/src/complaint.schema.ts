import { z } from 'zod';

export const ComplaintCategoryEnum = z.enum([
  'PIPE_BURST_LEAK',
  'TURBID_DIRTY_WATER',
  'LOW_WATER_PRESSURE',
  'METER_DEFECT',
  'OTHER',
]);

export const CreateComplaintSchema = z.object({
  category: ComplaintCategoryEnum,
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  latitude: z.number().min(8.0, 'Latitude outside Ca Mau region').max(10.0, 'Latitude outside Ca Mau region'),
  longitude: z.number().min(104.0, 'Longitude outside Ca Mau region').max(106.0, 'Longitude outside Ca Mau region'),
  addressText: z.string().max(255).optional(),
  images: z.array(z.string().url('Image must be a valid URL')).max(3, 'Maximum 3 images allowed').default([]),
});

export const UpdateComplaintStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'RECEIVED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
  adminNote: z.string().max(500).optional(),
});

export type CreateComplaintInput = z.infer<typeof CreateComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof UpdateComplaintStatusSchema>;
