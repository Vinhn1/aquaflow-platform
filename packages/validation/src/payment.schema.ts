import { z } from 'zod';

export const GeneratePaymentQrSchema = z.object({
  invoiceId: z.string().uuid('Định dạng mã hóa đơn không hợp lệ'),
  paymentMethod: z.enum(['VIETQR', 'BANK_TRANSFER']).default('VIETQR'),
});

export const PaymentWebhookPayloadSchema = z.object({
  paymentRef: z.string().min(1, 'Mã tham chiếu thanh toán là bắt buộc'),
  invoiceId: z.string().uuid('Mã hóa đơn không hợp lệ'),
  amount: z.number().positive('Số tiền thanh toán phải lớn hơn 0'),
  bankTransactionId: z.string().min(1, 'Mã giao dịch ngân hàng là bắt buộc'),
  transactionTime: z.string().datetime({ offset: true }).or(z.string().min(1, 'Thời gian giao dịch là bắt buộc')),
  signature: z.string().min(1, 'Chữ ký bảo mật webhook là bắt buộc'),
});

export type GeneratePaymentQrInput = z.infer<typeof GeneratePaymentQrSchema>;
export type PaymentWebhookPayloadInput = z.infer<typeof PaymentWebhookPayloadSchema>;
