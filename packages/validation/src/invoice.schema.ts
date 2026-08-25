import { z } from 'zod';

export const GetInvoicesQuerySchema = z.object({
  customerCode: z.string().min(1, 'Mã danh bộ khách hàng là bắt buộc'),
  status: z.enum(['UNPAID', 'PROCESSING', 'PAID', 'CANCELLED']).optional(),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Kỳ hóa đơn phải có định dạng YYYY-MM (Ví dụ: 2026-08)').optional(),
  page: z.coerce.number().int().positive('Số trang phải lớn hơn 0').default(1),
  pageSize: z.coerce.number().int().positive().max(100, 'Số lượng mỗi trang tối đa là 100').default(20),
});

export const GetInvoiceDetailParamsSchema = z.object({
  id: z.string().uuid('Định dạng mã hóa đơn không hợp lệ'),
});

export const GetConsumptionHistoryQuerySchema = z.object({
  customerCode: z.string().min(1, 'Mã danh bộ khách hàng là bắt buộc'),
  monthsLimit: z.coerce.number().int().min(1, 'Tối thiểu 1 tháng').max(24, 'Tối đa 24 tháng').default(12),
});

export type GetInvoicesQuery = z.infer<typeof GetInvoicesQuerySchema>;
export type GetInvoiceDetailParams = z.infer<typeof GetInvoiceDetailParamsSchema>;
export type GetConsumptionHistoryQuery = z.infer<typeof GetConsumptionHistoryQuerySchema>;
