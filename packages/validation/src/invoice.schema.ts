import { z } from 'zod';

export const GetInvoicesQuerySchema = z.object({
  customerCode: z.string().min(1, 'Customer code is required'),
  status: z.enum(['UNPAID', 'PROCESSING', 'PAID', 'CANCELLED']).optional(),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must match YYYY-MM format').optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const GetInvoiceDetailParamsSchema = z.object({
  id: z.string().uuid('Invalid invoice ID format'),
});

export const GetConsumptionHistoryQuerySchema = z.object({
  customerCode: z.string().min(1, 'Customer code is required'),
  monthsLimit: z.coerce.number().int().min(1).max(24).default(12),
});

export type GetInvoicesQuery = z.infer<typeof GetInvoicesQuerySchema>;
export type GetInvoiceDetailParams = z.infer<typeof GetInvoiceDetailParamsSchema>;
export type GetConsumptionHistoryQuery = z.infer<typeof GetConsumptionHistoryQuerySchema>;
