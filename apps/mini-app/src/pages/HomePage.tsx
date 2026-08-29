import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiClient } from '../services/api.js';
import { MiniAppAuthService, UserProfile } from '../services/auth.js';
import { Skeleton } from '../components/states/Skeleton.js';
import { ErrorAlert } from '../components/states/ErrorAlert.js';

interface HomePageProps {
  onNavigate: (tab: 'HOME' | 'INVOICES' | 'QUEUE' | 'COMPLAINTS' | 'NEWS' | 'MAP' | 'ACCOUNT') => void;
  onOpenVietQr: (invoice: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenVietQr }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MiniAppAuthService.getStoredUser());
  const [customerCode, setCustomerCode] = useState('CM102938');
  const [slideIndex, setSlideIndex] = useState(0);

  // Goi API hoa don that tu PostgreSQL
  const { data: invoices, status: invStatus, error: invError, refetch: refetchInvoices } = useApi(
    () => apiClient.get<any[]>(`/api/v1/invoices?customerCode=${customerCode}`),
    [customerCode]
  );

  const activeInvoice = invoices && invoices.length > 0 ? invoices[0] : null;

  // Banner Slides — slide 1 dùng banner.png CAWACO thật
  const slides = [
    {
      id: 's1',
      useBannerImage: true,  // Slide 1 dùng ảnh thật
      tag: 'Thanh toán trực tuyến',
      title: 'Thanh toán nước qua VietQR',
      cta: 'Thanh toán ngay',
      action: () => onNavigate('INVOICES'),
    },
    {
      id: 's2',
      theme: 'slide-cyan',
      useBannerImage: false,
      tag: 'Tiện ích quầy 204 Quang Trung',
      title: 'Bốc số trực tuyến thông minh',
      desc: 'Lấy số thứ tự điện tử trước khi đến trụ sở, theo dõi vị trí hàng đợi trực tiếp.',
      cta: 'Lấy số thứ tự',
      action: () => onNavigate('QUEUE'),
    },
    {
      id: 's3',
      theme: 'slide-amber',
      useBannerImage: false,
      tag: 'Tiếp nhận 24/7',
      title: 'Phản ánh & Báo sự cố nước 24/7',
      desc: 'Gửi phản ánh chất lượng nước, rò rỉ đường ống kèm vị trí GPS và ảnh hiện trường.',
      cta: 'Phản ánh ngay',
      action: () => onNavigate('COMPLAINTS'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* 1. Ticker Canh bao cup nuoc */}
      <div className="ticker-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
          <strong>Lịch cúp nước:</strong> Tạm ngưng cấp nước đêm 28/08 phục vụ đấu nối tuyến ống D300 Quang Trung.
        </div>
      </div>

      {/* 2. Banner Slider */}
      <div className="slider-container">
        {/* Slider track — hỗ trợ cả nh 1 (slide banner ảnh thật) và slide màu */}
        <div className="slider-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
          {slides.map((s) => (
            s.useBannerImage ? (
              /* Slide 1 dùng banner.png CAWACO thật */
              <div key={s.id} className="slide-item slide-banner-image" onClick={s.action}>
                <img src="/images/banner.png" alt="CAWACO — Vì nguồn nước sạch cho cộng đồng" />
                <div className="slide-image-overlay" />
                <div className="slide-image-content">
                  <span className="slide-tag">{s.tag}</span>
                  <div className="slide-cta" style={{ marginTop: 0 }}>
                    {s.cta}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              /* Slide 2, 3 dùng gradient màu */
              <div key={s.id} className={`slide-item ${s.theme}`} onClick={s.action}>
                <span className="slide-tag">{s.tag}</span>
                <div className="slide-title">{s.title}</div>
                <div className="slide-desc">{s.desc}</div>
                <div className="slide-cta">
                  {s.cta}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            )
          ))}
        </div>
        <div className="slider-dots">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`slider-dot ${idx === slideIndex ? 'active' : ''}`}
              onClick={() => setSlideIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* 3. Hero Invoice Card (Ket noi truc tiep du lieu that PostgreSQL) */}
      <div className="card bill-hero-card">
        <div className="bill-header">
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)' }}>
              HÓA ĐƠN TIỀN NƯỚC THÁNG HIỆN TẠI
            </span>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Mã danh bộ: <strong>{customerCode}</strong> (Nguyễn Văn An)
            </div>
          </div>
          {invStatus === 'loading' ? (
            <Skeleton width="90px" height="22px" />
          ) : (
            <span className={`badge ${activeInvoice?.status === 'UNPAID' ? 'badge-unpaid' : 'badge-paid'}`}>
              {activeInvoice?.status === 'UNPAID' ? 'Chưa thanh toán' : 'Đã thanh toán'}
            </span>
          )}
        </div>

        {invStatus === 'loading' ? (
          <div style={{ margin: '14px 0' }}>
            <Skeleton width="180px" height="36px" />
            <Skeleton width="240px" height="16px" />
          </div>
        ) : invError ? (
          <ErrorAlert message={invError} onRetry={refetchInvoices} />
        ) : activeInvoice ? (
          <>
            <div className="bill-amount">{formatVnd(activeInvoice.totalAmount)}</div>
            <div className="bill-meta">
              Kỳ {activeInvoice.period} | Tiêu thụ: {activeInvoice.consumptionM3} m³ | Hạn:{' '}
              {new Date(activeInvoice.dueDate).toLocaleDateString('vi-VN')}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {activeInvoice.status === 'UNPAID' ? (
                <button className="btn btn-primary" onClick={() => onOpenVietQr(activeInvoice)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M7 7h.01" />
                    <path d="M17 7h.01" />
                    <path d="M7 17h.01" />
                    <path d="M17 17h.01" />
                  </svg>
                  Thanh toán VietQR
                </button>
              ) : (
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onNavigate('INVOICES')}>
                  Xem lịch sử hóa đơn
                </button>
              )}
              <button
                className="btn btn-secondary"
                style={{ width: 'auto', whiteSpace: 'nowrap' }}
                onClick={() => onNavigate('INVOICES')}
              >
                Bảng kê giá
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Không có hóa đơn nợ cho mã danh bộ {customerCode}
          </div>
        )}
      </div>

      {/* 4. 6 Tiện ích Dịch vụ Nước (Bento Grid) */}
      <div className="section-title">Tiện ích Dịch vụ Nước</div>
      <div className="bento-grid">
        <div className="bento-item" onClick={() => onNavigate('INVOICES')}>
          <div className="bento-icon icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="bento-label">
            Tra cứu
            <br />
            Tiền nước
          </div>
        </div>

        <div className="bento-item" onClick={() => onNavigate('QUEUE')}>
          <div className="bento-icon icon-cyan">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="bento-label">
            Bốc số
            <br />
            Trực tuyến
          </div>
        </div>

        <div className="bento-item" onClick={() => onNavigate('COMPLAINTS')}>
          <div className="bento-icon icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="bento-label">
            Phản ánh
            <br />& Báo sự cố
          </div>
        </div>

        <div className="bento-item" onClick={() => onNavigate('NEWS')}>
          <div className="bento-icon icon-indigo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
          <div className="bento-label">
            Tin tức &<br />
            Lịch cúp nước
          </div>
        </div>

        <div className="bento-item" onClick={() => onNavigate('MAP')}>
          <div className="bento-icon icon-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
          </div>
          <div className="bento-label">
            Điểm giao dịch
            <br />
            CAWACO
          </div>
        </div>

        <div className="bento-item" onClick={() => onNavigate('ACCOUNT')}>
          <div className="bento-icon icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="bento-label">
            Danh bạ
            <br />
            Đồng hồ nước
          </div>
        </div>
      </div>

      {/* 5. Live Counter Quầy Giao Dịch 204 Quang Trung — dùng tokens màu nhất quán */}
      <div className="live-counter-card">
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-success)', textTransform: 'uppercase' }}>
            Quầy Giao Dịch Trực Tiếp
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--cawaco-deep-navy)', marginTop: '2px' }}>
            Trụ sở 204 Quang Trung
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-success)', marginTop: '2px' }}>
            Đang phục vụ: <strong>4 quầy</strong> | Đang chờ: <strong>3 người</strong> (~12 phút)
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate('QUEUE')}
          style={{ width: 'auto', padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
        >
          Bốc số ngay
        </button>
      </div>

      {/* 6. Trung tâm Chăm sóc khách hàng 24/7 */}
      <div className="support-card">
        <div className="support-header">
          <div className="support-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <div className="support-title">Trung tâm Hỗ trợ & CSKH 24/7</div>
            <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '600' }}>
              Sẵn sàng phục vụ người dân Cà Mau
            </div>
          </div>
        </div>
        <div className="support-desc">
          Tiếp nhận giải đáp thắc mắc về hóa đơn, đăng ký cấp nước và xử lý sự cố mạng lưới đường ống.
        </div>
        <div className="support-actions">
          <a
            href="tel:02903836360"
            className="btn btn-primary"
            style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 8px' }}
          >
            0290 3836 360
          </a>
          <button
            className="btn btn-oa"
            onClick={() => alert('Đang chuyển hướng mở Zalo Official Account Cấp Nước Cà Mau...')}
            style={{ fontSize: '13px', padding: '10px 8px' }}
          >
            Chat Zalo OA
          </button>
        </div>
      </div>
    </div>
  );
};
