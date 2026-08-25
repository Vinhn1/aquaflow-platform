import { z } from 'zod';

export const GeneratePaymentQrSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID format'),
  paymentMethod: z.enum(['VIETQR', 'BANK_TRANSFER']).default('VIETQR'),
});

export const PaymentWebhookPayloadSchema = z.object({
  paymentRef: z.string().min(1, 'Payment reference is required'),
  invoiceId: z.string().uuid('Invalid invoice ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  bankTransactionId: z.string().min(1, 'Bank transaction ID is required'),
  transactionTime: z.string().datetime({ offset: true }).or(z.string().min(1)),
  signature: z.string().min(1, 'Signature is required'),
});

export type GeneratePaymentQrInput = z.infer<typeof GeneratePaymentQrSchema>;
export type PaymentWebhookPayloadInput = z.infer<typeof PaymentWebhookPayloadSchema>;
