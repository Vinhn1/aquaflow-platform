import React, { useState, useEffect } from 'react';
import { triggerSidebarCountRefresh } from '../hooks/useSidebarCounts';

interface WaterRegistrationItem {
  id: string;
  registrationCode: string;
  fullName: string;
  phone: string;
  idCardNumber: string;
  district: string;
  ward: string;
  streetAddress: string;
  purpose: string;
  status: string;
  createdAt: string;
  adminNote?: string;
  estimatedCost?: number;
}

interface CustomerFeedbackItem {
  id: string;
  ticketCode: string;
  fullName: string;
  phone: string;
  email?: string;
  category: string;
  title: string;
  content: string;
  replyContent?: string;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export const CustomerLookup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LOOKUP' | 'REGISTRATIONS' | 'FEEDBACKS'>('LOOKUP');
  
  // Tab 1: Tra cứu khách hàng
  const [customerCode, setCustomerCode] = useState('CM102938');
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab 2: Đơn đăng ký từ Mini App
  const [registrations, setRegistrations] = useState<WaterRegistrationItem[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Tab 3: Hộp thư góp ý & phản ánh
  const [feedbacks, setFeedbacks] = useState<CustomerFeedbackItem[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleLookup = async (codeToLookup = customerCode) => {
    if (!codeToLookup.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/customers/${codeToLookup.trim().toUpperCase()}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Không tìm thấy mã danh bộ ${codeToLookup} trong cơ sở dữ liệu CAWACO.`);
        }
        throw new Error(`Lỗi máy chủ [${res.status}]`);
      }
      const json = await res.json();
      setCustomer(json.data);
    } catch (err: any) {
      setCustomer(null);
      setError(err?.message || 'Có lỗi xảy ra khi tra cứu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const res = await fetch('/api/v1/registrations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRegistrations(json.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingRegs(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch('/api/v1/feedbacks');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setFeedbacks(json.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'REGISTRATIONS') {
      fetchRegistrations();
    } else if (activeTab === 'FEEDBACKS') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/registrations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionSuccess('Đã cập nhật trạng thái hồ sơ thành công!');
        fetchRegistrations();
        triggerSidebarCountRefresh();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch {
      setActionSuccess('Lỗi khi cập nhật trạng thái.');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback || !replyText.trim()) return;

    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/v1/feedbacks/${selectedFeedback.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyContent: replyText.trim() }),
      });

      if (res.ok) {
        setActionSuccess(`Đã gửi phản hồi chính thức cho phiếu ${selectedFeedback.ticketCode}!`);
        setIsReplying(false);
        setSelectedFeedback(null);
        setReplyText('');
        fetchFeedbacks();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        const json = await res.json();
        alert(json?.error?.message || 'Không thể gửi phản hồi.');
      }
    } catch {
      alert('Lỗi kết nối khi gửi phản hồi.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">Chờ Tiếp Nhận</span>;
      case 'DOCS_APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">Đã Duyệt Hồ Sơ</span>;
      case 'SURVEYING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">Đang Khảo Sát</span>;
      case 'PAYMENT_DUE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">Chờ Đóng Phí</span>;
      case 'INSTALLING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300">Đang Thi Công</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Đã Hoàn Thành</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">Từ Chối</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'GOP_Y':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đóng góp ý kiến</span>;
      case 'KHIEU_NAI':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Phản ánh / Khiếu nại</span>;
      case 'KHEN_NGOI':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Khen ngợi</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">{cat}</span>;
    }
  };

  const pendingFeedbacksCount = feedbacks.filter((f) => !f.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Hồ Sơ Khách Hàng, Đăng Ký & Hộp Thư Phản Ánh
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý danh bạ khách hàng CAWACO, duyệt đơn đăng ký gắn mới và xử lý góp ý từ Zalo Mini App
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('LOOKUP')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'LOOKUP'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tra Cứu Mã Danh Bộ
            </button>
            <button
              onClick={() => setActiveTab('REGISTRATIONS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'REGISTRATIONS'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hồ Sơ Đăng Ký Mini App
            </button>
            <button
              onClick={() => setActiveTab('FEEDBACKS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'FEEDBACKS'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Hộp Thư Góp Ý &amp; Phản Ánh</span>
              {pendingFeedbacksCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white font-mono">
                  {pendingFeedbacksCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'LOOKUP' && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            {/* Search Bar */}
            <div className="flex gap-3 max-w-lg">
              <input
                type="text"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder="Nhập mã danh bộ (VD: CM102938, CM204819)..."
                className="flex-1 text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              />
              <button
                onClick={() => handleLookup()}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                {loading ? 'Đang tra cứu...' : 'Tra Cứu'}
              </button>
            </div>

            {/* Quick buttons */}
            <div className="flex gap-2 items-center mt-3 text-xs text-slate-500">
              <span>Khách hàng mẫu:</span>
              <button
                onClick={() => {
                  setCustomerCode('CM102938');
                  handleLookup('CM102938');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-blue-700 font-medium"
              >
                CM102938 (Nguyễn Văn An)
              </button>
              <button
                onClick={() => {
                  setCustomerCode('CM204819');
                  handleLookup('CM204819');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-blue-700 font-medium"
              >
                CM204819 (Nguyễn Thị Mai)
              </button>
            </div>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {actionSuccess}
        </div>
      )}

      {/* Tab 1 Content: Customer Details */}
      {activeTab === 'LOOKUP' && (
        <>
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
              {error}
            </div>
          )}

          {customer && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Mã danh bộ khách hàng</span>
                  <div className="text-2xl font-extrabold text-blue-900 font-mono">{customer.customerCode}</div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  Hợp đồng đang cấp nước
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Họ và tên chủ hộ:</span>
                  <span className="font-bold text-slate-800">{customer.fullName}</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Số điện thoại liên hệ:</span>
                  <span className="font-medium text-slate-700">{customer.phone || 'Chưa cập nhật'}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-400 block">Địa chỉ lắp đặt đồng hồ:</span>
                  <span className="text-slate-700">{customer.address}</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Số seri đồng hồ nước:</span>
                  <span className="font-mono font-bold text-blue-800">{customer.meterSerialNumber}</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Mục đích &amp; Biểu giá áp dụng:</span>
                  <span className="font-semibold text-teal-700">
                    {customer.tariffGroup === 'DOMESTIC_TP'
                      ? 'Sinh hoạt hộ gia đình TP. Cà Mau (QĐ 13/2023)'
                      : customer.tariffGroup}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2 Content: Online Water Registrations from Mini App */}
      {activeTab === 'REGISTRATIONS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Danh Sách Đơn Đăng Ký Lắp Mới Nộp Từ Zalo Mini App
            </h3>
            <button
              onClick={fetchRegistrations}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Làm mới danh sách
            </button>
          </div>

          {loadingRegs ? (
            <div className="p-8 text-center text-slate-400 text-sm">Đang tải hồ sơ...</div>
          ) : registrations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Chưa có hồ sơ đăng ký lắp mới nào nộp từ Mini App.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">Mã Hồ Sơ</th>
                    <th className="p-3 font-bold">Khách Hàng</th>
                    <th className="p-3 font-bold">Địa Chỉ Lắp Đặt</th>
                    <th className="p-3 font-bold">Mục Đích</th>
                    <th className="p-3 font-bold">Trạng Thái</th>
                    <th className="p-3 font-bold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-blue-700">{reg.registrationCode}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{reg.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{reg.phone}</div>
                      </td>
                      <td className="p-3 max-w-xs text-slate-700 truncate" title={`${reg.streetAddress}, ${reg.ward}, ${reg.district}`}>
                        {reg.streetAddress}, {reg.ward}, {reg.district}
                      </td>
                      <td className="p-3 text-slate-600">{reg.purpose}</td>
                      <td className="p-3">{getStatusBadge(reg.status)}</td>
                      <td className="p-3 text-right space-x-1.5">
                        {reg.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleUpdateStatus(reg.id, 'DOCS_APPROVED')}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[11px] font-semibold transition"
                          >
                            Duyệt Hồ Sơ
                          </button>
                        )}
                        {reg.status === 'DOCS_APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(reg.id, 'SURVEYING')}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold transition"
                          >
                            Khảo Sát
                          </button>
                        )}
                        {reg.status === 'SURVEYING' && (
                          <button
                            onClick={() => handleUpdateStatus(reg.id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                          >
                            Nghiệm Thu
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3 Content: Customer Feedbacks from Mini App */}
      {activeTab === 'FEEDBACKS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Hộp Thư Tiếp Nhận Ý Kiến Đóng Góp &amp; Phản Ánh Dịch Vụ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các phiếu gửi trực tuyến từ người dân qua Zalo Mini App
              </p>
            </div>
            <button
              onClick={fetchFeedbacks}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Làm mới hộp thư
            </button>
          </div>

          {loadingFeedbacks ? (
            <div className="p-8 text-center text-slate-400 text-sm">Đang tải góp ý &amp; phản ánh...</div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Chưa có ý kiến góp ý nào nộp từ Mini App.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">Mã Phiếu</th>
                    <th className="p-3 font-bold">Người Gửi</th>
                    <th className="p-3 font-bold">Phân Loại</th>
                    <th className="p-3 font-bold">Tiêu Đề &amp; Nội Dung</th>
                    <th className="p-3 font-bold">Trạng Thái</th>
                    <th className="p-3 font-bold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feedbacks.map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {fb.ticketCode}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{fb.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{fb.phone}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">{getCategoryBadge(fb.category)}</td>
                      <td className="p-3 max-w-md">
                        <div className="font-bold text-slate-800 mb-0.5">{fb.title}</div>
                        <div className="text-slate-600 line-clamp-2">{fb.content}</div>
                        {fb.replyContent && (
                          <div className="mt-1.5 p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px]">
                            <span className="font-bold">Đã phản hồi:</span> {fb.replyContent}
                          </div>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {fb.isResolved ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Đã phản hồi
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            Chờ phản hồi
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedFeedback(fb);
                            setReplyText(fb.replyContent || '');
                            setIsReplying(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                        >
                          {fb.isResolved ? 'Xem / Sửa phản hồi' : 'Soạn phản hồi'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Soạn Phản Hồi Chính Thức */}
      {isReplying && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Phản Hồi Ý Kiến Người Dân
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Mã phiếu: <strong className="text-blue-600">{selectedFeedback.ticketCode}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setSelectedFeedback(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Thông tin phiếu của người dân */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-800">{selectedFeedback.fullName} ({selectedFeedback.phone})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tiêu đề:</span>
                <span className="font-semibold text-slate-800">{selectedFeedback.title}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nội dung phản ánh:</span>
                <p className="text-slate-700 mt-0.5 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                  {selectedFeedback.content}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Văn bản phản hồi chính thức từ CAWACO *
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  placeholder="Nhập nội dung trả lời (Ví dụ: CAWACO xin ghi nhận ý kiến của Quý khách...)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setSelectedFeedback(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting || !replyText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {replySubmitting ? 'Đang gửi...' : 'Gửi Phản Hồi Cho Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
