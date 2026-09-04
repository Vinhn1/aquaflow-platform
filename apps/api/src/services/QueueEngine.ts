import { IQueuePort, IssueTicketParams, QueueTicketDto, ServiceType } from '@aquaflow/types';
import { prisma } from '../lib/prisma.js';

// === Trang thai quan ly quay giao dich ===
type CounterStatusType = 'OPEN' | 'PAUSED' | 'CLOSED';

interface CounterInfo {
  status: CounterStatusType;
  pauseNote?: string;       // Ghi chu ly do tam nghi / dong quay
  updatedAt: string;        // Thoi diem cap nhat cuoi
  cooldownUntil?: number;   // Timestamp: khong auto-call truoc thoi diem nay (sau khi xong)
}

// Luu in-memory — reset khi khoi dong lai server (phu hop voi truong hop thay doi theo ngay)
const _counterStore = new Map<string, CounterInfo>();

// === Kiem tra gio lam viec thuc te CAWACO ===
// Thu 2 - Thu 6: 07:30 - 17:00 (giu nguyen sau gio nghi trua 11:30-13:30 nhan vien tu quan)
function isWithinWorkingHours(): boolean {
  const now = new Date();
  // Convert sang gio Viet Nam (UTC+7)
  const vnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const day = vnNow.getDay(); // 0=CN, 1=T2, ..., 6=T7
  if (day === 0 || day === 6) return false; // Ngay nghi

  const h = vnNow.getHours();
  const m = vnNow.getMinutes();
  const totalMin = h * 60 + m;
  // 07:30 = 450 phut, 17:00 = 1020 phut
  return totalMin >= 450 && totalMin < 1020;
}

function getWorkingHoursNote(): string {
  const now = new Date();
  const vnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const day = vnNow.getDay();
  if (day === 0 || day === 6) {
    return 'Hôm nay là ngày nghỉ. Số vé của bạn vẫn còn hiệu lực — hệ thống sẽ tự động gọi vào ngày làm việc tiếp theo (Thứ 2).';
  }
  const h = vnNow.getHours();
  if (h < 7 || (h === 7 && vnNow.getMinutes() < 30)) {
    return 'Chưa đến giờ làm việc. Hệ thống tiếp nhận từ 07:30. Số vé của bạn vẫn hợp lệ.';
  }
  if (h >= 17) {
    return 'Đã ngoài giờ hành chính (17:00). Số vé của bạn vẫn còn hiệu lực — sẽ được gọi vào sáng mai lúc 07:30.';
  }
  return '';
}

export class QueueEngine {
  constructor(private readonly queuePort: IQueuePort) {}

  // === CRUD Vé ===
  async bookTicket(params: IssueTicketParams): Promise<QueueTicketDto> {
    return this.queuePort.issueTicket(params);
  }

  async getTicket(ticketId: string): Promise<QueueTicketDto | null> {
    return this.queuePort.getTicketStatus(ticketId);
  }

  async cancelTicket(ticketId: string, userId: string): Promise<boolean> {
    return this.queuePort.cancelTicket(ticketId, userId);
  }

  async callNext(branchId: string, counterId: string, serviceType?: ServiceType): Promise<QueueTicketDto | null> {
    const existing = _counterStore.get(counterId);
    if (existing) {
      existing.cooldownUntil = undefined;
    }
    return this.queuePort.callNextTicket(branchId, counterId, serviceType);
  }

  async complete(ticketId: string, counterId: string): Promise<boolean> {
    const ok = await this.queuePort.completeTicket(ticketId, counterId);
    if (ok) {
      // Dat thoi gian cho 30 giay truoc khi auto-call so tiep theo
      const existing = _counterStore.get(counterId) || { status: 'OPEN' as CounterStatusType, updatedAt: new Date().toISOString() };
      _counterStore.set(counterId, {
        ...existing,
        cooldownUntil: Date.now() + 30_000, // 30 giay
      });
    }
    return ok;
  }

  async getOverview(branchId: string): Promise<{ waitingCount: number; activeCountersCount: number }> {
    return this.queuePort.getBranchQueueOverview(branchId);
  }

  // === Quan ly trang thai quay ===
  setCounterStatus(counterId: string, status: CounterStatusType, pauseNote?: string): void {
    const existing = _counterStore.get(counterId);
    _counterStore.set(counterId, {
      status,
      pauseNote: status === 'OPEN' ? undefined : pauseNote,
      updatedAt: new Date().toISOString(),
      // Giu cooldown neu dang trong thoi gian cho
      cooldownUntil: existing?.cooldownUntil,
    });
  }

