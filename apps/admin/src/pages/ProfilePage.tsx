import React, { useState, useEffect } from 'react';
import { useAuth, AdminUser } from '../context/AuthContext.js';

interface ProfilePageProps {
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'INFO' | 'SECURITY'>('INFO');

  const [isEditing, setIsEditing] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when user in context changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Quản Trị Viên Hệ Thống', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'BRANCH_MANAGER':
        return { label: 'Cán Bộ Quản Lý Chi Nhánh', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'COUNTER_STAFF':
        return { label: 'Nhân Viên Giao Dịch Quầy', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'FIELD_WORKER':
        return { label: 'Kỹ Thuật Viên Xử Lý Sự Cố', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: 'Cán Bộ Nội Bộ', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const roleInfo = getRoleBadge(user.role);

  const compressImage = (file: File, maxDim = 320, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) return reject(new Error('Không thể đọc tệp ảnh'));
        img.src = e.target.result as string;
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(img.src);

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = (err) => reject(err);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Kích thước ảnh không được vượt quá 8MB.' });
      return;
    }

    try {
      const compressed = await compressImage(file, 320, 0.85);
      setAvatarUrl(compressed);

      // Save & sync avatar immediately across whole app
      setSavingProfile(true);
      setProfileMsg(null);

      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, phone, email, avatarUrl: compressed }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Lỗi phản hồi từ máy chủ (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Cập nhật ảnh đại diện thất bại.');
      }

      updateUser(data.data.user, data.data.token);
      setProfileMsg({ type: 'success', text: 'Đã cập nhật và đồng bộ ảnh đại diện thành công!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message || 'Không thể xử lý và lưu ảnh đại diện.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      setAvatarUrl('');

      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, phone, email, avatarUrl: '' }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Lỗi phản hồi từ máy chủ (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Gỡ ảnh đại diện thất bại.');
      }

      updateUser(data.data.user, data.data.token);
      setProfileMsg({ type: 'success', text: 'Đã gỡ ảnh đại diện thành công!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message || 'Có lỗi xảy ra khi gỡ ảnh đại diện.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileMsg({ type: 'error', text: 'Họ và tên không được để trống.' });
      return;
    }

    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, phone, email, avatarUrl }),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Lỗi phản hồi từ máy chủ (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Cập nhật thông tin thất bại.');
      }

      updateUser(data.data.user, data.data.token);
      setIsEditing(false);
      setProfileMsg({ type: 'success', text: 'Đã lưu và cập nhật thông tin hồ sơ thành công!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message || 'Có lỗi xảy ra khi lưu thông tin.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassMsg({ type: 'error', text: 'Vui lòng điền đầy đủ các trường mật khẩu.' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.' });
      return;
    }

    setSavingPass(true);
    setPassMsg(null);

    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Đổi mật khẩu thất bại.');
      }

      setPassMsg({ type: 'success', text: 'Đổi mật khẩu tài khoản thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err?.message || 'Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra.' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Hệ Thống</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">Hồ Sơ Cán Bộ & Tài Khoản</span>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại bảng điều khiển</span>
          </button>
        )}
      </div>

      {/* Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#031d38] via-[#06335a] to-[#034078] p-8 text-white shadow-xl">
        {/* Glow background decorations */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Squircle with Camera Edit Trigger */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 border-2 border-white/40 flex items-center justify-center font-black text-white text-3xl shadow-lg shadow-sky-950/50 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : user.fullName ? (
                  user.fullName.charAt(0).toUpperCase()
                ) : (
                  'U'
                )}
              </div>

              {/* Quick Camera Upload Button */}
              <label
                htmlFor="avatar-upload-input"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white text-slate-700 hover:text-blue-600 hover:bg-sky-50 border border-slate-200 shadow-md flex items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95"
                title="Tải lên ảnh đại diện mới"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>

              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white">{user.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-sky-200 border border-white/20">
                  {user.employeeCode || 'NỘI BỘ'}
                </span>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs text-sky-200/70 hover:text-rose-300 underline transition ml-1"
                    title="Xóa ảnh đại diện tùy chỉnh"
                  >
                    Gỡ ảnh
                  </button>
                )}
              </div>
              <p className="text-sm text-sky-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{user.branchName || 'Trụ sở chính 204 Quang Trung, P. Tân Thành, TP. Cà Mau'}</span>
              </p>
              {user.counterNumber && (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Quầy Giao Dịch Số 0{user.counterNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('INFO')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'INFO'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Thông Tin Cá Nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'SECURITY'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Bảo Mật</span>
        </button>
      </div>

      {/* Tab 1: Edit Profile */}
      {activeTab === 'INFO' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Thông Tin Hồ Sơ</h2>
                <p className="text-xs text-slate-500">Thông tin được đồng bộ trực tiếp với cơ sở dữ liệu nhân sự CAWACO.</p>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setProfileMsg(null);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 shadow-sm transition active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Chỉnh sửa thông tin</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Chế độ chỉnh sửa
                </span>
              )}
            </div>

            {profileMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã nhân viên</label>
                  <input
                    type="text"
                    value={user.employeeCode || 'NỘI BỘ'}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò phân quyền</label>
                  <input
                    type="text"
                    value={roleInfo.label}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên cán bộ *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  readOnly={!isEditing}
                  placeholder="Nhập họ và tên đầy đủ"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                    !isEditing
                      ? 'bg-slate-50 border border-slate-200 text-slate-700 cursor-default'
                      : 'bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên lạc</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    readOnly={!isEditing}
                    placeholder="VD: 0918 234 567"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                      !isEditing
                        ? 'bg-slate-50 border border-slate-200 text-slate-700 cursor-default'
                        : 'bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email công vụ</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!isEditing}
                    placeholder="VD: staff@cawaco.com.vn"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition ${
                      !isEditing
                        ? 'bg-slate-50 border border-slate-200 text-slate-700 cursor-default'
                        : 'bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={savingProfile}
                    onClick={() => {
                      setFullName(user.fullName || '');
                      setPhone(user.phone || '');
                      setEmail(user.email || '');
                      setIsEditing(false);
                      setProfileMsg(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50 active:scale-95"
                  >
                    {savingProfile ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Lưu Thay Đổi</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Quick Work Info Sidebar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Địa Bàn & Phân Công</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Chi nhánh công tác:</span>
                <span className="font-semibold text-slate-700 block">
                  {user.branchName || 'Trụ sở chính Công ty Cổ phần Cấp nước Cà Mau'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Địa chỉ giao dịch:</span>
                <span className="font-semibold text-slate-700 block">
                  Số 204, đường Quang Trung, P. Tân Thành, TP. Cà Mau
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Quầy phục vụ:</span>
                <span className="font-semibold text-blue-700 block">
                  {user.counterNumber ? `Quầy giao dịch số 0${user.counterNumber}` : 'Điều phối toàn hệ thống'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Trạng thái hồ sơ:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đang hoạt động chính thức
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Change Password */}
      {activeTab === 'SECURITY' && (
        <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Đổi Mật Khẩu Tài Khoản</h2>
            <p className="text-xs text-slate-500">Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn truy cập.</p>
          </div>

          {passMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                passMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu hiện tại *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu đang sử dụng"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới *</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới *</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPass"
                checked={showPass}
                onChange={(e) => setShowPass(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showPass" className="text-xs text-slate-600 cursor-pointer">
                Hiển thị mật khẩu khi nhập
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPass}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {savingPass ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Cập Nhật Mật Khẩu</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
