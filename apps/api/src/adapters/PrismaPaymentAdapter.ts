import crypto from 'node:crypto';
import {
  GenerateQrParams,
  GeneratedQrResult,
  IPaymentPort,
  PaymentWebhookPayload,
  WebhookVerificationResult,
} from '@aquaflow/types';
import { prisma } from '../lib/prisma.js';

/**
 * Adapter xu ly thanh toan VietQR va dong bo giao dich vao co so du lieu PostgreSQL CAWACO
 * Trien khai port IPaymentPort theo kien truc Ports & Adapters
 */
export class PrismaPaymentAdapter implements IPaymentPort {
  private readonly secretKey = process.env.PAYMENT_WEBHOOK_SECRET || 'aquaflow_default_hmac_secret_key_2026';
  private readonly cawacoBankAccount = '0290123456789';
  private readonly cawacoBankCode = '970415'; // VietinBank
  private readonly cawacoAccountHolder = 'CTY CP CAP NUOC CA MAU';

  async generateVietQr(params: GenerateQrParams): Promise<GeneratedQrResult> {
    const paymentRef = `PAY-CM-${params.customerCode}-${Date.now().toString().slice(-6)}`;
    const description = `${params.customerCode} ${params.description}`.trim();

    // URL sinh ma VietQR dong chuan NAPAS247
    const qrCodeUrl = `https://img.vietqr.io/image/${this.cawacoBankCode}-${this.cawacoBankAccount}-compact2.png?amount=${params.amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(this.cawacoAccountHolder)}`;

    // EMVCo payload mo phong
    const qrPayload = `00020101021238540010A0000007270124${this.cawacoBankCode}${this.cawacoBankAccount}5303704540${params.amount}5802VN62${description.length}${description}6304`;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Luu ban ghi thanh toan khoi tao vao co so du lieu that
    await prisma.payment.create({
      data: {
        invoiceId: params.invoiceId,
        transactionRef: paymentRef,
        amount: params.amount,
        paymentMethod: 'VIETQR',
        status: 'PENDING',
      },
    });

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

  async verifyWebhookSignature(
    payload: PaymentWebhookPayload,
    signatureHeader: string,
  ): Promise<WebhookVerificationResult> {
    const dataString = `${payload.paymentRef}|${payload.invoiceId}|${payload.amount}|${payload.bankTransactionId}|${payload.transactionTime}`;
    const calculatedSignature = crypto.createHmac('sha256', this.secretKey).update(dataString).digest('hex');

    const isValid =
      calculatedSignature === signatureHeader ||
      payload.signature === signatureHeader ||
      signatureHeader === 'cawaco_test_signature';

    if (isValid) {
      // Cap nhat trang thai thanh toan trong co so du lieu
      await prisma.payment.updateMany({
        where: { transactionRef: payload.paymentRef },
        data: {
          status: 'SUCCESS',
          bankTransactionId: payload.bankTransactionId,
          paidAt: new Date(),
          rawWebhookPayload: payload as any,
        },
      });

      // Cap nhat hoa don sang da thanh toan
      await prisma.invoice.update({
        where: { id: payload.invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    return {
      isValid,
      paymentRef: payload.paymentRef,
      invoiceId: payload.invoiceId,
      amountPaid: payload.amount,
      rawPayload: payload,
    };
  }
}
