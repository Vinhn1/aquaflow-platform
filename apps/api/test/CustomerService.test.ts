import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { MockCustomerAdapter } from '../src/adapters/MockCustomerAdapter.js';
import { CustomerService } from '../src/services/CustomerService.js';

describe('CustomerService - Quản lý liên kết mã danh bộ', () => {
  const customerAdapter = new MockCustomerAdapter();
  const customerService = new CustomerService(customerAdapter);

  test('Lấy danh sách mã danh bộ đã liên kết của người dùng', async () => {
    const meters = await customerService.getUserMeters('usr-zalo-8891');
    assert.equal(meters.length, 2);
    assert.equal(meters[0].customerCode, 'CM102938');
    assert.equal(meters[0].label, 'Nhà riêng');
  });

  test('Liên kết mã danh bộ mới hợp lệ', async () => {
    const linked = await customerService.linkMeter('usr-zalo-8891', 'CM309182', 'Nhà Trần Văn Thời');
    assert.equal(linked.customerCode, 'CM309182');
    assert.equal(linked.label, 'Nhà Trần Văn Thời');
    assert.equal(linked.ownerName, 'TRẦN VĂN HÙNG');
  });

  test('Báo lỗi khi liên kết mã danh bộ không tồn tại trên hệ thống', async () => {
    await assert.rejects(
      async () => {
        await customerService.linkMeter('usr-zalo-8891', 'CM999999', 'Nhà không có thật');
      },
      (err: Error) => {
        assert.ok(err.message.includes('MÃ_DANH_BỘ_KHÔNG_TỒN_TẠI'));
        return true;
      }
    );
  });

  test('Báo lỗi khi liên kết mã danh bộ đã tồn tại trong tài khoản', async () => {
    await assert.rejects(
      async () => {
        await customerService.linkMeter('usr-zalo-8891', 'CM102938', 'Nhà riêng trùng lặp');
      },
      (err: Error) => {
        assert.ok(err.message.includes('MÃ_DANH_BỘ_ĐÃ_LIÊN_KẾT'));
        return true;
      }
    );
  });
});
