import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage.js';
import { InvoicePage } from './pages/InvoicePage.js';
import { QueuePage } from './pages/QueuePage.js';
import { ComplaintPage } from './pages/ComplaintPage.js';
import { NewsPage } from './pages/NewsPage.js';
import { MapPage } from './pages/MapPage.js';
import { MiniAppAuthService, UserProfile } from './services/auth.js';

export type TabType = 'HOME' | 'INVOICES' | 'QUEUE' | 'COMPLAINTS' | 'NEWS' | 'MAP' | 'ACCOUNT';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [user, setUser] = useState<UserProfile | null>(MiniAppAuthService.getStoredUser());
  const [vietQrInvoice, setVietQrInvoice] = useState<any | null>(null);

  useEffect(() => {
    // Khoi tao xac thuc Zalo khi component mount
    MiniAppAuthService.initZaloAuth().then(({ user: authUser }) => {
      setUser(authUser);
    });
  }, []);

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="mobile-container">
      {/* 1. Header cố định — logo CAWACO thật */}
      <header className="app-header">
        <div className="brand-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Logo CAWACO thật từ assets/brand/logo.jpg */}
          <img
            src="/brand/logo.jpg"
            alt="Logo CAWACO"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.85)',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div className="brand-info">
            <span className="brand-name" style={{ fontSize: '15px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: 1.1 }}>CAWACO</span>
            <span className="brand-sub" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', display: 'block' }}>Cấp Nước Cà Mau</span>
          </div>
        </div>

        <div className="user-profile-group">
          <div className="notification-btn" onClick={() => setActiveTab('NEWS')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="notification-dot" />
          </div>

          <div
            className="user-avatar"
            onClick={() => setActiveTab('ACCOUNT')}
            style={{ cursor: 'pointer' }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              user?.avatarText || 'AN'
            )}
          </div>
        </div>
      </header>

      {/* 2. Noi dung man hinh theo Tab */}
      <main className={`content-scrollable${activeTab === 'MAP' ? ' content-map-mode' : ''}`}>
        {activeTab === 'HOME' && (
          <HomePage onNavigate={setActiveTab} onOpenVietQr={setVietQrInvoice} />
        )}
        {activeTab === 'INVOICES' && (
          <InvoicePage onOpenVietQr={setVietQrInvoice} />
        )}
        {activeTab === 'QUEUE' && <QueuePage />}
        {activeTab === 'COMPLAINTS' && <ComplaintPage />}
        {activeTab === 'NEWS' && <NewsPage />}
        {activeTab === 'MAP' && <MapPage />}
        {activeTab === 'ACCOUNT' && (
          <div style={{ paddingBottom: '30px' }}>
            <div className="section-title">Tài khoản & Danh bạ đồng hồ</div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cawaco-primary)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '18px',
                  }}
                >
                  {user?.avatarText || 'AN'}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                    {user?.fullName || 'Nguyễn Văn An'}
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
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '8px',
                }}
              >
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

      {/* 3. Bottom Navigation Bar — 5 tabs */}
      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'HOME' ? 'active' : ''}`} onClick={() => setActiveTab('HOME')}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={activeTab === 'HOME' ? 'var(--cawaco-primary)' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="nav-label">Trang chủ</span>
        </div>

        <div className={`nav-item ${activeTab === 'INVOICES' ? 'active' : ''}`} onClick={() => setActiveTab('INVOICES')}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <span className="nav-label">Hóa đơn</span>
        </div>

        <div className={`nav-item ${activeTab === 'QUEUE' ? 'active' : ''}`} onClick={() => setActiveTab('QUEUE')}>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="nav-label">Bốc số</span>
        </div>

        <div className={`nav-item ${activeTab === 'MAP' ? 'active' : ''}`} onClick={() => setActiveTab('MAP')}>
          <div className="nav-icon">
            {/* Map Pin SVG icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill={activeTab === 'MAP' ? 'var(--cawaco-primary)' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" fill={activeTab === 'MAP' ? '#fff' : 'none'} />
            </svg>
          </div>
          <span className="nav-label">Bản đồ</span>
        </div>

        <div className={`nav-item ${activeTab === 'NEWS' ? 'active' : ''}`} onClick={() => setActiveTab('NEWS')}>
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
      </nav>

      {/* 4. VietQR Bottom Sheet Modal */}
      {vietQrInvoice && (
        <div className="modal-overlay" onClick={() => setVietQrInvoice(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                Thanh toán hóa đơn VietQR
              </div>
              <button
                onClick={() => setVietQrInvoice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              {/* VietQR Generator URL chuan NAPAS247 */}
              <img
                src={`https://img.vietqr.io/image/970436-0031000123456-compact2.png?amount=${vietQrInvoice.totalAmount}&addInfo=CAWACO%20${vietQrInvoice.customerCode}%20${vietQrInvoice.period.replace('/', '')}&accountName=CONG%20TY%20CP%20CAP%20NUOC%20CA%20MAU`}
                alt="VietQR NAPAS247"
                style={{
                  width: '240px',
                  height: '240px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)', marginTop: '12px' }}>
                {formatVnd(vietQrInvoice.totalAmount)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Nội dung chuyển khoản: <strong>CAWACO {vietQrInvoice.customerCode} {vietQrInvoice.period.replace('/', '')}</strong>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                lineHeight: 1.6,
                color: 'var(--color-text-muted)',
                marginBottom: '16px',
              }}
            >
              <div><strong>Đơn vị thụ hưởng:</strong> CÔNG TY CP CẤP NƯỚC CÀ MAU</div>
              <div><strong>Ngân hàng:</strong> Vietcombank Cà Mau (970436)</div>
              <div><strong>Số tài khoản:</strong> 0031 000 123 456</div>
              <div><strong>Tự động gạch nợ:</strong> Sau khi chuyển khoản 3 - 5 giây.</div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setVietQrInvoice(null)}
              style={{ width: '100%' }}
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
