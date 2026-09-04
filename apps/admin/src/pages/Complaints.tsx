import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { triggerSidebarCountRefresh } from '../hooks/useSidebarCounts';

interface ComplaintItem {
  id: string;
  citizenName?: string;
  phone?: string;
  address: string;
  category: string;
  description: string;
  latitude?: number;
  longitude?: number;
  gpsCoords?: string;
  imageUrls?: string[];
  photos?: string[];
  images?: string[];
  status: 'SUBMITTED' | 'RECEIVED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'PENDING';
  createdAt: string;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  dispatchedAt?: string;
  dispatchNote?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

interface StaffMember {
  id: string;
  fullName: string;
  phone?: string;
  role: string;
  employeeCode?: string;
}

const DEFAULT_FIELD_WORKERS: StaffMember[] = [
  { id: 'st-01', fullName: 'Trần Văn Hùng', phone: '0918 345 678', role: 'FIELD_WORKER', employeeCode: 'KT-01' },
  { id: 'st-02', fullName: 'Lê Văn Minh', phone: '0919 456 789', role: 'FIELD_WORKER', employeeCode: 'KT-02' },
  { id: 'st-03', fullName: 'Nguyễn Thành Đạt', phone: '0918 776 554', role: 'FIELD_WORKER', employeeCode: 'KT-03' },
  { id: 'st-04', fullName: 'Phạm Quốc Tuấn', phone: '0945 223 344', role: 'FIELD_WORKER', employeeCode: 'KT-04' },
];

const CATEGORY_NAMES: Record<string, string> = {
  PIPE_BURST_LEAK: 'Rò rỉ / Bể đường ống nước',
  TURBID_DIRTY_WATER: 'Nước đục / Cặn vàng / Mùi lạ',
  LOW_WATER_PRESSURE: 'Áp lực nước yếu / Mất nước',
  METER_DEFECT: 'Hư hỏng / Kẹt chỉ số đồng hồ',
  OTHER: 'Sự cố & Ý kiến khác',
};

const FALLBACK_LEAK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23F1F5F9'/%3E%3Ccircle cx='100' cy='85' r='35' fill='%230369A1' opacity='0.15'/%3E%3Cpath d='M100 55 C90 75 80 90 80 102 C80 114 89 122 100 122 C111 122 120 114 120 102 C120 90 110 75 100 55 Z' fill='%230369A1'/%3E%3Ctext x='100' y='155' font-family='sans-serif' font-size='13' font-weight='bold' fill='%23475569' text-anchor='middle'%3E%E1%BA%A2nh hi%E1%BB%87n tr%C6%B0%E1%BB%9Dng%3C/text%3E%3C/svg%3E";

export const Complaints: React.FC = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Danh sach tho sua chua
  const [fieldWorkers, setFieldWorkers] = useState<StaffMember[]>(DEFAULT_FIELD_WORKERS);

  // Modal Dieu phoi tho
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(DEFAULT_FIELD_WORKERS[0].id);
  const [dispatchNote, setDispatchNote] = useState('Đã xuất phát kiểm tra và xử lý sự cố hiện trường.');
  const [submittingDispatch, setSubmittingDispatch] = useState(false);

