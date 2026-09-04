/**
 * HomePage.tsx — Trang chủ CAWACO Mini App
 *
 * Layout theo mockup thiết kế:
 * 1. Hero section: gradient teal + logo + tên công ty lớn
 * 2. Greeting card: Float overlap hero bottom
 * 3. DỊCH VỤ: 3 icon circles (Hóa đơn / Bốc số / Báo sự cố)
 * 4. TIỆN ÍCH: 3-col grid (Bản đồ mạng / Đại lý thu hộ / Doanh nghiệp)
 * 5. THÔNG TIN: 3x2 grid (6 tiện ích phụ)
 * 6. Kênh chính thức: Dark teal card (Zalo OA)
 * 7. Tình trạng cấp nước hôm nay
 * 8. Hóa đơn tháng hiện tại (từ API)
 * 9. Tin tức mới nhất (từ API)
 */

import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiClient } from '../services/api.js';
import { UserProfile } from '../services/auth.js';
import { Skeleton } from '../components/states/Skeleton.js';
import { NewsDetailModal, NewsItem } from '../components/NewsDetailModal.js';
import { TabType } from '../App.js';
import { ZALO_CONFIG } from '../constants/zalo.js';

interface HomePageProps {
  onNavigate: (tab: TabType) => void;
  onOpenVietQr: (invoice: any) => void;
  user: UserProfile | null;
}

/* ===== CONSTANTS ===== */

/** Màu chủ đạo Ocean Blue của CAWACO brand */
const CAWACO_TEAL = 'var(--cawaco-primary, #0369A1)';

