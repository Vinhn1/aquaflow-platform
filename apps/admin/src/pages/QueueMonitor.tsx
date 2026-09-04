import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { triggerSidebarCountRefresh } from '../hooks/useSidebarCounts';

// Cau hinh 4 quay giao dich CAWACO (co dinh theo nghiep vu)
const COUNTER_CONFIG = [
  { counterNumber: 1, counterId: 'CTR-01', serviceName: 'Đăng ký lắp mới', serviceType: 'NEW_METER_REGISTRATION' },
  { counterNumber: 2, counterId: 'CTR-02', serviceName: 'Thu ngân & Nộp tiền nước', serviceType: 'BILLING_PAYMENT' },
  { counterNumber: 3, counterId: 'CTR-03', serviceName: 'Sang tên / Chuyển hợp đồng', serviceType: 'CONTRACT_TRANSFER' },
  { counterNumber: 4, counterId: 'CTR-04', serviceName: 'Kiểm định & Khiếu nại', serviceType: 'COMPLAINT_INSPECTION' },
];

const HQ_BRANCH_ID = 'br-cawaco-hq';

type OperationalStatus = 'OPEN' | 'PAUSED' | 'CLOSED';

interface WaitingTicket {
  id: string;
  ticketNumber: string;
  customerName?: string;
  serviceType: string;
  issuedAt: string;
  estimatedWaitMinutes: number;
  positionInQueue: number;
}

interface CounterState {
  counterNumber: number;
  counterId: string;
  serviceName: string;
  serviceType: string;
  currentTicketNumber: string | null;
  currentTicketId: string | null;
  status: 'SERVING' | 'IDLE';
  // Trang thai van hanh (do nhan vien kiem soat)
  opStatus: OperationalStatus;
  pauseNote?: string;
  // Cooldown sau khi bam Xong (giam dem 30 giay)
  cooldownSecondsLeft: number;
}

const SERVICE_LABEL: Record<string, string> = {
  NEW_METER_REGISTRATION: 'Đăng ký lắp mới',
  BILLING_PAYMENT: 'Thu ngân & Nộp tiền nước',
  CONTRACT_TRANSFER: 'Sang tên / Chuyển hợp đồng',
  COMPLAINT_INSPECTION: 'Kiểm định & Khiếu nại',
};

// Kiem tra gio hanh chinh phia client (hien thi UI)
function isWithinWorkingHoursClient(): boolean {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const h = now.getHours();
  const m = now.getMinutes();
  const total = h * 60 + m;
  return total >= 450 && total < 1020; // 07:30 - 17:00
}

