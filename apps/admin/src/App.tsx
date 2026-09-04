import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { QueueMonitor } from './pages/QueueMonitor.js';
import { Complaints } from './pages/Complaints.js';
import { NewsManagement } from './pages/NewsManagement.js';
import { CustomerLookup } from './pages/CustomerLookup.js';
import { StaffManagement } from './pages/StaffManagement.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { ZaloMessaging } from './pages/ZaloMessaging.js';
import { useSidebarCounts } from './hooks/useSidebarCounts.js';

export type AdminView = 'QUEUE' | 'COMPLAINTS' | 'OUTAGES' | 'CUSTOMERS' | 'STAFF' | 'PROFILE' | 'ZALO';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('QUEUE');
  const { counts } = useSidebarCounts();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isManager = user?.role === 'BRANCH_MANAGER';
  const isCounterStaff = user?.role === 'COUNTER_STAFF';
  const isFieldWorker = user?.role === 'FIELD_WORKER';

  // Mac dinh chuyen tab phu hop neu role han che
  const canAccessQueue = isSuperAdmin || isManager || isCounterStaff;
  const canAccessComplaints = isSuperAdmin || isManager || isFieldWorker;
  const canAccessOutages = isSuperAdmin || isManager;
  const canAccessCustomers = isSuperAdmin || isManager || isCounterStaff;
  const canAccessStaff = isSuperAdmin || isManager;

  // Tu dong chuyen ve QUEUE neu tai khoan khong co quyen xem Cán bộ & Phân ca
  React.useEffect(() => {
    if (user && currentView === 'STAFF' && !canAccessStaff) {
      setCurrentView('QUEUE');
    }
  }, [user, currentView, canAccessStaff]);

  // Neu chua dang nhap -> Hien thi trang Login
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* 1. Sidebar Thuong Hieu CAWACO Ocean Navy Gradient */}
      <aside className="w-64 bg-gradient-to-b from-[#031d38] via-[#06335a] to-[#021b33] text-white flex flex-col justify-between flex-shrink-0 shadow-2xl border-r border-blue-900/30 z-20">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg border border-sky-300/30 flex-shrink-0 overflow-hidden">
                <img src="/brand/logo.jpg" alt="CAWACO Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-wide text-white font-heading">CAWACO</div>
                <div className="text-[10px] text-sky-200/90 uppercase tracking-widest font-semibold">Cổng Điều Hành & Quầy</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu (Toàn quyền sử dụng các nghiệp vụ) */}
          <nav className="p-3 space-y-1.5">
            {/* 1. Gọi Số Quầy Trực Tiếp */}
            <button
              onClick={() => setCurrentView('QUEUE')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-left group ${
                currentView === 'QUEUE'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-950/30 font-semibold border border-sky-400/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="truncate">Gọi Số Quầy Trực Tiếp</span>
              </div>
              {counts.queueWaiting > 0 && (
                <span
                  title={`${counts.queueWaiting} khách hàng đang đợi phục vụ`}
                  className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-tight flex-shrink-0 transition ${
                    currentView === 'QUEUE'
                      ? 'bg-white text-blue-800 shadow-sm'
                      : 'bg-sky-500/25 text-sky-200 border border-sky-400/30 group-hover:bg-sky-500 group-hover:text-white'
                  }`}
                >
                  {counts.queueWaiting}
                </span>
              )}
            </button>

            {/* 2. Điều Phối Sự Cố Nước */}
            <button
              onClick={() => setCurrentView('COMPLAINTS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-left group ${
                currentView === 'COMPLAINTS'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-950/30 font-semibold border border-sky-400/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="truncate">Điều Phối Sự Cố Nước</span>
              </div>
              {counts.complaintsPending > 0 && (
                <span
                  title={`${counts.complaintsPending} sự cố báo từ Mini App chờ điều phối`}
                  className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-tight bg-rose-500 text-white shadow-sm shadow-rose-950/40 flex-shrink-0 animate-pulse"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-90"></span>
                  {counts.complaintsPending}
                </span>
              )}
            </button>

            {/* 3. Thông Báo Cúp Nước */}
            <button
              onClick={() => setCurrentView('OUTAGES')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-left ${
                currentView === 'OUTAGES'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-950/30 font-semibold border border-sky-400/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6Z" />
              </svg>
              <span>Thông Báo Cúp Nước</span>
            </button>

            {/* 4. Tin Nhắn Zalo & CSKH */}
            <button
              onClick={() => setCurrentView('ZALO')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-left group ${
                currentView === 'ZALO'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-950/30 font-semibold border border-sky-400/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span className="truncate">Tin Nhắn Zalo &amp; CSKH</span>
              </div>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-400/25 text-sky-200 border border-sky-400/30">
                OA
              </span>
            </button>

            {/* 5. Hồ Sơ Khách Hàng */}
            <button
              onClick={() => setCurrentView('CUSTOMERS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-left group ${
                currentView === 'CUSTOMERS'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-950/30 font-semibold border border-sky-400/30'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="truncate">Hồ Sơ Khách Hàng</span>
              </div>
              {counts.registrationsPending > 0 && (
                <span
                  title={`${counts.registrationsPending} hồ sơ đăng ký gắn mới chờ duyệt`}
                  className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-tight flex-shrink-0 transition ${
                    currentView === 'CUSTOMERS'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 group-hover:bg-emerald-500 group-hover:text-white'
                  }`}
                >
                  {counts.registrationsPending} đơn
                </span>
              )}
            </button>

            {/* 6. Cán Bộ & Phân Ca (Chỉ Quản trị viên & Trưởng chi nhánh mới có quyền truy cập) */}
            {canAccessStaff && (
              <button
                onClick={() => setCurrentView('STAFF')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 text-left ${
                  currentView === 'STAFF'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-950/30 font-semibold border border-sky-400/30'
                    : 'text-sky-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
                <span>Cán Bộ &amp; Phân Ca</span>
              </button>
            )}
          </nav>
        </div>

        {/* Dynamic User Profile Card & Logout */}
        <div className="p-3.5 m-3 rounded-2xl bg-black/30 backdrop-blur-sm text-xs border border-white/10 space-y-2.5 shadow-inner">
          <div
            onClick={() => setCurrentView('PROFILE')}
            className={`flex items-center gap-2.5 p-2 -m-1 rounded-xl cursor-pointer transition group border ${
              currentView === 'PROFILE'
                ? 'bg-blue-600/40 border-sky-400/40 shadow-sm'
                : 'hover:bg-white/10 border-transparent'
            }`}
            title="Nhấn để xem và chỉnh sửa hồ sơ cá nhân"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/25 border border-sky-400/40 flex items-center justify-center font-bold text-sky-200 text-xs group-hover:scale-105 transition overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate text-xs group-hover:text-sky-200 transition flex items-center justify-between">
                <span className="truncate">{user.fullName}</span>
                <svg className="w-3.5 h-3.5 text-sky-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-[11px] text-sky-200 font-mono">
                {user.employeeCode || 'Nội bộ'} {user.counterNumber ? `— Quầy 0${user.counterNumber}` : ''}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-sky-300/80 line-clamp-1 border-t border-white/5 pt-1.5">
            {user.branchName || 'Trụ sở chính 204 Quang Trung'}
          </div>

          <button
            onClick={logout}
            className="w-full py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-rose-600/80 text-sky-100 hover:text-white font-semibold text-[11px] transition flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Body Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Cổng Điều Hành</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">
              {currentView === 'QUEUE' && 'Gọi Số Quầy Trực Tiếp'}
              {currentView === 'COMPLAINTS' && 'Điều Phối Sự Cố Mạng Lưới'}
              {currentView === 'OUTAGES' && 'Quản Lý Thông Báo & Cúp Nước'}
              {currentView === 'ZALO' && 'Quản Trị Tin Nhắn Zalo & CSKH'}
              {currentView === 'CUSTOMERS' && 'Tra Cứu Hồ Sơ Khách Hàng'}
              {currentView === 'STAFF' && 'Quản Lý Cán Bộ & Phân Ca Làm Việc'}
              {currentView === 'PROFILE' && 'Hồ Sơ Cán Bộ & Thiết Lập Tài Khoản'}
            </span>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <main className={`flex-1 ${currentView === 'ZALO' ? 'p-0 overflow-hidden' : 'overflow-y-auto p-6'} bg-slate-50 flex flex-col`}>
          {currentView === 'QUEUE' && <QueueMonitor />}
          {currentView === 'COMPLAINTS' && <Complaints />}
          {currentView === 'OUTAGES' && <NewsManagement />}
          {currentView === 'ZALO' && <ZaloMessaging />}
          {currentView === 'CUSTOMERS' && <CustomerLookup />}
          {currentView === 'STAFF' && (
            canAccessStaff ? (
              <StaffManagement />
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-lg mx-auto mt-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                  !
                </div>
                <h3 className="font-bold text-slate-800 text-base">Từ chối truy cập (403 Forbidden)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tài khoản nhân viên của bạn không có thẩm quyền truy cập tính năng Quản lý cán bộ &amp; Cấp phát tài khoản. Vui lòng liên hệ Trưởng phòng hoặc Quản trị viên hệ thống.
                </p>
                <button
                  onClick={() => setCurrentView('QUEUE')}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Quay lại Gọi số quầy
                </button>
              </div>
            )
          )}
          {currentView === 'PROFILE' && <ProfilePage onBack={() => setCurrentView('QUEUE')} />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminLayout />
    </AuthProvider>
  );
};
