import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/api.js';
import { MiniAppAuthService } from '../services/auth.js';

type TicketStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';

interface QueueTicket {
  id: string;
  ticketNumber: string;
  serviceType: string;
  status: TicketStatus;
  positionInQueue: number;
  estimatedWaitMinutes: number;
  branchName?: string;
  counterId?: string;
  counterName?: string;
  calledAt?: string;
}

const SERVICE_LABEL: Record<string, string> = {
  NEW_METER_REGISTRATION: 'Đăng ký lắp mới đồng hồ nước',
  CONTRACT_TRANSFER: 'Sang tên / Chuyển đổi hợp đồng',
  COMPLAINT_INSPECTION: 'Kiểm tra & Kiểm định đồng hồ',
  BILLING_PAYMENT: 'Nộp tiền nước & Quyết toán công nợ',
};

export const QueuePage: React.FC = () => {
  const user = MiniAppAuthService.getStoredUser();
  const [serviceType, setServiceType] = useState('NEW_METER_REGISTRATION');
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [customerCode, setCustomerCode] = useState('');
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tải mã danh bộ và thông tin thực tế từ tài khoản
  useEffect(() => {
    apiClient.get<any[]>('/api/v1/customers/meters').then((meters) => {
      if (Array.isArray(meters) && meters.length > 0) {
        const def = meters.find((m: any) => m.isDefault) || meters[0];
        if (def) {
          setCustomerCode(def.customerCode);
          if (!customerName && def.ownerName) {
            setCustomerName(def.ownerName);
          }
        }
      }
    }).catch(() => {});
  }, []);

  // Trang thai polling theo doi so
  const [liveTicket, setLiveTicket] = useState<QueueTicket | null>(null);
  const [calledAlert, setCalledAlert] = useState(false); // Hien thi alert khi so duoc goi
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStatusRef = useRef<TicketStatus | null>(null);

  const services = [
    { id: 'NEW_METER_REGISTRATION', name: 'Đăng ký lắp mới đồng hồ nước', desc: 'Hồ sơ lắp đặt mới cho hộ gia đình và doanh nghiệp', prefix: 'A' },
    { id: 'CONTRACT_TRANSFER', name: 'Sang tên / Chuyển đổi hợp đồng', desc: 'Thay đổi chủ hộ, cập nhật thông tin định mức sinh hoạt', prefix: 'B' },
    { id: 'COMPLAINT_INSPECTION', name: 'Kiểm tra & Kiểm định đồng hồ', desc: 'Yêu cầu kiểm tra sự cố kẹt số, đồng hồ chạy nhanh/chậm', prefix: 'C' },
    { id: 'BILLING_PAYMENT', name: 'Nộp tiền nước & Quyết toán công nợ', desc: 'Thanh toán tiền nước trực tiếp tại quầy thu ngân', prefix: 'D' },
  ];

  // Them cac truong context tu API
  const [counterStatus, setCounterStatus] = useState<'OPEN' | 'PAUSED' | 'CLOSED'>('OPEN');
  const [counterPauseNote, setCounterPauseNote] = useState<string | undefined>(undefined);
  const [withinWorkingHours, setWithinWorkingHours] = useState(true);
  const [workingHoursNote, setWorkingHoursNote] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Bat dau poll trang thai ve sau khi boc so thanh cong
  const startPolling = (ticketId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    prevStatusRef.current = 'WAITING';

    pollRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/queue/tickets/${ticketId}`);
        const updated = (res as any)?.data || res;
        setLiveTicket(updated);

        // Cap nhat cac truong context tu API
        setCounterStatus(updated.counterStatus || 'OPEN');
        setCounterPauseNote(updated.counterPauseNote);
        setWithinWorkingHours(updated.withinWorkingHours ?? true);
        setWorkingHoursNote(updated.workingHoursNote || '');
        setCooldownRemaining(Math.ceil((updated.cooldownRemaining || 0) / 1000));

        // Chi phat hien chuyen WAITING -> SERVING khi quay OPEN + trong gio
        if (
          prevStatusRef.current === 'WAITING' &&
          updated.status === 'SERVING' &&
          updated.counterStatus === 'OPEN'
        ) {
          setCalledAlert(true);
          if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
        }

        prevStatusRef.current = updated.status;

        // Dung poll neu da xong hoac huy
        if (updated.status === 'COMPLETED' || updated.status === 'CANCELLED') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        // Im lang, thu lai lan poll tiep theo
      }
    }, 5000); // Poll moi 5 giay
  };

  const ACTIVE_TICKET_KEY = 'cawaco_active_queue_ticket_id';

  // Khoi phuc ve da boc tu localStorage khi nguoi dung quay lai tab
  useEffect(() => {
    const savedTicketId = localStorage.getItem(ACTIVE_TICKET_KEY);
    if (savedTicketId) {
      apiClient
        .get<{ success: boolean; data: any }>(`/api/v1/queue/tickets/${savedTicketId}`)
        .then((res) => {
          const t = (res as any)?.data || res;
          if (t && t.id) {
            setTicket(t);
            setLiveTicket(t);
            setCounterStatus(t.counterStatus || 'OPEN');
            setCounterPauseNote(t.counterPauseNote);
            setWithinWorkingHours(t.withinWorkingHours ?? true);
            setWorkingHoursNote(t.workingHoursNote || '');
            setCooldownRemaining(Math.ceil((t.cooldownRemaining || 0) / 1000));
            if (t.status === 'WAITING' || t.status === 'SERVING') {
              startPolling(t.id);
            }
          }
        })
        .catch(() => {
          localStorage.removeItem(ACTIVE_TICKET_KEY);
        });
    }
  }, []);

  // Don dep interval khi unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleBookTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      let branchId = 'br-cawaco-hq';
      try {
        const branches = await apiClient.get<any[]>('/api/v1/branches');
        if (branches && branches.length > 0) branchId = (branches as any[])[0].id;
      } catch {}

      const result = await apiClient.post<any>('/api/v1/queue/tickets', {
        branchId,
        serviceType,
        customerName: customerName.trim() || user?.fullName || 'Khách hàng Cà Mau',
        phone: phone.trim() || user?.phone || '0918234567',
        customerCode: customerCode.trim() ? customerCode.trim() : undefined,
      });

      if (result) {
        const ticketData: QueueTicket = (result as any)?.data || result;
        setTicket(ticketData);
        setLiveTicket(ticketData);
        setCalledAlert(false);
        // Luu lai de giu trang thai khi chuyen tab
        localStorage.setItem(ACTIVE_TICKET_KEY, ticketData.id);
        startPolling(ticketData.id);
      } else {
        throw new Error('Không thể lấy số thứ tự.');
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể bốc số thứ tự. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    localStorage.removeItem(ACTIVE_TICKET_KEY);
    setTicket(null);
    setLiveTicket(null);
    setCalledAlert(false);
    prevStatusRef.current = null;
  };

  const currentTicket = liveTicket || ticket;

  // Xac dinh trang thai hien tai de render
  const isWaiting = currentTicket?.status === 'WAITING';
  const isServing = currentTicket?.status === 'SERVING';
  const isCompleted = currentTicket?.status === 'COMPLETED';
  const isCancelled = currentTicket?.status === 'CANCELLED';

  return (
    <div className="subpage-container" style={{ paddingBottom: '30px' }}>
      {/* Thong tin dia diem */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--cawaco-primary-subtle, #EBF5FB)', color: 'var(--cawaco-primary, #0369A1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-main)' }}>Trụ sở Công ty Cổ phần Cấp Nước Cà Mau</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau</div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'var(--cawaco-primary-subtle, #EBF5FB)',
            borderRadius: '10px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid rgba(3, 105, 161, 0.12)',
            marginTop: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cawaco-deep-navy, #003B6F)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Giờ phục vụ: <strong>07:30 – 17:00</strong></span>
            </div>
            <span style={{ fontSize: '11px', color: '#0369A1', fontWeight: '700', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(3, 105, 161, 0.15)' }}>
              Thứ 2 – Thứ 6
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', paddingTop: '6px', borderTop: '1px dashed rgba(3, 105, 161, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cawaco-deep-navy, #003B6F)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Tổng đài CSKH:</span>
            </div>
            <a
              href="tel:02903836360"
              style={{
                fontSize: '12px',
                color: '#0369A1',
                fontWeight: '800',
                fontFamily: 'monospace',
                textDecoration: 'none',
                backgroundColor: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(3, 105, 161, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              0290 3836360
            </a>
          </div>
        </div>
      </div>

      {currentTicket ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* === ALERT: Số đang được gọi === */}
          {isServing && (
            <div
              style={{
                background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                borderRadius: '16px',
                padding: '20px 16px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(4, 120, 87, 0.4)',
                animation: calledAlert ? 'pulse-alert 1s ease-in-out 3' : 'none',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#A7F3D0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ĐẾN LƯỢT CỦA BẠN
              </div>
              <div style={{ fontSize: '56px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '4px', lineHeight: 1.1 }}>
                {currentTicket.ticketNumber}
              </div>
              <div style={{ fontSize: '13px', color: '#6EE7B7', marginTop: '8px', fontWeight: '600' }}>
                Vui lòng đến <strong style={{ color: '#FFFFFF' }}>{currentTicket.counterName || 'quầy giao dịch'}</strong> ngay bây giờ
              </div>
              <div style={{ fontSize: '11px', color: '#A7F3D0', marginTop: '4px' }}>
                Được gọi lúc {currentTicket.calledAt ? new Date(currentTicket.calledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
          )}

          {/* === Vé số khi COMPLETED === */}
          {isCompleted && (
            <div style={{ background: '#F1F5F9', borderRadius: '14px', padding: '20px 16px', textAlign: 'center', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '700', marginBottom: '8px' }}>GIAO DỊCH HOÀN TẤT</div>
              <div style={{ fontSize: '40px', fontWeight: '900', color: '#94A3B8', fontFamily: 'monospace' }}>{currentTicket.ticketNumber}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>Cảm ơn quý khách đã sử dụng dịch vụ CAWACO</div>
            </div>
          )}

          {/* === Vé số khi WAITING — hiển thị vị trí === */}
          {(isWaiting || isCancelled) && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                border: isWaiting ? '2px solid var(--cawaco-primary, #0369A1)' : '2px solid #E2E8F0',
                borderRadius: '14px',
                boxShadow: isWaiting ? '0 4px 16px rgba(3, 105, 161, 0.15)' : 'none',
              }}
            >
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', backgroundColor: isCancelled ? '#FEF2F2' : '#DCFCE7', color: isCancelled ? '#DC2626' : '#166534', fontSize: '11.5px', fontWeight: '700' }}>
                {isCancelled ? 'VÉ ĐÃ HỦY' : 'LẤY SỐ THÀNH CÔNG'}
              </span>

              <div style={{ fontSize: '52px', fontWeight: '900', color: 'var(--cawaco-deep-navy, #003B6F)', fontFamily: 'monospace', margin: '14px 0 6px', letterSpacing: '3px' }}>
                {currentTicket.ticketNumber}
              </div>

              <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '16px' }}>
                {SERVICE_LABEL[currentTicket.serviceType] || currentTicket.serviceType}
              </div>

              {isWaiting && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px', marginBottom: '16px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Người đang đợi trước:</div>
                      <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--cawaco-primary, #0369A1)', marginTop: '2px' }}>
                        {(currentTicket.positionInQueue ?? 1) - 1} người
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Thời gian chờ ước tính:</div>
                      <div style={{ fontSize: '17px', fontWeight: '800', color: '#0D9488', marginTop: '2px' }}>
                        ~{currentTicket.estimatedWaitMinutes ?? 10} phút
                      </div>
                    </div>
                  </div>

                  {/* Contextual Status Banners */}
                  {counterStatus === 'PAUSED' ? (
                    <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px', marginBottom: '14px', textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span>Quầy đang tạm nghỉ</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#B45309', lineHeight: '1.4' }}>
                        {counterPauseNote ? `Lý do: ${counterPauseNote}. ` : 'Nhân viên đang tạm nghỉ. '}
                        Hàng đợi và số vé <strong>{currentTicket.ticketNumber}</strong> của bạn vẫn được giữ nguyên vị trí.
                      </div>
                    </div>
                  ) : !withinWorkingHours || counterStatus === 'CLOSED' ? (
                    <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px', marginBottom: '14px', textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span>Ngoài giờ tiếp nhận trực tiếp</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#1D4ED8', lineHeight: '1.4' }}>
                        {workingHoursNote || 'Hệ thống đã tạm dừng gọi số. Số vé của quý khách vẫn được bảo lưu cho ca làm việc tiếp theo.'}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Indicator dang theo doi binh thuong */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', animation: 'blink 1.5s infinite' }} />
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          {cooldownRemaining > 0
                            ? `Quầy đang chuẩn bị đón khách (${cooldownRemaining}s)...`
                            : 'Đang theo dõi hàng đợi — sẽ thông báo khi đến lượt bạn'}
                        </span>
                      </div>

                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', lineHeight: '1.45', marginBottom: '18px' }}>
                        Quý khách có thể ra ngoài, ứng dụng sẽ tự động thông báo khi số <strong>{currentTicket.ticketNumber}</strong> được gọi.
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          <button className="btn-cawaco-submit" onClick={handleReset} style={{ width: '100%', backgroundColor: (isCompleted || isCancelled) ? '#0369A1' : '#64748B' }}>
            {isCompleted || isCancelled ? 'Lấy số cho thủ tục khác' : 'Hủy & Lấy số khác'}
          </button>
        </div>
      ) : (
        /* Form chon dich vu va boc so */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)', padding: '0 2px' }}>
            Chọn thủ tục cần giao dịch
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {services.map((s) => (
              <div
                key={s.id}
                onClick={() => setServiceType(s.id)}
                className="card"
                style={{ border: serviceType === s.id ? '2px solid var(--cawaco-primary, #0369A1)' : '1px solid #E2E8F0', backgroundColor: serviceType === s.id ? 'var(--cawaco-primary-subtle, #EBF5FB)' : '#FFF', cursor: 'pointer', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', transition: 'all 0.15s ease' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: serviceType === s.id ? 'var(--cawaco-primary, #0369A1)' : '#F1F5F9', color: serviceType === s.id ? '#FFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', flexShrink: 0 }}>
                  {s.prefix}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: '1.35' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-row-2">
              <div className="form-group-item">
                <label className="form-label-title">Họ tên người đến quầy *</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="VD: Nguyễn Văn An" className="form-input-field" required />
              </div>
              <div className="form-group-item">
                <label className="form-label-title">Số điện thoại *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0918234567" className="form-input-field" required />
              </div>
            </div>

            <div className="form-group-item">
              <label className="form-label-title">Mã danh bộ khách hàng (Nếu có)</label>
              <input type="text" value={customerCode} onChange={(e) => setCustomerCode(e.target.value)} placeholder="VD: CM102938" className="form-input-field" style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' }} />
            </div>
          </div>

          <button className="btn-cawaco-submit" onClick={handleBookTicket} disabled={loading}>
            {loading ? 'Đang cấp số thứ tự...' : 'Lấy Số Thứ Tự Điện Tử'}
          </button>
        </div>
      )}

      {/* CSS animation noi tuyen */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pulse-alert {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(4, 120, 87, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 12px 32px rgba(4, 120, 87, 0.6); }
        }
      `}</style>
    </div>
  );
};
