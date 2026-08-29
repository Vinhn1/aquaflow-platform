import React, { useState } from 'react';
import { QueueMonitor } from './pages/QueueMonitor.js';
import { Complaints } from './pages/Complaints.js';
import { NewsManagement } from './pages/NewsManagement.js';
import { CustomerLookup } from './pages/CustomerLookup.js';

export type AdminView = 'QUEUE' | 'COMPLAINTS' | 'OUTAGES' | 'CUSTOMERS';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('QUEUE');

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* 1. Sidebar Thuong Hieu CAWACO Deep Navy */}
      <aside className="w-64 bg-[#003B6F] text-white flex flex-col justify-between flex-shrink-0 shadow-lg">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-blue-900/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-lg tracking-wider">
                CW
              </div>
              <div>
                <div className="font-extrabold text-base tracking-wide text-white font-heading">CAWACO</div>
                <div className="text-[11px] text-blue-200 uppercase tracking-wider">Cổng Quản Trị & Quầy</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setCurrentView('QUEUE')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left ${
                currentView === 'QUEUE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Gọi Số Quầy Trực Tiếp</span>
            </button>

            <button
              onClick={() => setCurrentView('COMPLAINTS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left ${
                currentView === 'COMPLAINTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Điều Phối Sự Cố Nước</span>
            </button>

            <button
              onClick={() => setCurrentView('OUTAGES')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left ${
                currentView === 'OUTAGES'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6Z" />
              </svg>
              <span>Thông Báo Cúp Nước</span>
            </button>

            <button
              onClick={() => setCurrentView('CUSTOMERS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left ${
                currentView === 'CUSTOMERS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Hồ Sơ Khách Hàng</span>
            </button>
          </nav>
        </div>

        {/* User Info Badge */}
        <div className="p-4 m-3 rounded-xl bg-black/20 text-xs border border-white/10">
          <div className="font-bold text-white">Trần Văn B</div>
          <div className="text-blue-200 mt-0.5">Quầy 01 — Trụ sở 204 Quang Trung</div>
          <div className="text-[10px] text-blue-300/80 mt-1">Cấp Nước Cà Mau (CAWACO)</div>
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
              {currentView === 'CUSTOMERS' && 'Tra Cứu Hồ Sơ Khách Hàng'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống kết nối DB PostgreSQL (Port 5433)
            </span>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {currentView === 'QUEUE' && <QueueMonitor />}
          {currentView === 'COMPLAINTS' && <Complaints />}
          {currentView === 'OUTAGES' && <NewsManagement />}
          {currentView === 'CUSTOMERS' && <CustomerLookup />}
        </main>
      </div>
    </div>
  );
};
