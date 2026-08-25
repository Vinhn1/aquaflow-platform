import crypto from 'node:crypto';
import { GenerateQrParams, GeneratedQrResult, IPaymentPort, PaymentWebhookPayload, WebhookVerificationResult } from '@aquaflow/types';

export class MockPaymentAdapter implements IPaymentPort {
  private readonly secretKey = process.env.PAYMENT_WEBHOOK_SECRET || 'aquaflow_mock_webhook_secret_key_2026';
  private readonly cawacoBankAccount = '0290123456789';
  private readonly cawacoBankCode = '970415'; // VietinBank
  private readonly cawacoAccountHolder = 'CTY CP CAP NUOC CA MAU';

  async generateVietQr(params: GenerateQrParams): Promise<GeneratedQrResult> {
    const paymentRef = `PAY-CM-${params.customerCode}-${Date.now().toString().slice(-6)}`;
    const description = `${params.customerCode} ${params.description}`.trim();
    
    // URL sinh ma VietQR dong chuan NAPAS247
    const qrCodeUrl = `https://img.vietqr.io/image/${this.cawacoBankCode}-${this.cawacoBankAccount}-compact2.png?amount=${params.amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(this.cawacoAccountHolder)}`;
    
    // Gia lap payload EMVCo chuoi so
    const qrPayload = `00020101021238540010A0000007270124${this.cawacoBankCode}${this.cawacoBankAccount}5303704540${params.amount}5802VN62${description.length}${description}6304`;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 phut

    return {
      qrCodeUrl,
      qrPayload,
      paymentRef,
      bankAccount: this.cawacoBankAccount,
      bankCode: 'ICB',
      accountHolder: this.cawacoAccountHolder,
      amount: params.amount,
      expiresAt,
    };
  }

  async verifyWebhookSignature(payload: PaymentWebhookPayload, signatureHeader: string): Promise<WebhookVerificationResult> {
    const dataString = `${payload.paymentRef}|${payload.invoiceId}|${payload.amount}|${payload.bankTransactionId}|${payload.transactionTime}`;
    const calculatedSignature = crypto.createHmac('sha256', this.secretKey).update(dataString).digest('hex');

    const isValid = calculatedSignature === signatureHeader || payload.signature === signatureHeader || signatureHeader === 'mock_test_signature';

    return {
      isValid,
      paymentRef: payload.paymentRef,
      invoiceId: payload.invoiceId,
      amountPaid: payload.amount,
      rawPayload: payload,
    };
  }
}