  getCounterStatus(counterId: string): CounterInfo {
    return _counterStore.get(counterId) || {
      status: 'OPEN',
      updatedAt: new Date().toISOString(),
    };
  }

  getAllCounterStatuses(): Record<string, CounterInfo & { withinWorkingHours: boolean }> {
    // Tra ve trang thai tat ca quay + trang thai gio lam viec chung
    const result: Record<string, CounterInfo & { withinWorkingHours: boolean }> = {};
    // Dam bao cac quay mac dinh duoc biet boi admin ngay ca khi chua set
    const defaultCounters = ['CTR-01', 'CTR-02', 'CTR-03', 'CTR-04'];
    defaultCounters.forEach((id) => {
      const info = _counterStore.get(id) || { status: 'OPEN' as CounterStatusType, updatedAt: new Date().toISOString() };
      result[id] = { ...info, withinWorkingHours: isWithinWorkingHours() };
    });
    // Them cac quay da duoc set tuy chinh
    _counterStore.forEach((info, id) => {
      result[id] = { ...info, withinWorkingHours: isWithinWorkingHours() };
    });
    return result;
  }

  // === Kiem tra co the auto-call khong ===
  canAutoCall(counterId: string): boolean {
    if (!isWithinWorkingHours()) return false;
    const info = _counterStore.get(counterId);
    if (!info) return true; // Mac dinh: OPEN neu chua set
    if (info.status !== 'OPEN') return false;
    if (info.cooldownUntil && Date.now() < info.cooldownUntil) return false;
    return true;
  }

  // Tra ve thoi gian cooldown con lai (ms), 0 neu da het
  getCooldownRemaining(counterId: string): number {
    const info = _counterStore.get(counterId);
    if (!info?.cooldownUntil) return 0;
    return Math.max(0, info.cooldownUntil - Date.now());
  }

  // === Lay danh sach ve (cho Admin) ===
  async listTickets(params: {
    branchId?: string;
    status?: string;
    today?: boolean;
    limit?: number;
  }): Promise<QueueTicketDto[]> {
    try {
      const where: any = {};
      if (params.branchId) where.branchId = params.branchId;
      if (params.status) where.status = params.status;
      if (params.today) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        where.issuedAt = { gte: today };
      }

      const tickets = await prisma.queueTicket.findMany({
        where,
        orderBy: { issuedAt: 'asc' },
        take: params.limit || 50,
        include: { branch: true },
      });

      return tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        branchId: t.branchId,
        branchName: (t as any).branch?.name || '',
        serviceType: t.serviceType as ServiceType,
        userId: t.userId,
        customerName: t.customerName,
        status: t.status as any,
        positionInQueue: t.positionInQueue,
        estimatedWaitMinutes: t.estimatedWaitMinutes,
        issuedAt: t.issuedAt.toISOString(),
        calledAt: t.calledAt?.toISOString(),
        completedAt: t.completedAt?.toISOString(),
        counterId: t.counterId ?? undefined,
        counterName: t.counterName ?? undefined,
      }));
    } catch {
      return [];
    }
  }

  // === Lay thong tin trang thai ve day du cho Mini App ===
  async getTicketWithContext(ticketId: string): Promise<(QueueTicketDto & {
    withinWorkingHours: boolean;
    workingHoursNote: string;
    counterStatus?: CounterStatusType;
    counterPauseNote?: string;
    cooldownRemaining?: number;
  }) | null> {
    const ticket = await this.queuePort.getTicketStatus(ticketId);
    if (!ticket) return null;

    // Map serviceType -> counterId de lay trang thai quay
    const SERVICE_COUNTER: Record<string, string> = {
      NEW_METER_REGISTRATION: 'CTR-01',
      BILLING_PAYMENT: 'CTR-02',
      CONTRACT_TRANSFER: 'CTR-03',
      COMPLAINT_INSPECTION: 'CTR-04',
    };
    const counterIdForService = SERVICE_COUNTER[ticket.serviceType] || 'CTR-01';
    const counterInfo = this.getCounterStatus(counterIdForService);

    return {
      ...ticket,
      withinWorkingHours: isWithinWorkingHours(),
      workingHoursNote: getWorkingHoursNote(),
      counterStatus: counterInfo.status,
      counterPauseNote: counterInfo.pauseNote,
      cooldownRemaining: this.getCooldownRemaining(counterIdForService),
    };
  }
}
