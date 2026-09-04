import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage.js';
import { InvoicePage } from './pages/InvoicePage.js';
import { QueuePage } from './pages/QueuePage.js';
import { ComplaintPage } from './pages/ComplaintPage.js';
import { NewsPage } from './pages/NewsPage.js';
import { MapPage } from './pages/MapPage.js';
import { AgentsPage } from './pages/AgentsPage.js';
import { EnterprisePage } from './pages/EnterprisePage.js';
import { RegistrationPage } from './pages/RegistrationPage.js';
import { HandbookPage } from './pages/HandbookPage.js';
import { AssistantPage } from './pages/AssistantPage.js';
import { FeedbackPage } from './pages/FeedbackPage.js';
import { MeterReadingPage } from './pages/MeterReadingPage.js';
import { MiniAppAuthService, UserProfile } from './services/auth.js';
import { openChat } from 'zmp-sdk/apis';
import { ZALO_CONFIG } from './constants/zalo.js';

export type TabType =
  | 'HOME'
  | 'INVOICES'
  | 'QUEUE'
  | 'COMPLAINTS'
  | 'NEWS'
  | 'MAP'
  | 'ACCOUNT'
  | 'AGENTS'
  | 'ENTERPRISE'
  | 'REGISTRATION'
  | 'HANDBOOK'
  | 'ASSISTANT'
  | 'SURVEY'
  | 'FEEDBACK'
  | 'METER_READING'
  | 'QUICK_LOOKUP'
  | 'MESSAGES';

