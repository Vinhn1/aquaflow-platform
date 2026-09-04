import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';

interface StaffMember {
  id: string;
  employeeCode?: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  branchId?: string;
  branchName?: string;
  counterNumber?: number;
  isActive: boolean;
  createdAt: string;
}

export const StaffManagement: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal Create states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('123456');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [formRole, setFormRole] = useState<'COUNTER_STAFF' | 'FIELD_WORKER' | 'BRANCH_MANAGER' | 'SUPER_ADMIN'>('COUNTER_STAFF');
  const [formCounter, setFormCounter] = useState<number | ''>(1);
  const [submitting, setSubmitting] = useState(false);

  // Modal Edit & Reset Password states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'COUNTER_STAFF' | 'FIELD_WORKER' | 'BRANCH_MANAGER' | 'SUPER_ADMIN'>('COUNTER_STAFF');
  const [editCounter, setEditCounter] = useState<number | ''>('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Filter states
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/staff', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Lỗi máy chủ [${res.status}]`);
      }

      const json = await res.json();
      if (json.success) {
        setStaffList(json.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim() || !formPassword.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/v1/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formName,
          employeeCode: formCode,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          password: formPassword,
          role: formRole,
          counterNumber: formRole === 'COUNTER_STAFF' && formCounter ? Number(formCounter) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || 'Không thể tạo tài khoản nhân viên.');
      }

      setSuccessMsg(`Cấp tài khoản mới cho cán bộ ${formName} (${formCode}) thành công!`);
      setIsCreateModalOpen(false);
      // Reset form
      setFormName('');
      setFormCode('');
      setFormEmail('');
      setFormPhone('');
      setFormPassword('123456');
      setFormCounter(1);
      fetchStaff();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi khi cấp tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setEditName(staff.fullName);
    setEditCode(staff.employeeCode || '');
    setEditEmail(staff.email || '');
    setEditPhone(staff.phone || '');
    setEditRole(staff.role as any);
    setEditCounter(staff.counterNumber || '');
    setEditIsActive(staff.isActive);
    setEditPassword('');
    setShowEditPassword(false);
    setIsEditModalOpen(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId || !editName.trim()) {
      setError('Họ và tên cán bộ không được để trống.');
      return;
    }

    setEditSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/v1/admin/staff/${editingStaffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: editName,
          employeeCode: editCode || undefined,
          email: editEmail || undefined,
          phone: editPhone || undefined,
          role: editRole,
          counterNumber: editRole === 'COUNTER_STAFF' && editCounter ? Number(editCounter) : null,
          isActive: editIsActive,
          password: editPassword.trim() ? editPassword.trim() : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || 'Không thể cập nhật thông tin tài khoản.');
      }

      setSuccessMsg(`Cập nhật thông tin cán bộ ${editName} thành công!`);
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi khi cập nhật tài khoản.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    if (filterRole !== 'ALL' && s.role !== filterRole) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(term);
      const matchCode = s.employeeCode?.toLowerCase().includes(term);
      const matchEmail = s.email?.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Quản Lý Cán Bộ & Cấp Phát Tài Khoản
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Khởi tạo, chỉnh sửa thông tin, đặt lại mật khẩu và phân quầy trực cho cán bộ CAWACO
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Cấp Tài Khoản Mới</span>
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-bold text-rose-700 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold text-emerald-700 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Tổng số nhân sự</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{staffList.length} cán bộ</div>
          <div className="text-xs text-slate-400 mt-1">Đã cấp tài khoản nội bộ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Nhân viên trực quầy</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">
            {staffList.filter((s) => s.role === 'COUNTER_STAFF').length} nhân viên
          </div>
          <div className="text-xs text-blue-600 mt-1">Quầy 01 đến Quầy 04</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Kỹ thuật viên hiện trường</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {staffList.filter((s) => s.role === 'FIELD_WORKER').length} kỹ thuật viên
          </div>
          <div className="text-xs text-amber-600 mt-1">Điều phối sự cố mạng lưới</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Quản trị & Trưởng PGD</div>
          <div className="text-2xl font-bold text-teal-800 mt-1">
            {staffList.filter((s) => s.role === 'SUPER_ADMIN' || s.role === 'BRANCH_MANAGER').length} quản lý
          </div>
          <div className="text-xs text-teal-600 mt-1">Toàn quyền điều hành</div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3 items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã nhân viên..."
              className="text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="COUNTER_STAFF">Nhân viên quầy</option>
              <option value="FIELD_WORKER">Kỹ thuật viên</option>
              <option value="BRANCH_MANAGER">Trưởng chi nhánh</option>
              <option value="SUPER_ADMIN">Quản trị viên</option>
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Hiển thị {filteredStaff.length} / {staffList.length} nhân sự
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="p-3.5 whitespace-nowrap">Mã NV</th>
                <th className="p-3.5 whitespace-nowrap">Họ và tên</th>
                <th className="p-3.5 whitespace-nowrap">Vai trò & Chức năng</th>
                <th className="p-3.5 whitespace-nowrap">Quầy phân công</th>
                <th className="p-3.5">Chi nhánh trực thuộc</th>
                <th className="p-3.5 whitespace-nowrap">Trạng thái</th>
                <th className="p-3.5 text-center w-24 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    {loading ? 'Đang tải danh sách cán bộ...' : 'Không tìm thấy nhân viên phù hợp.'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold font-mono text-blue-900 text-xs whitespace-nowrap">
                      {staff.employeeCode || '---'}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 whitespace-nowrap">{staff.fullName}</div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">{staff.email || staff.phone || 'Nội bộ'}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          staff.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : staff.role === 'BRANCH_MANAGER'
                            ? 'bg-indigo-100 text-indigo-700'
                            : staff.role === 'COUNTER_STAFF'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {staff.role === 'SUPER_ADMIN'
                          ? 'Quản Trị Viên'
                          : staff.role === 'BRANCH_MANAGER'
                          ? 'Trưởng Chi Nhánh'
                          : staff.role === 'COUNTER_STAFF'
                          ? 'Nhân Viên Quầy'
                          : 'Kỹ Thuật Viên'}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {staff.counterNumber ? (
                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded font-mono">
                          Quầy 0{staff.counterNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Không phân quầy</span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-slate-600">
                      {staff.branchName || 'Trụ sở chính 204 Quang Trung'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                          staff.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staff.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {staff.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {/* Icon nut Chinh sua & Cap lai mat khau duy nhat */}
                      <button
                        onClick={() => openEditModal(staff)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition shadow-sm border border-blue-200/80 hover:border-blue-600"
                        title="Chỉnh sửa thông tin, phân quầy & cấp lại mật khẩu"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chinh Sua Thong Tin & Cap Lai Mat Khau */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Chỉnh Sửa Cán Bộ & Cấp Lại Mật Khẩu</h3>
                <p className="text-xs text-slate-500">Cập nhật hồ sơ, trạng thái hoặc cấp lại mật khẩu mới cho nhân viên</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Họ và tên cán bộ *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Mã nhân viên (CW-xxx)</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0918xxxxxx"
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email công vụ</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Quầy phục vụ</label>
                  <select
                    value={editCounter}
                    onChange={(e) => setEditCounter(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Không phân quầy</option>
                    <option value={1}>Quầy 01 (Đăng ký lắp mới)</option>
                    <option value={2}>Quầy 02 (Thu ngân & Nộp tiền)</option>
                    <option value={3}>Quầy 03 (Sang tên / Đổi HĐ)</option>
                    <option value={4}>Quầy 04 (Kiểm định & Khiếu nại)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Vai trò</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="COUNTER_STAFF">Nhân viên trực quầy</option>
                    <option value="FIELD_WORKER">Kỹ thuật viên hiện trường</option>
                    <option value="BRANCH_MANAGER">Trưởng chi nhánh / PGD</option>
                    <option value="SUPER_ADMIN">Quản trị viên hệ thống</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Trạng thái tài khoản</label>
                  <select
                    value={editIsActive ? 'ACTIVE' : 'LOCKED'}
                    onChange={(e) => setEditIsActive(e.target.value === 'ACTIVE')}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="ACTIVE">Đang hoạt động (Mở)</option>
                    <option value="LOCKED">Tạm khóa tài khoản</option>
                  </select>
                </div>
              </div>

              {/* Muc Cap Lai Mat Khau */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-blue-900">
                    Cấp Lại Mật Khẩu Mới (Nếu nhân viên quên)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditPassword('123456')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                  >
                    Gán lại mặc định 123456
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Để trống nếu muốn giữ nguyên mật khẩu cũ"
                    className="w-full text-sm p-2 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showEditPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showEditPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nhập mật khẩu mới hoặc click nút "Gán lại mặc định 123456" để cấp lại ngay cho nhân viên.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition"
                >
                  {editSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi & Cấp Lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cap Tai Khoan Moi */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Cấp Tài Khoản Cán Bộ Mới</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Họ và tên cán bộ *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Nam"
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Mã nhân viên (CW-xxx) *</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="VD: CW-891"
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Mật khẩu khởi tạo *</label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Mặc định: 123456"
                      className="w-full text-sm p-2 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showCreatePassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {showCreatePassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email công vụ</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="vannam@cawaco.com.vn"
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0918xxxxxx"
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Vai trò công tác *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="COUNTER_STAFF">Nhân viên trực quầy</option>
                    <option value="FIELD_WORKER">Kỹ thuật viên hiện trường</option>
                    <option value="BRANCH_MANAGER">Trưởng chi nhánh / PGD</option>
                    <option value="SUPER_ADMIN">Quản trị viên hệ thống</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Quầy phục vụ</label>
                  <select
                    value={formCounter}
                    onChange={(e) => setFormCounter(e.target.value ? Number(e.target.value) : '')}
                    disabled={formRole !== 'COUNTER_STAFF'}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">Không phân quầy</option>
                    <option value={1}>Quầy 01 (Đăng ký lắp mới)</option>
                    <option value={2}>Quầy 02 (Thu ngân & Nộp tiền)</option>
                    <option value={3}>Quầy 03 (Sang tên / Đổi HĐ)</option>
                    <option value={4}>Quầy 04 (Kiểm định & Khiếu nại)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition"
                >
                  {submitting ? 'Đang tạo...' : 'Xác Nhận Cấp Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