  // Modal Da khac phuc
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('Đã khắc phục hoàn tất sự cố, kiểm tra áp lực nước đạt tiêu chuẩn.');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/v1/complaints', {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
        },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setComplaints(json.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/v1/admin/staff', {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
        },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const workers = json.data.filter((s: any) => s.role === 'FIELD_WORKER' || s.role === 'SUPER_ADMIN' || !s.role);
        if (workers.length > 0) {
          setFieldWorkers(workers);
          setSelectedWorkerId(workers[0].id);
        }
      }
    } catch {
      // Keep default
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchWorkers();
    const timer = setInterval(fetchComplaints, 4000);
    return () => clearInterval(timer);
  }, [token]);

  const handleConfirmDispatch = async () => {
    if (!selectedComplaint) return;
    setSubmittingDispatch(true);

    const worker = fieldWorkers.find((w) => w.id === selectedWorkerId) || fieldWorkers[0];
    const workerLabel = `${worker.fullName} (${worker.employeeCode || 'Tổ cơ động'})`;

    try {
      const res = await fetch(`/api/v1/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
        },
        body: JSON.stringify({
          status: 'DISPATCHED',
          assignedWorkerName: workerLabel,
          assignedWorkerPhone: worker.phone || '0918 345 678',
          dispatchNote: dispatchNote.trim() || 'Đã phân công thợ xuống hiện trường.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Đã điều phối thợ ${worker.fullName} phụ trách sự cố.`);
        setIsDispatchModalOpen(false);
        fetchComplaints();
        triggerSidebarCountRefresh();
      } else {
        toast.error('Điều phối thất bại. Vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi kết nối khi điều phối.');
    } finally {
      setSubmittingDispatch(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!selectedComplaint) return;
    setSubmittingResolve(true);

    try {
      const res = await fetch(`/api/v1/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
        },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolutionNote: resolutionNote.trim() || 'Đã khắc phục hoàn tất sự cố.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Đã xác nhận sự cố khắc phục hoàn tất.');
        setIsResolveModalOpen(false);
        fetchComplaints();
        triggerSidebarCountRefresh();
      } else {
        toast.error('Cập nhật thất bại. Vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi kết nối khi cập nhật.');
    } finally {
      setSubmittingResolve(false);
    }
  };

  const handleRejectComplaint = async () => {
    if (!selectedComplaint) return;
    if (!window.confirm('Bạn có chắc chắn muốn từ chối / đánh dấu tin báo sai cho sự cố này?')) return;

    try {
      const res = await fetch(`/api/v1/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('aquaflow_admin_token')}`,
        },
        body: JSON.stringify({
          status: 'REJECTED',
          resolutionNote: 'Thông tin phản ánh không chính xác sau khi xác minh.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.info('Đã từ chối phản ánh sự cố.');
        fetchComplaints();
        triggerSidebarCountRefresh();
      }
    } catch {
      toast.error('Lỗi kết nối.');
    }
  };

  const isPending = (status: string) => status === 'SUBMITTED' || status === 'PENDING' || status === 'RECEIVED';
  const isInProgress = (status: string) => status === 'IN_PROGRESS' || status === 'DISPATCHED';
  const isResolved = (status: string) => status === 'RESOLVED';
  const isRejected = (status: string) => status === 'REJECTED';

  const filtered = complaints.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return isPending(c.status);
    if (filter === 'IN_PROGRESS') return isInProgress(c.status);
    if (filter === 'RESOLVED') return isResolved(c.status);
    return true;
  });

  const selectedComplaint =
    complaints.find((c) => c.id === selectedId) ||
    filtered[0] ||
    complaints[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Trung Tâm Điều Phối Sự Cố Mạng Lưới Cấp Nước
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tiếp nhận phản ánh hiện trường từ người dân qua Zalo Mini App và định vị GPS
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL'
                ? `Tất cả (${complaints.length})`
                : st === 'PENDING'
                ? `Chờ tiếp nhận (${complaints.filter((c) => isPending(c.status)).length})`
                : st === 'IN_PROGRESS'
                ? `Đang xử lý (${complaints.filter((c) => isInProgress(c.status)).length})`
                : `Đã xử lý (${complaints.filter((c) => isResolved(c.status)).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sach su co & Chi tiet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Danh sách phản ánh */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Danh Sách Phản Ánh Hiện Trường</h3>
            <span className="text-xs text-slate-400">
              {loading ? 'Đang tải...' : `Hiển thị ${filtered.length} sự cố`}
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Không có sự cố nào trong danh mục này.
              </div>
            ) : (
              filtered.map((item) => {
                const categoryLabel = CATEGORY_NAMES[item.category] || item.category;
                const images = item.imageUrls || item.photos || item.images || [];
                const isSelected = selectedComplaint?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs text-blue-900 font-mono">{item.id}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </span>
                        <div className="text-sm font-bold text-slate-800 mt-1">{categoryLabel}</div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isPending(item.status)
                            ? 'bg-rose-100 text-rose-700'
                            : isInProgress(item.status)
                            ? 'bg-amber-100 text-amber-800'
                            : isRejected(item.status)
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isPending(item.status)
                          ? 'Chờ tiếp nhận'
                          : isInProgress(item.status)
                          ? 'Đang xử lý'
                          : isRejected(item.status)
                          ? 'Đã từ chối'
                          : 'Đã hoàn thành'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-2 line-clamp-1">
                      Địa chỉ: {item.address}
                    </div>

                    <div className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
                      "{item.description}"
                    </div>

                    {/* Image thumbnails preview */}
                    {images.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[11px] text-slate-400 font-medium">Hình ảnh ({images.length}):</span>
                        <div className="flex gap-1.5 overflow-x-auto">
                          {images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Hiện trường"
                              onError={(e) => { e.currentTarget.src = FALLBACK_LEAK_IMG; }}
                              className="w-9 h-9 rounded object-cover border border-slate-200 hover:scale-105 transition"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cột phải: Chi tiết & Thao tác điều phối theo đúng nghiệp vụ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit sticky top-6">
          <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100 mb-4 flex justify-between items-center">
            <span>Chi Tiết Xử Lý &amp; Điều Phối</span>
            {selectedComplaint && (
              <span className="text-[11px] font-mono text-blue-700 font-bold">{selectedComplaint.id}</span>
            )}
          </h3>

          {selectedComplaint ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Loại sự cố:</span>
                <div className="font-bold text-sm text-slate-800">
                  {CATEGORY_NAMES[selectedComplaint.category] || selectedComplaint.category}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Người phản ánh:</span>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedComplaint.citizenName || 'Nguyễn Văn An'} ({selectedComplaint.phone || '0918 234 567'})
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Địa chỉ hiện trường:</span>
                <div className="text-sm text-slate-700">{selectedComplaint.address}</div>
                {(selectedComplaint.latitude || selectedComplaint.gpsCoords) && (
                  <div className="text-xs text-teal-700 font-mono mt-1 flex items-center gap-1 font-semibold">
                    <span>GPS:</span>
                    <span>
                      {selectedComplaint.latitude
                        ? `${selectedComplaint.latitude.toFixed(5)}, ${(selectedComplaint.longitude || 105.15).toFixed(5)}`
                        : selectedComplaint.gpsCoords}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Mô tả chi tiết:</span>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Hình ảnh hiện trường */}
              <div>
                {(() => {
                  const imgs = selectedComplaint.imageUrls || selectedComplaint.photos || selectedComplaint.images || [];
                  return (
                    <>
                      <span className="text-xs text-slate-400 font-semibold block mb-2">
                        Hình ảnh hiện trường ({imgs.length} ảnh):
                      </span>

                      {imgs.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {imgs.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => setPreviewImage(img)}
                              className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                            >
                              <img
                                src={img}
                                alt={`Hiện trường ${i + 1}`}
                                onError={(e) => { e.currentTarget.src = FALLBACK_LEAK_IMG; }}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-semibold">
                                Xem to
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          Người dân không đính kèm hình ảnh.
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* =========================================================================
               * KHU VỰC THÔNG TIN ĐIỀU PHỐI & NÚT HÀNH ĐỘNG THEO TỪNG TRẠNG THÁI NGHIỆP VỤ
               * ========================================================================= */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                {/* TRẠNG THÁI 1: CHỜ TIẾP NHẬN (PENDING / SUBMITTED) */}
                {isPending(selectedComplaint.status) && (
                  <div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 mb-3">
                      Sự cố mới gửi về đang chờ phân công kỹ thuật viên hiện trường.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsDispatchModalOpen(true)}
                        className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>Phân công &amp; Điều phối thợ</span>
                        <span>&rarr;</span>
                      </button>
                      <button
                        onClick={handleRejectComplaint}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 transition"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                )}

                {/* TRẠNG THÁI 2: ĐANG XỬ LÝ (DISPATCHED / IN_PROGRESS) */}
                {isInProgress(selectedComplaint.status) && (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Thợ đang phụ trách:</span>
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-semibold">Đang xử lý</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {selectedComplaint.assignedWorkerName || 'Đội cơ động mạng lưới'}
                      </div>
                      {selectedComplaint.assignedWorkerPhone && (
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          <span>SĐT liên hệ:</span>
                          <strong className="text-blue-700 font-mono">{selectedComplaint.assignedWorkerPhone}</strong>
                        </div>
                      )}
                      {selectedComplaint.dispatchNote && (
                        <div className="text-[11px] text-amber-900 italic pt-1 border-t border-amber-200/60">
                          "{selectedComplaint.dispatchNote}"
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsResolveModalOpen(true)}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                      >
                        Xác nhận Đã khắc phục
                      </button>
                      <button
                        onClick={() => setIsDispatchModalOpen(true)}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
                        title="Đổi thợ điều phối khác"
                      >
                        Đổi thợ
                      </button>
                    </div>
                  </div>
                )}

                {/* TRẠNG THÁI 3: ĐÃ XỬ LÝ HOÀN TẤT (RESOLVED) */}
                {isResolved(selectedComplaint.status) && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <span>Sự cố đã khắc phục thành công</span>
                    </div>
                    {selectedComplaint.assignedWorkerName && (
                      <div className="text-xs text-slate-700">
                        <span>Thợ thực hiện: </span>
                        <strong>{selectedComplaint.assignedWorkerName}</strong>
                      </div>
                    )}
                    {selectedComplaint.resolvedAt && (
                      <div className="text-[11px] text-slate-500">
                        Hoàn thành lúc: {new Date(selectedComplaint.resolvedAt).toLocaleString('vi-VN')}
                      </div>
                    )}
                    {selectedComplaint.resolutionNote && (
                      <div className="text-xs text-slate-700 bg-white/80 p-2 rounded border border-emerald-100 leading-relaxed">
                        <strong>Kết quả xử lý:</strong> {selectedComplaint.resolutionNote}
                      </div>
                    )}
                  </div>
                )}

                {/* TRẠNG THÁI 4: ĐÃ TỪ CHỐI (REJECTED) */}
                {isRejected(selectedComplaint.status) && (
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600">
                    Phản ánh này đã bị từ chối hoặc xác nhận là tin báo sai.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Vui lòng chọn một sự cố trong danh sách bên cạnh để xem chi tiết và điều phối kỹ thuật.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
       * MODAL 1: PHÂN CÔNG & ĐIỀU PHỐI THỢ HIỆN TRƯỜNG
       * ========================================================= */}
      {isDispatchModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Phân Công &amp; Điều Phối Thợ</h3>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5">
              <div><strong>Mã sự cố:</strong> {selectedComplaint.id}</div>
              <div><strong>Địa chỉ:</strong> {selectedComplaint.address}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Chọn thợ / Kỹ thuật viên phụ trách *</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                {fieldWorkers.map((w) => (
                  <label
                    key={w.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                      selectedWorkerId === w.id ? 'bg-blue-50 border border-blue-300 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="workerRadio"
                        value={w.id}
                        checked={selectedWorkerId === w.id}
                        onChange={() => setSelectedWorkerId(w.id)}
                        className="text-blue-600"
                      />
                      <span>{w.fullName} ({w.employeeCode || 'Tổ cơ động'})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{w.phone}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Ghi chú điều phối / Yêu cầu xử lý</label>
              <textarea
                value={dispatchNote}
                onChange={(e) => setDispatchNote(e.target.value)}
                rows={2}
                placeholder="VD: Kiểm tra mối nối D100, mang theo van khóa dự phòng..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={submittingDispatch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                {submittingDispatch ? 'Đang điều phối...' : 'Xác Nhận Điều Phối Thợ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
       * MODAL 2: XÁC NHẬN ĐÃ KHẮC PHỤC SỰ CỐ
       * ========================================================= */}
      {isResolveModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Xác Nhận Khắc Phục Hoàn Tất</h3>
              <button onClick={() => setIsResolveModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5">
              <div><strong>Mã sự cố:</strong> {selectedComplaint.id}</div>
              <div><strong>Thợ phụ trách:</strong> {selectedComplaint.assignedWorkerName || 'Tổ cơ động'}</div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Kết quả khắc phục &amp; Nội dung nghiệm thu *</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                placeholder="VD: Đã hàn vá ống vỡ, súc xả đường ống, người dân đã ký xác nhận biên bản nghiệm thu."
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={submittingResolve}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                {submittingResolve ? 'Đang hoàn tất...' : 'Hoàn Tất & Đóng Sự Cố'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
              <span className="text-xs font-bold">Hình ảnh chi tiết hiện trường</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕ Đóng
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[80vh]">
              <img
                src={previewImage}
                alt="Hiện trường phóng to"
                onError={(e) => { e.currentTarget.src = FALLBACK_LEAK_IMG; }}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
