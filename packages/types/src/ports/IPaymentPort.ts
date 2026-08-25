export interface GenerateQrParams {
  invoiceId: string;
  customerCode: string;
  amount: number;
  description: string;
}

export interface GeneratedQrResult {
  qrCodeUrl: string;
  qrPayload: string;
  paymentRef: string;
  bankAccount: string;
  bankCode: string;
  accountHolder: string;
  amount: number;
  expiresAt: string;
}

export interface PaymentWebhookPayload {
  paymentRef: string;
  invoiceId: string;
  amount: number;
  bankTransactionId: string;
  transactionTime: string;
  signature: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  paymentRef: string;
  invoiceId: string;
  amountPaid: number;
  rawPayload: unknown;
}

export interface IPaymentPort {
  generateVietQr(params: GenerateQrParams): Promise<GeneratedQrResult>;
  verifyWebhookSignature(payload: PaymentWebhookPayload, signatureHeader: string): Promise<WebhookVerificationResult>;
}
