import { GeneratedQrResult, IInvoicePort, IPaymentPort, PaymentWebhookPayload, WebhookVerificationResult } from '@aquaflow/types';

export class PaymentService {
  private processedTransactions = new Set<string>();

  constructor(
    private readonly paymentPort: IPaymentPort,
    private readonly invoicePort: IInvoicePort
  ) {}

  async generateInvoiceVietQr(invoiceId: string): Promise<GeneratedQrResult> {
    const invoice = await this.invoicePort.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error('HÓA_ĐƠN_KHÔNG_TỒN_TẠI: Không tìm thấy hóa đơn cần thanh toán');
    }

    if (invoice.status === 'PAID') {
      throw new Error('HÓA_ĐƠN_ĐÃ_THANH_TOÁN: Hóa đơn này đã được thanh toán trước đó');
    }

    return this.paymentPort.generateVietQr({
      invoiceId: invoice.id,
      customerCode: invoice.customerCode,
      amount: invoice.totalAmount,
      description: invoice.period.replace('/', ''),
    });
  }

  async processPaymentWebhook(payload: PaymentWebhookPayload, signatureHeader: string): Promise<{ success: boolean; message: string }> {
    // 1. Kiem tra tinh lap lai (Idempotency)
    if (this.processedTransactions.has(payload.bankTransactionId)) {
      return { success: true, message: 'Giao dịch đã được ghi nhận trước đó (Idempotent)' };
    }

    // 2. Xac thuc chu ky bao mat HMAC
    const verification: WebhookVerificationResult = await this.paymentPort.verifyWebhookSignature(payload, signatureHeader);
    if (!verification.isValid) {
      throw new Error('CHỮ_KÝ_KHÔNG_HỢP_LỆ: Chữ ký xác thực Webhook không trùng khớp');
    }

    // 3. Cap nhat trang thai hoa don
    const invoice = await this.invoicePort.getInvoiceById(payload.invoiceId);
    if (invoice) {
      invoice.status = 'PAID';
      invoice.paidAt = payload.transactionTime || new Date().toISOString();
      this.processedTransactions.add(payload.bankTransactionId);
      return { success: true, message: 'Thanh toán thành công và đã gạch nợ hóa đơn' };
    }

    throw new Error('HÓA_ĐƠN_KHÔNG_TỒN_TẠI: Không tìm thấy hóa đơn cần gạch nợ');
  }
}
