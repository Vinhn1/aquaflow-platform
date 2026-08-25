import { z } from 'zod';

export const ServiceTypeEnum = z.enum(
  [
    'NEW_METER_REGISTRATION',
    'BILLING_PAYMENT',
    'CONTRACT_TRANSFER',
    'COMPLAINT_INSPECTION',
  ],
  {
    errorMap: () => ({ message: 'Dịch vụ yêu cầu không hợp lệ' }),
  }
);

export const BookQueueTicketSchema = z.object({
  branchId: z.string().min(1, 'Mã chi nhánh là bắt buộc'),
  serviceType: ServiceTypeEnum,
  customerName: z
    .string()
    .min(2, 'Tên khách hàng phải có ít nhất 2 ký tự')
    .max(100, 'Tên khách hàng không được vượt quá 100 ký tự'),
  phone: z.string().optional(),
});

export const CallNextTicketSchema = z.object({
  branchId: z.string().min(1, 'Mã chi nhánh là bắt buộc'),
  counterId: z.string().min(1, 'Mã quầy giao dịch là bắt buộc'),
  counterName: z.string().optional(),
  serviceType: ServiceTypeEnum.optional(),
});

export const CompleteTicketSchema = z.object({
  ticketId: z.string().min(1, 'Mã vé hàng đợi là bắt buộc'),
  counterId: z.string().min(1, 'Mã quầy giao dịch là bắt buộc'),
  notes: z.string().max(255, 'Ghi chú không được vượt quá 255 ký tự').optional(),
});

export type BookQueueTicketInput = z.infer<typeof BookQueueTicketSchema>;
export type CallNextTicketInput = z.infer<typeof CallNextTicketSchema>;
export type CompleteTicketInput = z.infer<typeof CompleteTicketSchema>;