export const QueueMonitor: React.FC = () => {
  const { token } = useAuth();
  const [counters, setCounters] = useState<CounterState[]>(
    COUNTER_CONFIG.map((c) => ({
      ...c,
      currentTicketNumber: null,
      currentTicketId: null,
      status: 'IDLE',
      opStatus: 'OPEN',
      pauseNote: undefined,
      cooldownSecondsLeft: 0,
    }))
  );
  const [waitingList, setWaitingList] = useState<WaitingTicket[]>([]);
  const [totalServedToday, setTotalServedToday] = useState(0);
  const [branchId, setBranchId] = useState(HQ_BRANCH_ID);
  const [notification, setNotification] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [withinHours, setWithinHours] = useState(isWithinWorkingHoursClient());

  const pendingAutoCalls = useRef<Set<string>>(new Set());
  const cooldownTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
  };

  // Cap nhat trang thai gio hanh chinh moi phut
  useEffect(() => {
    const t = setInterval(() => setWithinHours(isWithinWorkingHoursClient()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Lay branchId that
  useEffect(() => {
    fetch('/api/v1/branches', { headers: authHeaders })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBranchId(json.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Lay trang thai van hanh cua cac quay tu API
  const fetchCounterStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/queue/counters/status', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const statuses = json.data as Record<string, { status: OperationalStatus; pauseNote?: string; cooldownUntil?: number }>;
        setCounters((prev) =>
          prev.map((c) => {
            const s = statuses[c.counterId];
            if (!s) return c;
            const cooldownMs = s.cooldownUntil ? Math.max(0, s.cooldownUntil - Date.now()) : 0;
            return {
              ...c,
              opStatus: s.status,
              pauseNote: s.pauseNote,
              cooldownSecondsLeft: Math.ceil(cooldownMs / 1000),
            };
          })
        );
      }
    } catch {}
  }, [token]);

  // Bat dau dem nguoc cooldown cho mot quay
  const startCooldown = useCallback((counterId: string, seconds: number) => {
    // Xoa timer cu neu co
    if (cooldownTimers.current.has(counterId)) {
      clearInterval(cooldownTimers.current.get(counterId)!);
    }
    setCounters((prev) =>
      prev.map((c) => (c.counterId === counterId ? { ...c, cooldownSecondsLeft: seconds } : c))
    );
    const timer = setInterval(() => {
      setCounters((prev) => {
        const counter = prev.find((c) => c.counterId === counterId);
        if (!counter || counter.cooldownSecondsLeft <= 1) {
          clearInterval(cooldownTimers.current.get(counterId)!);
          cooldownTimers.current.delete(counterId);
          return prev.map((c) => (c.counterId === counterId ? { ...c, cooldownSecondsLeft: 0 } : c));
        }
        return prev.map((c) =>
          c.counterId === counterId ? { ...c, cooldownSecondsLeft: c.cooldownSecondsLeft - 1 } : c
        );
      });
    }, 1000);
    cooldownTimers.current.set(counterId, timer);
  }, []);

  // Don dep timers khi unmount
  useEffect(() => {
    return () => {
      cooldownTimers.current.forEach((t) => clearInterval(t));
    };
  }, []);

  // Dat trang thai quay (OPEN / PAUSED / CLOSED)
  const setCounterOpStatus = async (counterId: string, status: OperationalStatus, note?: string) => {
    try {
      const res = await fetch(`/api/v1/queue/counters/${counterId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status, pauseNote: note }),
      });
      const json = await res.json();
      if (json.success) {
        setCounters((prev) =>
          prev.map((c) =>
            c.counterId === counterId
              ? { ...c, opStatus: status, pauseNote: note, cooldownSecondsLeft: 0 }
              : c
          )
        );
        setNotification(json.data?.message || `Quầy ${counterId} đã cập nhật trạng thái: ${status}`);
        setPausingCounterId(null);
        setPauseNote('');
      }
    } catch {
      setNotification('Lỗi kết nối khi thay đổi trạng thái quầy.');
    }
  };

  // Auto-call (chi goi khi quay OPEN + trong gio hanh chinh + het cooldown)
  const autoCallForCounter = useCallback(
    async (counter: CounterState) => {
      if (pendingAutoCalls.current.has(counter.counterId)) return;
      if (counter.opStatus !== 'OPEN') return;
      if (!withinHours) return;
      if (counter.cooldownSecondsLeft > 0) return;

      pendingAutoCalls.current.add(counter.counterId);
      try {
        const res = await fetch('/api/v1/queue/call-next', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
          },
          body: JSON.stringify({ branchId, counterId: counter.counterId, serviceType: counter.serviceType }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const ticket = json.data;
          setCounters((prev) =>
            prev.map((c) =>
              c.counterId === counter.counterId
                ? { ...c, currentTicketNumber: ticket.ticketNumber, currentTicketId: ticket.id, status: 'SERVING' }
                : c
            )
          );
          setNotification(`Quầy ${counter.counterNumber} tự động gọi: ${ticket.ticketNumber} — ${ticket.customerName || ''}`);
          triggerSidebarCountRefresh();
        }
      } catch {}
      finally {
        pendingAutoCalls.current.delete(counter.counterId);
      }
    },
    [branchId, token, withinHours]
  );

  // Poll hang doi
  const fetchQueueData = useCallback(async () => {
    try {
      const [waitingRes, servingRes, completedRes] = await Promise.all([
        fetch(`/api/v1/queue/tickets?branchId=${branchId}&status=WAITING&limit=20`, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}` },
        }),
        fetch(`/api/v1/queue/tickets?branchId=${branchId}&status=SERVING&limit=10`, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}` },
        }),
        fetch(`/api/v1/queue/tickets?branchId=${branchId}&status=COMPLETED&today=true`, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}` },
        }),
      ]);

      if (!waitingRes.ok && !servingRes.ok) {
        setLoadError('Không thể kết nối hàng đợi. Đang thử lại...');
        return;
      }
      setLoadError(null);

      const waitingJson = waitingRes.ok ? await waitingRes.json() : { success: false };
      const servingJson = servingRes.ok ? await servingRes.json() : { success: false };
      const completedJson = completedRes.ok ? await completedRes.json() : { success: false };

      const waitingTickets: WaitingTicket[] = waitingJson.success ? waitingJson.data : [];
      const servingTickets: WaitingTicket[] = servingJson.success ? servingJson.data : [];

      setWaitingList(waitingTickets);
      if (completedJson.success) setTotalServedToday(completedJson.data.length);

      // Cap nhat trang thai tung quay tu du lieu thuc
      setCounters((prev) => {
        const updated = prev.map((c) => {
          const active = servingTickets.find((t) => t.serviceType === c.serviceType);
          if (active) {
            return { ...c, currentTicketNumber: active.ticketNumber, currentTicketId: active.id, status: 'SERVING' as const };
          }
          return { ...c, currentTicketNumber: null, currentTicketId: null, status: 'IDLE' as const };
        });

        // Auto-call cho quay IDLE + OPEN + trong gio + het cooldown
        updated.forEach((counter) => {
          if (counter.status === 'IDLE' && counter.opStatus === 'OPEN' && counter.cooldownSecondsLeft === 0) {
            const hasWaiting = waitingTickets.some((t) => t.serviceType === counter.serviceType);
            if (hasWaiting) autoCallForCounter(counter);
          }
        });

        return updated;
      });
    } catch {
      setLoadError('Mất kết nối đến server hàng đợi. Đang thử lại...');
    }
  }, [branchId, token, autoCallForCounter]);

  useEffect(() => {
    fetchCounterStatuses();
    fetchQueueData();
    const queueTimer = setInterval(fetchQueueData, 3000);
    const statusTimer = setInterval(fetchCounterStatuses, 10_000);
    return () => {
      clearInterval(queueTimer);
      clearInterval(statusTimer);
    };
  }, [fetchQueueData, fetchCounterStatuses]);

  // Goi so thu cong (override - bo qua 30s cooldown ngay lap tuc)
  const handleCallNext = async (counter: CounterState) => {
    if (counter.opStatus !== 'OPEN') {
      setNotification('Quầy đang tạm nghỉ hoặc đã đóng. Vui lòng mở quầy trước khi gọi số.');
      return;
    }

    // Xoa ngay bo dem cooldown neu nhan vien chu dong click Goi tiep
    if (cooldownTimers.current.has(counter.counterId)) {
      clearInterval(cooldownTimers.current.get(counter.counterId)!);
      cooldownTimers.current.delete(counter.counterId);
    }
    setCounters((prev) =>
      prev.map((c) => (c.counterId === counter.counterId ? { ...c, cooldownSecondsLeft: 0 } : c))
    );

    try {
      const res = await fetch('/api/v1/queue/call-next', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ branchId, counterId: counter.counterId, serviceType: counter.serviceType }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const ticket = json.data;
        setCounters((prev) =>
          prev.map((c) =>
            c.counterId === counter.counterId
              ? { ...c, currentTicketNumber: ticket.ticketNumber, currentTicketId: ticket.id, status: 'SERVING', cooldownSecondsLeft: 0 }
              : c
          )
        );
        setNotification(`Quầy ${counter.counterNumber} đang gọi số: ${ticket.ticketNumber} — ${ticket.customerName || ''}`);
        fetchQueueData();
        triggerSidebarCountRefresh();
      } else {
        setNotification('Hiện không có khách hàng đang chờ cho thủ tục này.');
      }
    } catch {
      setNotification('Lỗi kết nối khi gọi số tiếp theo.');
    }
  };

  // Hoan thanh phuc vu: dat cooldown 30s, sau do auto-call so tiep
  const handleComplete = async (counter: CounterState) => {
    if (!counter.currentTicketId) return;
    try {
      const completeRes = await fetch('/api/v1/queue/complete', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ticketId: counter.currentTicketId, counterId: counter.counterId }),
      });
      const completeJson = await completeRes.json();
      if (!completeJson.success) {
        setNotification('Lỗi khi hoàn thành phục vụ. Vui lòng thử lại.');
        return;
      }

      const prevTicket = counter.currentTicketNumber;

      // Quay ve IDLE ngay lap tuc
      setCounters((prev) =>
        prev.map((c) =>
          c.counterId === counter.counterId
            ? { ...c, currentTicketNumber: null, currentTicketId: null, status: 'IDLE' }
            : c
        )
      );

      // Bat dau dem nguoc 30 giay (API da dat cooldown)
      startCooldown(counter.counterId, 30);
      setNotification(`Quầy ${counter.counterNumber} xong ${prevTicket} — Tự động gọi số tiếp sau 30 giây.`);

      fetchQueueData();
      triggerSidebarCountRefresh();
    } catch {
      setNotification('Lỗi kết nối khi hoàn thành phục vụ.');
    }
  };

  const calcWaitMins = (issuedAt: string) =>
    Math.floor((Date.now() - new Date(issuedAt).getTime()) / 60000);

  // Render badge trang thai van hanh
  const renderOpBadge = (opStatus: OperationalStatus, pauseNote?: string) => {
    if (opStatus === 'OPEN') return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">Đang mở</span>;
    if (opStatus === 'PAUSED') return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700" title={pauseNote}>
        Tạm nghỉ {pauseNote ? `— ${pauseNote}` : ''}
      </span>
    );
    return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-600">Đã đóng</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hệ Thống Gọi Số Quầy Giao Dịch</h2>
          <p className="text-sm text-slate-500 mt-1">
            Trụ sở chính CAWACO — 204 Quang Trung, TP. Cà Mau — Đồng bộ thực tế với Mini App
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!withinHours && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              Ngoài giờ hành chính — Auto-call tạm dừng
            </span>
          )}
          {loadError ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">{loadError}</span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Đang hoạt động</span>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-sm flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-semibold text-blue-700 hover:underline ml-3 shrink-0">Đóng</button>
        </div>
      )}

      {/* 4 Quay giao dich */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {counters.map((c) => (
          <div
            key={c.counterId}
            className={`p-5 rounded-xl border transition-all ${
              c.opStatus === 'PAUSED'
                ? 'bg-amber-50 border-amber-300'
                : c.opStatus === 'CLOSED'
                  ? 'bg-slate-100 border-slate-300 opacity-70'
                  : c.status === 'SERVING'
                    ? 'bg-white border-blue-300 shadow-sm ring-1 ring-blue-100'
                    : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3 gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quầy 0{c.counterNumber}</span>
              <div className="flex flex-col items-end gap-1">
                {renderOpBadge(c.opStatus, c.pauseNote)}
                {c.opStatus === 'OPEN' && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${c.status === 'SERVING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                    {c.status === 'SERVING' ? 'Đang phục vụ' : 'Chờ khách'}
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium h-8 line-clamp-2">{c.serviceName}</div>

            {/* Hien thi so thu tu hoac trang thai quay */}
            <div className={`my-4 py-3 rounded-lg text-center ${c.opStatus === 'PAUSED' ? 'bg-amber-100' : c.opStatus === 'CLOSED' ? 'bg-slate-200' : 'bg-slate-100'}`}>
              <div className="text-xs text-slate-400 uppercase font-semibold">
                {c.opStatus === 'PAUSED' ? 'Tạm nghỉ' : c.opStatus === 'CLOSED' ? 'Đã đóng' : 'Số thứ tự'}
              </div>
              {c.opStatus === 'OPEN' ? (
                <div className="text-3xl font-extrabold text-blue-900 tracking-wider">
                  {c.cooldownSecondsLeft > 0 ? (
                    <span className="text-amber-600 text-2xl">{c.cooldownSecondsLeft}s</span>
                  ) : (
                    c.currentTicketNumber || '---'
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-500 font-semibold mt-1 px-2 text-center leading-tight">
                  {c.pauseNote || (c.opStatus === 'CLOSED' ? 'Vé hàng đợi vẫn hợp lệ' : 'Đang tạm nghỉ')}
                </div>
              )}
            </div>

            {/* Nut dieu khien chinh */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => handleCallNext(c)}
                disabled={c.opStatus !== 'OPEN' || !withinHours}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition"
              >
                Gọi tiếp
              </button>
              {c.status === 'SERVING' && c.opStatus === 'OPEN' && (
                <button
                  onClick={() => handleComplete(c)}
                  className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Xong
                </button>
              )}
            </div>

            {/* Nut van hanh quay */}
            {c.opStatus === 'OPEN' ? (
              <div className="flex gap-1">
                <button
                  onClick={() => setCounterOpStatus(c.counterId, 'PAUSED')}
                  className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded border border-amber-200 transition"
                >
                  Tạm nghỉ
                </button>
                <button
                  onClick={() => setCounterOpStatus(c.counterId, 'CLOSED')}
                  className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded border border-slate-200 transition"
                >
                  Đóng quầy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCounterOpStatus(c.counterId, 'OPEN')}
                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition"
              >
                Mở Quầy
              </button>
            )}
          </div>
        ))}
      </div>

      {/* KPI & Danh sach cho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase">Khách đang đợi trong hàng</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{waitingList.length} người</div>
            <div className="text-xs text-emerald-600 mt-1">
              {waitingList.length > 0
                ? `Chờ TB: ~${Math.round(waitingList.reduce((acc, t) => acc + t.estimatedWaitMinutes, 0) / waitingList.length)} phút`
                : 'Không có khách đang chờ'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase">Đã phục vụ trong ngày</div>
            <div className="text-3xl font-bold text-blue-800 mt-2">{totalServedToday} lượt</div>
            <div className="text-xs text-slate-500 mt-1">Dữ liệu thực từ CSDL</div>
          </div>

          {!withinHours && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <div className="text-xs font-bold text-amber-700 uppercase mb-1">Ngoài giờ hành chính</div>
              <div className="text-xs text-amber-600 leading-relaxed">
                Auto-call đã tạm dừng. Hàng đợi và vé vẫn được giữ nguyên, sẽ tiếp tục vào 07:30 sáng ngày làm việc tiếp theo.
              </div>
            </div>
          )}
        </div>

        {/* Danh sach hang doi */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800">
              Hàng Đợi Trực Tiếp ({waitingList.length})
            </h3>
            <span className="text-xs text-emerald-600 font-semibold">Tự động đồng bộ mỗi 3 giây</span>
          </div>

          {waitingList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {loadError
                ? 'Không thể tải danh sách hàng đợi. Kiểm tra kết nối server.'
                : 'Hiện tại không có khách hàng nào đang chờ.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3">Số vé</th>
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3">Thủ tục</th>
                    <th className="pb-3">Giờ lấy số</th>
                    <th className="pb-3 text-right">Đã chờ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {waitingList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-blue-900">{item.ticketNumber}</td>
                      <td className="py-3 text-slate-700">{item.customerName || '—'}</td>
                      <td className="py-3 text-slate-600">{SERVICE_LABEL[item.serviceType] || item.serviceType}</td>
                      <td className="py-3 text-slate-500">
                        {new Date(item.issuedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 text-right font-medium text-amber-600">
                        {calcWaitMins(item.issuedAt)} phút
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
