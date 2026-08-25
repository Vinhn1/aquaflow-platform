import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { MockPaymentAdapter } from '../src/adapters/MockPaymentAdapter.js';
import { MockInvoiceAdapter } from '../src/adapters/MockInvoiceAdapter.js';
import { PaymentService } from '../src/services/PaymentService.js';

describe('PaymentService - Xử lý VietQR và Webhook gạch nợ', () => {
  const paymentAdapter = new MockPaymentAdapter();
  const invoiceAdapter = new MockInvoiceAdapter();
  const paymentService = new PaymentService(paymentAdapter, invoiceAdapter);

  test('Sinh mã VietQR động cho hóa đơn chưa thanh toán', async () => {
    const qrResult = await paymentService.generateInvoiceVietQr('inv-uuid-082026');
    assert.ok(qrResult.qrCodeUrl.includes('img.vietqr.io'));
    assert.equal(qrResult.amount, 224250);
    assert.equal(qrResult.accountHolder, 'CTY CP CAP NUOC CA MAU');
  });

  test('Từ chối sinh VietQR cho hóa đơn đã thanh toán', async () => {
    await assert.rejects(
      async () => {
        await paymentService.generateInvoiceVietQr('inv-uuid-072026');
      },
      (err: Error) => {
        assert.ok(err.message.includes('HÓA_ĐƠN_ĐÃ_THANH_TOÁN'));
        return true;
      }
    );
  });

  test('Xử lý Webhook thanh toán thành công và kiểm tra Idempotency', async () => {
    const payload = {
      paymentRef: 'PAY-CM-CM102938-123456',
      invoiceId: 'inv-uuid-082026',
      amount: 224250,
      bankTransactionId: 'TXN-MBB-998811',
      transactionTime: new Date().toISOString(),
      signature: 'mock_test_signature',
    };

    // Lan 1: Thanh toan thanh cong
    const res1 = await paymentService.processPaymentWebhook(payload, 'mock_test_signature');
    assert.equal(res1.success, true);
    assert.ok(res1.message.includes('Thanh toán thành công'));

    // Kiem tra hoa don da chuyen sang PAID
    const invoice = await invoiceAdapter.getInvoiceById('inv-uuid-082026');
    assert.equal(invoice?.status, 'PAID');

    // Lan 2: Webhook goi lai cung transaction ID (Idempotency test)
    const res2 = await paymentService.processPaymentWebhook(payload, 'mock_test_signature');
    assert.equal(res2.success, true);
    assert.ok(res2.message.includes('Idempotent'));
  });
});
