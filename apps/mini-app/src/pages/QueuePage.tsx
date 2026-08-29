import React, { useState } from 'react';
import { apiClient } from '../services/api.js';
import { MiniAppAuthService } from '../services/auth.js';

export const QueuePage: React.FC = () => {
  const user = MiniAppAuthService.getStoredUser();
  const [serviceType, setServiceType] = useState('NEW_CONNECTION');
  const [customerCode, setCustomerCode] = useState('CM102938');
  const [ticket, setTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const services = [
    {
      id: 'NEW_CONNECTION',
      name: 'Đăng ký lắp mới đồng hồ nước',
      desc: 'Hồ sơ lắp đặt mới cho hộ gia đình và doanh nghiệp',
      prefix: 'A',
    },
    {
      id: 'NAME_TRANSFER',
      name: 'Sang tên / Chuyển đổi hợp đồng',
      desc: 'Thay đổi chủ hộ, cập nhật thông tin định mức sinh hoạt',
      prefix: 'B',
    },
    {
      id: 'INSPECTION',
      name: 'Kiểm tra & Kiểm định đồng hồ',
      desc: 'Yêu cầu kiểm tra sự cố kẹt số, đồng hồ chạy nhanh/chậm',
      prefix: 'C',
    },
    {
      id: 'BILL_PAYMENT',
      name: 'Nộp tiền nước & Quyết toán công nợ',
      desc: 'Thanh toán tiền nước trực tiếp tại quầy thu ngân',
      prefix: 'D',
    },
  ];

  const handleBookTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Lay chi nhanh chinh 204 Quang Trung
      const branches = await apiClient.get<any[]>('/api/v1/branches');
      const branchId = branches?.[0]?.id;

      if (!branchId) {
        throw new Error('Không tìm thấy thông tin chi nhánh giao dịch');
      }

      // 2. Goi API tao ve
      const result = await apiClient.post<any>('/api/v1/queue/tickets', {
        branchId,
        serviceType,
        customerCode: customerCode.trim() ? customerCode.trim() : undefined,
      });

      setTicket(result);
    } catch (err: any) {
      setError(err?.message || 'Không thể bốc số thứ tự. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* Thong tin dia diem */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)' }}>
              Trụ sở Công ty Cấp Nước Cà Mau
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau
            </div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'var(--cawaco-primary-subtle, #EBF5FB)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            color: 'var(--cawaco-deep-navy, #003B6F)',
          }}
        >
          Giờ mở cửa: <strong>07:30 - 17:00</strong> (Thứ 2 đến Thứ 6)
        </div>
      </div>

      {ticket ? (
        /* Hien thi ve so thu tu da boc */
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            border: '2px solid var(--cawaco-primary, #127AB5)',
          }}
        >
          <span className="badge badge-paid" style={{ fontSize: '11px', padding: '4px 12px' }}>
            ĐÃ LẤY SỐ THÀNH CÔNG
          </span>

          <div
            style={{
              fontSize: '48px',
              fontWeight: '800',
              color: 'var(--cawaco-deep-navy, #003B6F)',
              fontFamily: 'var(--font-heading)',
              margin: '16px 0 8px',
              letterSpacing: '2px',
            }}
          >
            {ticket.ticketNumber}
          </div>

          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '16px' }}>
            {ticket.serviceName || 'Thủ tục hành chính Cấp Nước'}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Vị trí trong hàng đợi:</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary)' }}>
                {ticket.aheadCount ?? 1} người phía trước
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Thời gian chờ ước tính:</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--cawaco-teal, #0E8E89)' }}>
                ~{ticket.estimatedWaitMinutes ?? 10} phút
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
            Quý khách vui lòng có mặt tại quầy giao dịch trước khi số thứ tự được gọi. Loa thông báo và màn hình tại trụ sở sẽ hiển thị khi đến lượt.
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setTicket(null)}
            style={{ width: '100%' }}
          >
            Lấy số cho thủ tục khác
          </button>
        </div>
      ) : (
        /* Form chon dich vu va boc so */
        <>
          <div className="section-title">Chọn thủ tục cần giao dịch</div>

          {error && (
            <div
              style={{
                backgroundColor: '#FDECEC',
                border: '1px solid #D9383A',
                color: '#991B1B',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                marginBottom: '14px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {services.map((s) => (
              <div
                key={s.id}
                onClick={() => setServiceType(s.id)}
                className="card"
                style={{
                  border: serviceType === s.id ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                  backgroundColor: serviceType === s.id ? 'var(--cawaco-primary-subtle)' : '#FFF',
                  cursor: 'pointer',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: serviceType === s.id ? 'var(--color-primary)' : '#F1F5F9',
                    color: serviceType === s.id ? '#FFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '16px',
                  }}
                >
                  {s.prefix}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
              Mã danh bộ khách hàng (Nếu có)
            </label>
            <input
              type="text"
              className="input-field"
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              placeholder="VD: CM102938"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm, 8px)',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                textTransform: 'uppercase',
              }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleBookTicket}
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Đang cấp số thứ tự...' : 'Lấy số thứ tự điện tử'}
          </button>
        </>
      )}
    </div>
  );
};
