import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Mã nhân viên/Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'ADMIN' | 'STAFF_Q1' | 'STAFF_Q2' | 'MANAGER' | 'TECH') => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập nhanh thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-1.5 shadow-xl shadow-blue-500/20 mb-2 border border-blue-400/30 overflow-hidden">
            <img src="/brand/logo.jpg" alt="CAWACO Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">CAWACO AQUAFLOW</h1>
          <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">
            Cổng Điều Hành & Quản Trị Quầy Giao Dịch
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 text-slate-100">
          <h2 className="text-lg font-bold text-white mb-1">Đăng Nhập Cán Bộ Nhân Viên</h2>
          <p className="text-xs text-slate-400 mb-6">
            Sử dụng Mã nhân viên (e.g. <span className="text-blue-400 font-mono">CW-889</span>) hoặc Email nội bộ do phòng CNTT cấp.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Mã Nhân Viên / Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="VD: CW-889 hoặc admin@cawaco.com.vn"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật Khẩu Nội Bộ
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm px-3.5 py-2.5 pr-11 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? (
                    /* Eye Off */
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition duration-150 disabled:opacity-50 mt-2"
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Đăng Nhập Nhanh (Mật khẩu mặc định: 123456)
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleQuick('ADMIN')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-left transition space-y-1"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>CW-ADMIN</span>
                </div>
                <div className="text-[11px] text-blue-300 font-medium">Quản Trị Viên Hệ Thống</div>
                <div className="text-[10px] text-slate-400">Toàn quyền hệ thống & Cấp tài khoản</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('STAFF')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-left transition space-y-1"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Trần Văn B (CW-889)</span>
                </div>
                <div className="text-[11px] text-blue-300 font-medium">Cán Bộ Quản Lý & Điều Hành</div>
                <div className="text-[10px] text-slate-400">Sử dụng toàn bộ các chức năng</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500">
          Công ty Cổ phần Cấp nước Cà Mau (CAWACO) © 2026. Bảo mật & Xác thực nội bộ.
        </div>
      </div>
    </div>
  );
};
