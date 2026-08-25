import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { createApp } from '../src/app.js';

describe('Integration Tests - Toàn bộ API Endpoints của AquaFlow', () => {
  const app = createApp();
  let server: any;
  let baseUrl: string;

  test('Khởi động HTTP server cho integration testing', async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
    assert.ok(baseUrl);
  });

  test('GET /health - Trạng thái hệ thống hoạt động', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'UP');
    assert.equal(body.service, 'AquaFlow CAWACO API');
  });

  test('POST /api/v1/auth/zalo - Đăng nhập bằng Zalo Access Token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/zalo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: 'zalo_test_token_cawaco_123456' }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.fullName, 'Nguyễn Văn An');
  });

  test('GET /api/v1/invoices - Tra cứu hóa đơn của mã danh bộ CM102938', async () => {
    const res = await fetch(`${baseUrl}/api/v1/invoices?customerCode=CM102938`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
    assert.equal(body.data[0].customerCode, 'CM102938');
  });

  test('POST /api/v1/payments/generate-qr - Sinh mã VietQR cho hóa đơn', async () => {
    const res = await fetch(`${baseUrl}/api/v1/payments/generate-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: 'inv-uuid-082026' }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.qrCodeUrl.includes('vietqr'));
    assert.equal(body.data.amount, 224250);
  });

  test('POST /api/v1/queue/tickets - Người dân bốc số trực tuyến', async () => {
    const res = await fetch(`${baseUrl}/api/v1/queue/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchId: 'b1',
        serviceType: 'NEW_METER_REGISTRATION',
        customerName: 'Nguyễn Văn An',
        phone: '0918234567',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.ticketNumber);
    assert.equal(body.data.status, 'WAITING');
  });

  test('POST /api/v1/complaints - Gửi phản ánh sự cố rò rỉ nước', async () => {
    const res = await fetch(`${baseUrl}/api/v1/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'PIPE_BURST_LEAK',
        description: 'Bể ống nước trước nhà số 204 Quang Trung, nước tràn mạnh.',
        latitude: 9.1768,
        longitude: 105.1502,
        address: '204 Quang Trung, P. Tân Thành, TP. Cà Mau',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.category, 'PIPE_BURST_LEAK');
    assert.equal(body.data.status, 'SUBMITTED');
  });

  test('GET /api/v1/news - Lấy danh sách tin tức và lịch cúp nước', async () => {
    const res = await fetch(`${baseUrl}/api/v1/news`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length >= 3);
  });

  test('GET /api/v1/branches - Lấy danh sách chi nhánh và điểm giao dịch', async () => {
    const res = await fetch(`${baseUrl}/api/v1/branches`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length >= 3);
  });

  test('Đóng HTTP test server sau khi hoàn tất', async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
