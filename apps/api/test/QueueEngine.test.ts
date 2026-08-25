import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { MockQueueAdapter } from '../src/adapters/MockQueueAdapter.js';
import { QueueEngine } from '../src/services/QueueEngine.js';

describe('QueueEngine - Quản lý bốc số và hàng đợi quầy giao dịch', () => {
  const queueAdapter = new MockQueueAdapter();
  const queueEngine = new QueueEngine(queueAdapter);

  test('Người dân bốc vé số điện tử thành công', async () => {
    const ticket = await queueEngine.bookTicket({
      branchId: 'b1',
      serviceType: 'NEW_METER_REGISTRATION',
      userId: 'usr-001',
      customerName: 'Nguyễn Văn An',
      phone: '0918234567',
    });

    assert.ok(ticket.ticketNumber.startsWith('A-'));
    assert.equal(ticket.status, 'WAITING');
    assert.equal(ticket.positionInQueue, 1);
    assert.equal(ticket.estimatedWaitMinutes, 5);
  });

  test('Người dân thứ hai bốc số tăng vị trí hàng đợi', async () => {
    const ticket2 = await queueEngine.bookTicket({
      branchId: 'b1',
      serviceType: 'BILLING_PAYMENT',
      userId: 'usr-002',
      customerName: 'Trần Thị Thu',
      phone: '0919888999',
    });

    assert.ok(ticket2.ticketNumber.startsWith('B-'));
    assert.equal(ticket2.positionInQueue, 2);
    assert.equal(ticket2.estimatedWaitMinutes, 10);
  });

  test('Nhân viên quầy gọi số tiếp theo và hoàn tất lượt', async () => {
    const calledTicket = await queueEngine.callNext('b1', '01');
    assert.ok(calledTicket);
    assert.equal(calledTicket?.status, 'SERVING');
    assert.equal(calledTicket?.counterId, '01');

    const completed = await queueEngine.complete(calledTicket!.id, '01');
    assert.equal(completed, true);

    const ticketStatus = await queueEngine.getTicket(calledTicket!.id);
    assert.equal(ticketStatus?.status, 'COMPLETED');
  });
});