const SUBPAGE_INFO: Record<Exclude<TabType, 'HOME'>, { title: string; subtitle: string }> = {
  INVOICES: {
    title: 'Hóa đơn tiền nước',
    subtitle: 'Tra cứu thông tin và thanh toán trực tuyến VietQR',
  },
  QUEUE: {
    title: 'Bốc số trực tuyến',
    subtitle: 'Số 204, Quang Trung, Khóm 26, P. Tân Thành',
  },
  COMPLAINTS: {
    title: 'Báo sự cố nước',
    subtitle: 'Mô tả chi tiết để xử lý nhanh',
  },
  NEWS: {
    title: 'Tin tức',
    subtitle: 'Cập nhật mới nhất từ CAWACO Cà Mau',
  },
  MAP: {
    title: 'Bản đồ',
    subtitle: 'Mạng lưới cấp nước & điểm giao dịch CAWACO',
  },
  ACCOUNT: {
    title: 'Tài khoản',
    subtitle: 'Thông tin khách hàng và danh sách đồng hồ',
  },
  AGENTS: {
    title: 'Đại lý thu hộ',
    subtitle: 'Điểm thu hộ tiền nước ủy quyền tại Cà Mau',
  },
  ENTERPRISE: {
    title: 'Doanh nghiệp',
    subtitle: 'Dịch vụ cấp nước và đấu nối công nghiệp',
  },
  REGISTRATION: {
    title: 'Đăng ký lắp mới',
    subtitle: 'Nộp hồ sơ cấp nước sinh hoạt và sản xuất',
  },
  HANDBOOK: {
    title: 'Sổ tay dùng nước',
    subtitle: 'Cẩm nang hướng dẫn và biểu giá nước sạch',
  },
  ASSISTANT: {
    title: 'Trợ lý ảo CAWACO',
    subtitle: 'Hỏi đáp nghiệp vụ và hỗ trợ khẩn cấp 24/7',
  },
  SURVEY: {
    title: 'Góp ý kiến',
    subtitle: 'Tiếp nhận ý kiến đóng góp & đánh giá dịch vụ',
  },
  FEEDBACK: {
    title: 'Góp ý kiến',
    subtitle: 'Tiếp nhận ý kiến đóng góp & khảo sát mức độ hài lòng',
  },
  METER_READING: {
    title: 'Báo chỉ số nước',
    subtitle: 'Tự ghi và gửi chỉ số đồng hồ nước định kỳ',
  },
  QUICK_LOOKUP: {
    title: 'Hóa đơn tiền nước',
    subtitle: 'Tra cứu thông tin và thanh toán trực tuyến VietQR',
  },
  MESSAGES: {
    title: 'Nhắn tin CSKH Zalo',
    subtitle: 'Kênh hỗ trợ trực tuyến và thông báo Zalo OA',
  },
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [user, setUser] = useState<UserProfile | null>(MiniAppAuthService.getStoredUser());
  const [vietQrInvoice, setVietQrInvoice] = useState<any | null>(null);

  // Mở trực tiếp khung Chat Zalo OA (native Zalo hoặc chuyển trang Zalo OA trên web)
  const handleOpenZaloChat = useCallback((e?: React.MouseEvent) => {
    // Kiểm tra xem có đang chạy trong môi trường Zalo runtime thật hay trình duyệt web máy tính
    const isZaloEnvironment = typeof window !== 'undefined' && (
      (window as any).ZLP !== undefined ||
      (window as any).zmp !== undefined ||
      /zalo/i.test(navigator.userAgent)
    );

    if (isZaloEnvironment) {
      if (e) e.preventDefault();
      try {
        openChat({
          type: 'oa',
          id: ZALO_CONFIG.OA_ID,
          message: 'Xin chào Tổng đài CSKH CAWACO Cà Mau, tôi cần hỗ trợ dịch vụ nước sạch.',
        }).catch((err) => {
          console.warn('[Zalo SDK] openChat fallback trong Zalo:', err);
          window.location.href = ZALO_CONFIG.OA_URL;
        });
      } catch {
        window.location.href = ZALO_CONFIG.OA_URL;
      }
    } else {
      // Khi đang chạy trên Web browser (Chrome/Edge localhost):
      // Nếu click từ thẻ <a> thì để thẻ <a> tự mở tab mới, nếu gọi bằng code thì mở window.open ngay lập tức
      if (!e) {
        window.open(ZALO_CONFIG.OA_URL, '_blank');
      }
    }
  }, []);

  // Điều hướng có lưu lịch sử để hỗ trợ nút Back phần cứng của điện thoại
  const navigateTo = useCallback((tab: TabType) => {
    if (tab === 'MESSAGES') {
      handleOpenZaloChat();
      return;
    }
    if (tab === activeTab) return;
    try {
      window.history.pushState({ tab }, '', `#${tab.toLowerCase()}`);
    } catch {
      // Ignore if history state fails in sandbox
    }
    setActiveTab(tab);
  }, [activeTab, handleOpenZaloChat]);

  // Xử lý nút Back của điện thoại hoặc nút Quay lại trên Header
  const handleBack = useCallback(() => {
    if (vietQrInvoice) {
      setVietQrInvoice(null);
      return;
    }
    if (activeTab !== 'HOME') {
      try {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          setActiveTab('HOME');
        }
      } catch {
        setActiveTab('HOME');
      }
    }
  }, [vietQrInvoice, activeTab]);

  // Lắng nghe sự kiện nút Back phần cứng (Android / Zalo Gesture)
  useEffect(() => {
    try {
      window.history.replaceState({ tab: 'HOME' }, '', '#home');
    } catch {
      // Ignore
    }

    const handlePopState = (event: PopStateEvent) => {
      if (vietQrInvoice) {
        setVietQrInvoice(null);
        return;
      }
      const targetTab: TabType = event.state?.tab || 'HOME';
      if (targetTab === 'MESSAGES') {
        handleOpenZaloChat();
        return;
      }
      setActiveTab(targetTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [vietQrInvoice, handleOpenZaloChat]);

  useEffect(() => {
    MiniAppAuthService.initZaloAuth().then(({ user: authUser }) => {
      setUser(authUser);
    });
  }, []);

  const formatVnd = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const isMapMode = activeTab === 'MAP';
  const isHomeMode = activeTab === 'HOME';
  const isAssistantMode = activeTab === 'ASSISTANT';

  return (
    <div className="mobile-container">
      {/* CLEAN MINIMAL SUBPAGE TOP BAR (Loại bỏ icon back theo yêu cầu, chỉ hiển thị tiêu đề gọn gàng) */}
      {!isHomeMode && (
        <header className="minimal-subpage-header">
          <div className="minimal-header-inner">
            <h1 className="minimal-header-title">
              {SUBPAGE_INFO[activeTab as Exclude<TabType, 'HOME'>]?.title || 'CAWACO'}
            </h1>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main
        className={[
          'content-scrollable',
          isHomeMode ? 'content-home-mode' : '',
          isMapMode ? 'content-map-mode' : '',
          isAssistantMode ? 'content-chat-mode' : '',
        ].filter(Boolean).join(' ')}
      >
        {activeTab === 'HOME' && (
          <HomePage onNavigate={navigateTo} onOpenVietQr={setVietQrInvoice} user={user} />
        )}
        {activeTab === 'INVOICES' && (
          <InvoicePage onOpenVietQr={setVietQrInvoice} />
        )}
        {activeTab === 'QUEUE' && <QueuePage />}
        {activeTab === 'COMPLAINTS' && <ComplaintPage />}
        {activeTab === 'NEWS' && <NewsPage />}
        {activeTab === 'MAP' && <MapPage />}
        {activeTab === 'AGENTS' && <AgentsPage />}
        {activeTab === 'ENTERPRISE' && <EnterprisePage onNavigate={navigateTo} />}
        {activeTab === 'REGISTRATION' && <RegistrationPage user={user} />}
        {activeTab === 'HANDBOOK' && <HandbookPage />}
        {activeTab === 'ASSISTANT' && <AssistantPage onNavigate={navigateTo} />}
        {activeTab === 'SURVEY' && <FeedbackPage user={user} />}
        {activeTab === 'FEEDBACK' && <FeedbackPage user={user} />}
        {activeTab === 'METER_READING' && <MeterReadingPage />}
        {activeTab === 'QUICK_LOOKUP' && <InvoicePage onOpenVietQr={setVietQrInvoice} />}
        {activeTab === 'ACCOUNT' && (
          <div style={{ paddingBottom: '30px' }}>
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--cawaco-primary)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      backgroundColor: 'var(--cawaco-primary)', color: '#FFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '18px',
                    }}
                  >
                    {user?.avatarText || 'KH'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                    {user?.fullName || 'Khách hàng Zalo'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {user?.phone || '0918 234 567'} | Zalo ID: {user?.zaloId || 'Chưa liên kết'}
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '10px' }}>
                Danh sách đồng hồ nước đã liên kết
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>CM102938 (MTR-88291)</strong>
                  <span className="badge badge-paid" style={{ fontSize: '10px' }}>Mặc định</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Số 204, đường Quang Trung, Phường Tân Thành, TP. Cà Mau
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        {/* Tab 1: Trang chu */}
        <div className={`nav-item ${activeTab === 'HOME' ? 'active' : ''}`} onClick={() => navigateTo('HOME')}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="nav-label">Trang chủ</span>
        </div>

        {/* Tab 2: Ban do */}
        <div className={`nav-item ${activeTab === 'MAP' ? 'active' : ''}`} onClick={() => navigateTo('MAP')}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </div>
          <span className="nav-label">Bản đồ</span>
        </div>

        {/* Tab 3: Tin tuc */}
        <div className={`nav-item ${activeTab === 'NEWS' ? 'active' : ''}`} onClick={() => navigateTo('NEWS')}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
          <span className="nav-label">Tin tức</span>
        </div>

        {/* Tab 4: Nhắn tin Zalo OA trực tiếp */}
        <a
          href={ZALO_CONFIG.OA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item"
          onClick={handleOpenZaloChat}
          style={{ textDecoration: 'none', color: 'var(--color-text-muted)', fontWeight: 500 }}
        >
          <div className="nav-icon" style={{ color: 'var(--color-text-muted)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <span className="nav-label" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Nhắn tin
          </span>
        </a>

        {/* Tab 5: Tai khoan */}
        <div className={`nav-item ${activeTab === 'ACCOUNT' ? 'active' : ''}`} onClick={() => navigateTo('ACCOUNT')}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="nav-label">Tài khoản</span>
        </div>
      </nav>

      {/* VIETQR MODAL */}
      {vietQrInvoice && (
        <div className="modal-overlay" onClick={() => setVietQrInvoice(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                Thanh toán hóa đơn VietQR
              </div>
              <button onClick={() => setVietQrInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <img
                src={`https://img.vietqr.io/image/970436-0031000123456-compact2.png?amount=${vietQrInvoice.totalAmount}&addInfo=CAWACO%20${vietQrInvoice.customerCode}%20${vietQrInvoice.period.replace('/', '')}&accountName=CONG%20TY%20CP%20CAP%20NUOC%20CA%20MAU`}
                alt="VietQR NAPAS247"
                style={{ width: '240px', height: '240px', borderRadius: '12px', border: '1px solid #CBD5E1', margin: '0 auto', display: 'block' }}
              />
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--cawaco-teal)', marginTop: '12px' }}>
                {formatVnd(vietQrInvoice.totalAmount)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Nội dung CK: <strong>CAWACO {vietQrInvoice.customerCode} {vietQrInvoice.period.replace('/', '')}</strong>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', fontSize: '12px', lineHeight: 1.6, color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              <div><strong>Đơn vị thụ hưởng:</strong> CÔNG TY CP CẤP NƯỚC CÀ MAU</div>
              <div><strong>Ngân hàng:</strong> Vietcombank Cà Mau (970436)</div>
              <div><strong>Số tài khoản:</strong> 0031 000 123 456</div>
              <div><strong>Tự động gạch nợ:</strong> Sau khi chuyển khoản 3 - 5 giây.</div>
            </div>

            <button className="btn btn-secondary" onClick={() => setVietQrInvoice(null)} style={{ width: '100%' }}>
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