/** Icon wrapper SVG chuẩn 24x24 */
const Svg: React.FC<{ children: React.ReactNode; size?: number; stroke?: string }> = ({
  children, size = 22, stroke = 'currentColor',
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/* ===== DỮ LIỆU BANNER TRUYỀN THÔNG CAWACO ===== */
const MEDIA_BANNERS = [
  { id: 'm1', src: '/images/media-1.png', alt: 'Nước sạch đến mọi nhà - CAWACO' },
  { id: 'm2', src: '/images/media-2.png', alt: 'Hành trình nước sạch Cà Mau' },
  { id: 'm3', src: '/images/banner.png', alt: 'Chuyển đổi số ngành nước' },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenVietQr, user }) => {
  const [customerCode] = useState('CM102938');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Auto scroll media slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMediaIndex((prev) => {
        const next = (prev + 1) % MEDIA_BANNERS.length;
        const el = document.getElementById('media-slider');
        if (el) {
          el.scrollTo({
            left: next * el.clientWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMediaScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeMediaIndex && index >= 0 && index < MEDIA_BANNERS.length) {
      setActiveMediaIndex(index);
    }
  };

  // API hóa đơn thật từ PostgreSQL
  const { data: invoices, status: invStatus } = useApi(
    () => apiClient.get<any[]>(`/api/v1/invoices?customerCode=${customerCode}`),
    [customerCode]
  );

  // API tin tức động từ website Cấp nước Cà Mau & CSDL
  const { data: dynamicNews, status: newsStatus } = useApi(
    () => apiClient.get<NewsItem[]>('/api/v1/news'),
    []
  );

  const newsList = dynamicNews || [];
  const featuredItem = newsList.find((n: any) => n.featured || n.isOutageAlert) || newsList[0];
  const otherNews = newsList.filter((n: any) => n.id !== featuredItem?.id);

  const activeInvoice = invoices?.[0] ?? null;

  const formatVnd = (amount: number) =>
    new Intl.NumberFormat('vi-VN').format(amount);

  return (
    <>
      {/* ================================================================
       * 1. HERO SECTION — gradient Ocean Blue + đốm sáng trang trí theo mockup
       * ================================================================ */}
      <div className="home-hero">
        {/* Đốm sáng vòng tròn mờ góc trên phải */}
        <div className="hero-glow-circle-tr" />
        
        {/* Các dải sóng mờ trang trí chạy ngầm dưới nền */}
        <div className="hero-ambient-waves">
          <svg viewBox="0 0 400 130" preserveAspectRatio="none" className="hero-ambient-svg">
            <path d="M 0,40 C 130,85 260,15 400,55 L 400,130 L 0,130 Z" fill="rgba(255, 255, 255, 0.07)" />
            <path d="M 0,65 C 140,25 270,95 400,60 L 400,130 L 0,130 Z" fill="rgba(56, 189, 248, 0.08)" />
          </svg>
        </div>

        {/* Logo nhỏ góc trên trái trong vòng tròn mờ */}
        <div className="home-hero-logo-row">
          <div className="home-hero-logo-wrap">
            <img src="/brand/logo.jpg" alt="Logo CAWACO" className="home-hero-logo" />
          </div>
        </div>

        {/* Tên công ty — 2 dòng, chữ trắng to */}
        <h1 className="home-hero-company">
          CÔNG TY CỔ PHẦN<br />CẤP NƯỚC CÀ MAU
        </h1>
        <p className="home-hero-sub">TP. CÀ MAU · TỈNH CÀ MAU</p>
      </div>

      {/* ================================================================
       * SCROLLABLE CONTENT — bắt đầu overlap từ hero
       * ================================================================ */}
      <div className="home-content">

        {/* ---- Greeting Card (overlap hero) ---- */}
        <div className="greeting-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E2E8F0' }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cawaco-primary, #0369A1)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                {user?.avatarText || 'KH'}
              </div>
            )}
            <div>
              <div className="greeting-hello">Xin chào</div>
              <div className="greeting-username">{user?.fullName || 'Khách hàng Zalo'}</div>
            </div>
          </div>
          <button
            className="btn-account-teal"
            onClick={() => onNavigate('ACCOUNT')}
          >
            Tài khoản
          </button>
        </div>

        {/* ================================================================
         * 2. DỊCH VỤ — 3 circle icons chính
         * ================================================================ */}
        <p className="home-section-label">Dịch vụ</p>
        <div className="service-row">
          {/* Hóa đơn */}
          <button className="svc-item" onClick={() => onNavigate('INVOICES')}>
            <div className="svc-circle svc-orange">
              <Svg size={26}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </Svg>
            </div>
            <span className="svc-label">Hóa đơn</span>
          </button>

          {/* Bốc số */}
          <button className="svc-item" onClick={() => onNavigate('QUEUE')}>
            <div className="svc-circle svc-blue">
              <Svg size={26}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="14" x2="8.01" y2="14" />
              </Svg>
            </div>
            <span className="svc-label">Bốc số</span>
          </button>

          {/* Báo sự cố */}
          <button className="svc-item" onClick={() => onNavigate('COMPLAINTS')}>
            <div className="svc-circle svc-slate">
              <Svg size={26}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </Svg>
            </div>
            <span className="svc-label">Báo sự cố</span>
          </button>
        </div>

        {/* ================================================================
         * THẺ BÁO CHỈ SỐ NƯỚC NHANH (KỲ 09/2026)
         * ================================================================ */}
        <div
          onClick={() => onNavigate('METER_READING')}
          style={{
            marginBottom: '18px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(3, 105, 161, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9, fontWeight: 700 }}>
                Kỳ nước 09/2026
              </span>
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                Đến hạn ghi
              </span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '2px' }}>
              Tự báo chỉ số đồng hồ nước
            </div>
            <div style={{ fontSize: '11.5px', opacity: 0.88, marginTop: '2px' }}>
              Mã danh bộ: CM102938 • Kỳ trước: 145 m³
            </div>
          </div>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              color: '#0369A1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            Báo ngay
          </div>
        </div>

        {/* ================================================================
         * 3. TIỆN ÍCH — 3-col grid
         * ================================================================ */}
        <p className="home-section-label">Tiện ích</p>
        <div className="home-grid-3" style={{ marginBottom: '20px' }}>
          <button className="home-grid-item" onClick={() => onNavigate('MAP')}>
            <div className="grid-icon-wrap gi-teal">
              <Svg size={20}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </Svg>
            </div>
            <span className="grid-item-label">Bản đồ mạng cấp nước</span>
          </button>

          <button className="home-grid-item" onClick={() => onNavigate('AGENTS')}>
            <div className="grid-icon-wrap gi-amber">
              <Svg size={20}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </Svg>
            </div>
            <span className="grid-item-label">Đại lý thu hộ</span>
          </button>

          <button className="home-grid-item" onClick={() => onNavigate('ENTERPRISE')}>
            <div className="grid-icon-wrap gi-slate">
              <Svg size={20}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </Svg>
            </div>
            <span className="grid-item-label">Doanh nghiệp</span>
          </button>
        </div>

        {/* ================================================================
         * 4. THÔNG TIN — 3x2 grid (6 tiện ích phụ)
         * ================================================================ */}
        <p className="home-section-label">Thông tin</p>
        <div className="home-grid-3" style={{ marginBottom: '24px' }}>
          <button className="home-grid-item" onClick={() => onNavigate('QUICK_LOOKUP')}>
            <div className="grid-icon-wrap gi-blue">
              <Svg size={20}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </Svg>
            </div>
            <span className="grid-item-label">Tra cứu hóa đơn</span>
          </button>

          <button className="home-grid-item" onClick={() => onNavigate('HANDBOOK')}>
            <div className="grid-icon-wrap gi-amber">
              <Svg size={20}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </Svg>
            </div>
            <span className="grid-item-label">Sổ tay dùng nước</span>
          </button>

          <button className="home-grid-item" onClick={() => onNavigate('ASSISTANT')}>
            <div className="grid-icon-wrap gi-purple">
              <Svg size={20}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </Svg>
            </div>
            <span className="grid-item-label">Trợ lý ảo</span>
          </button>

          <button className="home-grid-item" onClick={() => onNavigate('METER_READING')}>
            <div className="grid-icon-wrap gi-peach">
              <Svg size={20}>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </Svg>
            </div>
            <span className="grid-item-label">Báo chỉ số nước</span>
          </button>

          <button className="home-grid-item" onClick={() => onNavigate('FEEDBACK')}>
            <div className="grid-icon-wrap gi-teal">
              <Svg size={20}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="11" y2="14" />
              </Svg>
            </div>
            <span className="grid-item-label">Góp ý kiến</span>
          </button>

          <button className="home-grid-item" onClick={() => onNavigate('REGISTRATION')}>
            <div className="grid-icon-wrap gi-green">
              <Svg size={20}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </Svg>
            </div>
            <span className="grid-item-label">Đăng ký lắp mới</span>
          </button>
        </div>

        {/* ================================================================
         * 5. KÊNH CHÍNH THỨC — dark teal card với Zalo OA
         * ================================================================ */}
        <div className="zalo-card">
          <div className="zalo-card-title">Kênh chính thức</div>
          <div className="zalo-card-desc">
            Nhận thông báo lịch cúp nước và cập nhật mới nhất từ CAWACO
          </div>
          <div className="zalo-card-row">
            {/* Zalo logo circle */}
            <div className="zalo-icon-circle">
              <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '-0.5px' }}>ZALO</span>
            </div>
            <div style={{ flex: 1 }}>
              <div className="zalo-oa-name-text">CAWACO Cấp nước Cà Mau</div>
              <div className="zalo-oa-type">Kênh chính thức</div>
            </div>
            <a
              href={ZALO_CONFIG.OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-quan-tam"
              onClick={async (e) => {
                try {
                  const zmp = await import('zmp-sdk/apis');
                  if (zmp && zmp.followOA) {
                    e.preventDefault();
                    await zmp.followOA({ id: ZALO_CONFIG.OA_ID });
                  }
                } catch {
                  // Fallback to normal anchor click
                }
              }}
            >
              Quan tâm
            </a>
          </div>
        </div>

        {/* ================================================================
         * 6. TÌNH TRẠNG CẤP NƯỚC HÔM NAY
         * ================================================================ */}
        <div className="water-status-card">
          <div className="wsc-left">
            <div className="wsc-label">Tình trạng cấp nước hôm nay</div>
            <div className="wsc-status">
              <span className="wsc-dot" />
              <span className="wsc-text">Hoạt động ổn định</span>
            </div>
            <div className="wsc-sub">TP. Cà Mau · áp lực bình thường</div>
          </div>
          <div className="wsc-right">
            <div className="wsc-number">224k</div>
            <div className="wsc-unit">Hộ đang dùng</div>
          </div>
        </div>

        {/* ================================================================
         * 7. HÓA ĐƠN THÁNG HIỆN TẠI
         * ================================================================ */}
        <p className="home-section-label">Hóa đơn tháng hiện tại</p>

        {invStatus === 'loading' && (
          <div className="inv-card-new">
            <Skeleton height={120} />
          </div>
        )}

        {invStatus === 'success' && activeInvoice ? (
          <div className="inv-card-new">
            {/* Top row: mã danh bộ + trạng thái */}
            <div className="inv-top">
              <div>
                <div className="inv-customer-code">Mã danh bộ {activeInvoice.customerCode}</div>
                <div className="inv-customer-name">{user?.fullName || 'Khách hàng Zalo'}</div>
              </div>
              <span className={activeInvoice.status === 'PAID' ? 'badge-new-paid' : 'badge-new-unpaid'}>
                {activeInvoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>

            {/* Body: water gauge + amount */}
            <div className="inv-body">
              {/* Water cylinder visual */}
              <div className="water-gauge">
                <div className="water-gauge-m3">{activeInvoice.consumption ?? 25}m³</div>
              </div>

              {/* Amount info */}
              <div style={{ flex: 1 }}>
                <div className="inv-amount">
                  {formatVnd(activeInvoice.totalAmount)}
                  <span style={{ fontSize: '16px', fontWeight: '600' }}> đ</span>
                </div>
                <div className="inv-meta">
                  Kỳ {activeInvoice.period} · Hạn: {activeInvoice.dueDate ? new Date(activeInvoice.dueDate).toLocaleDateString('vi-VN') : '05/09/2026'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {activeInvoice.status !== 'PAID' && (
              <div className="inv-actions">
                <button
                  className="btn-pay-vietqr"
                  onClick={() => onOpenVietQr(activeInvoice)}
                >
                  Thanh toán<br />VietQR
                </button>
                <button
                  className="btn-bangke-new"
                  onClick={() => onNavigate('INVOICES')}
                >
                  Bảng kê giá
                </button>
              </div>
            )}
          </div>
        ) : invStatus === 'success' && !activeInvoice ? (
          <div className="inv-card-new" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '13px' }}>Không có hóa đơn trong tháng này</div>
          </div>
        ) : null}

        {/* ================================================================
         * 8. TRUYỀN THÔNG — banner slider (thêm ảnh thật sau)
         * ================================================================ */}
        <div className="media-section">
          <div className="media-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cawaco-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span className="home-section-label">Truyền thông</span>
          </div>

          <div className="media-slider-wrap">
            <div className="media-slider-track" id="media-slider" onScroll={handleMediaScroll}>
              {MEDIA_BANNERS.map((slide) => (
                <div key={slide.id} className="media-slide">
                  <img src={slide.src} alt={slide.alt} />
                </div>
              ))}
            </div>
            <div className="media-dots">
              {MEDIA_BANNERS.map((slide, i) => (
                <span
                  key={slide.id}
                  className={`media-dot${i === activeMediaIndex ? ' active' : ''}`}
                  onClick={() => {
                    setActiveMediaIndex(i);
                    const el = document.getElementById('media-slider');
                    if (el) {
                      el.scrollTo({
                        left: i * el.clientWidth,
                        behavior: 'smooth',
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================
         * 9. TIN TỨC MỚI NHẤT
         * ================================================================ */}
        <div className="news-header-row">
          <span className="home-section-label" style={{ margin: 0 }}>Tin tức mới nhất</span>
          <button className="news-see-all" onClick={() => onNavigate('NEWS')}>Xem tất cả</button>
        </div>

        {/* Featured news item */}
        {featuredItem && (
          <div
            key={featuredItem.id}
            className="news-feature-card"
            onClick={() => setSelectedNews(featuredItem)}
          >
            <span className="news-feature-badge">
              {featuredItem.isOutageAlert ? 'Lịch cúp nước' : (featuredItem.tag || 'Nổi bật')}
            </span>
            <div className="news-feature-title">{featuredItem.title}</div>
            <div className="news-feature-date">
              {featuredItem.date || (featuredItem.publishedAt ? new Date(featuredItem.publishedAt).toLocaleDateString('vi-VN') : '28/08/2026')}
            </div>
          </div>
        )}

        {/* News list — thumbnail + title + date */}
        <div className="news-list-wrap">
          {otherNews.slice(0, 4).map((item: any) => {
            const itemDate = item.date || (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : '26/08/2026');
            const itemImg = item.thumbnailUrl || item.thumb || '/images/media-1.png';

            return (
              <div
                key={item.id}
                className="news-item-row"
                onClick={() => setSelectedNews(item)}
              >
                {/* Thumbnail */}
                <div className="news-thumb">
                  <img src={itemImg} alt={item.title} />
                </div>
                {/* Text */}
                <div className="news-item-body">
                  <p className="news-item-title">{item.title}</p>
                  <span className="news-item-date">{itemDate}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>{/* end home-content */}

      {/* Modal xem chi tiết bài viết tin tức */}
      <NewsDetailModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </>
  );
};

