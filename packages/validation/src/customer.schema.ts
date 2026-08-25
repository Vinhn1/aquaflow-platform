import { z } from 'zod';

export const LinkCustomerMeterSchema = z.object({
  customerCode: z
    .string()
    .min(4, 'Customer code must be at least 4 characters')
    .max(20, 'Customer code must not exceed 20 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Customer code must be alphanumeric'),
  label: z
    .string()
    .max(50, 'Label cannot exceed 50 characters')
    .default('Nha rieng'),
  verificationCode: z.string().optional(),
});

export const UpdateCustomerMeterLabelSchema = z.object({
  label: z.string().min(1, 'Label cannot be empty').max(50, 'Label cannot exceed 50 characters'),
  isDefault: z.boolean().optional(),
});

export type LinkCustomerMeterInput = z.infer<typeof LinkCustomerMeterSchema>;
export type UpdateCustomerMeterLabelInput = z.infer<typeof UpdateCustomerMeterLabelSchema>;
