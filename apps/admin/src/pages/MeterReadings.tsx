import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { triggerSidebarCountRefresh } from '../hooks/useSidebarCounts';

export interface MeterReadingItem {
  id: string;
  customerCode: string;
  customerName?: string;
  phone?: string;
  address?: string;
  meterId: string;
  period: string;
  previousReading: number;
  currentReading: number;
  consumptionM3: number;
  photoUrl?: string | null;
  notes?: string | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

interface MeterStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalConsumption: number;
  periods: string[];
}

const REJECT_REASONS = [
  'Ảnh chụp mờ, không đọc rõ chữ số trên mặt đồng hồ',
  'Chỉ số nhập vào không khớp với số hiển thị trên ảnh đồng hồ',
  'Ảnh chụp không hiển thị số seri đồng hồ của danh bộ',
  'Chỉ số tiêu thụ tăng/giảm bất thường đột biến, cần kiểm tra thực địa',
  'Góc chụp bị che khuất hoặc cắt mất mặt số công tơ',
];

export const MeterReadings: React.FC = () => {
  const [readings, setReadings] = useState<MeterReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MeterStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalConsumption: 0,
    periods: [],
  });

  // Bộ lọc
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ANOMALY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Soi ảnh & Chi tiết
  const [inspectItem, setInspectItem] = useState<MeterReadingItem | null>(null);
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [imageZoom, setImageZoom] = useState<number>(1);

  // Modal Từ chối
  const [rejectingItem, setRejectingItem] = useState<MeterReadingItem | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Tải dữ liệu từ API
  const fetchReadings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPeriod && selectedPeriod !== 'ALL') {
        params.append('period', selectedPeriod);
      }
      if (selectedStatus && selectedStatus !== 'ALL' && selectedStatus !== 'ANOMALY') {
        params.append('status', selectedStatus);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/v1/meter-readings?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Lỗi tải dữ liệu (${res.status})`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReadings(json.data);
        if (json.stats && typeof json.stats.total === 'number') {
          setStats(json.stats);
        } else {
          // Fallback tinh toan truc tiep tu danh sach readings
          const all = json.data;
          const distinctPeriods = Array.from(new Set(all.map((r: any) => r.period))).sort().reverse() as string[];
          const pendingCount = all.filter((r: any) => r.status === 'PENDING_REVIEW').length;
          const approvedCount = all.filter((r: any) => r.status === 'APPROVED').length;
          const rejectedCount = all.filter((r: any) => r.status === 'REJECTED').length;
          const totalConsumption = all
            .filter((r: any) => r.status === 'APPROVED')
            .reduce((sum: number, r: any) => sum + (Number(r.consumptionM3) || 0), 0);

          setStats({
            total: all.length,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            totalConsumption,
            periods: distinctPeriods,
          });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh sách chỉ số nước.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [selectedPeriod, selectedStatus]);

  // Tìm kiếm debounce hoặc nhấn enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReadings();
  };

  // Lọc phía client nếu chọn tab 'ANOMALY' (tiêu thụ = 0, tiêu thụ > 50m3, hoặc không có ảnh)
  const filteredReadings = useMemo(() => {
    if (selectedStatus === 'ANOMALY') {
      return readings.filter(
        (r) => r.consumptionM3 === 0 || r.consumptionM3 >= 50 || !r.photoUrl
      );
    }
    return readings;
  }, [readings, selectedStatus]);

  // Phê duyệt chỉ số
  const handleApprove = async (item: MeterReadingItem) => {
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/meter-readings/${item.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Đã phê duyệt chỉ số kỳ ${item.period} cho danh bộ ${item.customerCode}!`);
        setReadings((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, status: 'APPROVED' } : r))
        );
        if (inspectItem?.id === item.id) {
          setInspectItem((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
        }
        triggerSidebarCountRefresh();
      } else {
        toast.error(json?.error?.message || 'Không thể phê duyệt.');
      }
    } catch {
      toast.error('Lỗi kết nối khi phê duyệt chỉ số.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Mở modal từ chối
  const openRejectModal = (item: MeterReadingItem) => {
    setRejectingItem(item);
    setSelectedReason(REJECT_REASONS[0]);
    setCustomReason('');
  };

  // Xác nhận từ chối
  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const finalReason = customReason.trim()
      ? `${selectedReason}. Ghi chú thêm: ${customReason.trim()}`
      : selectedReason;

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/meter-readings/${rejectingItem.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          notes: finalReason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Đã từ chối chỉ số phiếu ${rejectingItem.id.slice(0, 8).toUpperCase()}.`);
        setReadings((prev) =>
          prev.map((r) =>
            r.id === rejectingItem.id ? { ...r, status: 'REJECTED', notes: finalReason } : r
          )
        );
        if (inspectItem?.id === rejectingItem.id) {
          setInspectItem((prev) =>
            prev ? { ...prev, status: 'REJECTED', notes: finalReason } : null
          );
        }
        setRejectingItem(null);
        triggerSidebarCountRefresh();
      } else {
        toast.error(json?.error?.message || 'Không thể từ chối chỉ số.');
      }
    } catch {
      toast.error('Lỗi kết nối khi từ chối chỉ số.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Mở modal soi ảnh
  const openInspectModal = (item: MeterReadingItem) => {
    setInspectItem(item);
    setImageRotation(0);
    setImageZoom(1);
  };

  // Tạm tính tiền nước theo QĐ 13/2023 Cà Mau
  const calculateEstimatedBill = (consumption: number) => {
    if (!consumption || consumption <= 0) return 0;
    let total = 0;
    let m3 = consumption;
    const b1 = Math.min(m3, 10);
    total += b1 * 7500;
    m3 -= b1;

    if (m3 > 0) {
      const b2 = Math.min(m3, 10);
      total += b2 * 8900;
      m3 -= b2;
    }
    if (m3 > 0) {
      const b3 = Math.min(m3, 10);
      total += b3 * 10200;
      m3 -= b3;
    }
    if (m3 > 0) {
      total += m3 * 12500;
    }
    return Math.round(total * 1.15);
  };

  // Xuất CSV báo cáo
  const handleExportCSV = () => {
    if (filteredReadings.length === 0) {
      toast.error('Không có dữ liệu để xuất báo cáo.');
      return;
    }

    const headers = [
      'Mã phiếu',
      'Mã danh bộ',
      'Tên khách hàng',
      'Số điện thoại',
      'Địa chỉ',
      'Mã đồng hồ',
      'Kỳ nước',
      'Chỉ số cũ (m3)',
      'Chỉ số mới (m3)',
      'Tiêu thụ (m3)',
      'Trạng thái',
      'Thời gian gửi',
      'Ghi chú',
    ];

    const rows = filteredReadings.map((r) => [
      `"${r.id}"`,
      `"${r.customerCode}"`,
      `"${r.customerName || ''}"`,
      `"${r.phone || ''}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      `"${r.meterId}"`,
      `"${r.period}"`,
      r.previousReading,
      r.currentReading,
      r.consumptionM3,
      r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Từ chối' : 'Chờ đối soát',
      `"${new Date(r.submittedAt).toLocaleString('vi-VN')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CAWACO_ChiSoNuoc_${selectedPeriod || 'TatCa'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file báo cáo chỉ số thành công!');
  };

  const getStatusBadge = (status: MeterReadingItem['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ đối soát
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300">
            <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Từ chối
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick KPI Cards */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">
                  Tiếp Nhận &amp; Phê Duyệt Chỉ Số Đồng Hồ Nước
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đối soát chỉ số đồng hồ khách hàng tự chụp và gửi định kỳ qua Zalo Mini App CAWACO
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Xuất Báo Cáo CSV</span>
            </button>
            <button
              onClick={fetchReadings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 pt-5">
          {/* Total */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tổng lượt gửi</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800">{stats.total}</span>
              <span className="text-xs text-slate-400 font-medium">phiếu</span>
            </div>
          </div>

          {/* Pending */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Chờ đối soát</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-900">{stats.pending}</span>
              <span className="text-xs text-amber-700 font-medium">chờ duyệt</span>
            </div>
          </div>

          {/* Approved */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Đã phê duyệt</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-900">{stats.approved}</span>
              <span className="text-xs text-emerald-700 font-medium">hợp lệ</span>
            </div>
          </div>

          {/* Rejected */}
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
            <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Từ chối</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-900">{stats.rejected}</span>
              <span className="text-xs text-rose-700 font-medium">lỗi/bất thường</span>
            </div>
          </div>

          {/* Total Consumption */}
          <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 col-span-2 md:col-span-1">
            <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">Sản lượng đã duyệt</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-sky-950">{stats.totalConsumption.toLocaleString('vi-VN')}</span>
              <span className="text-xs text-sky-700 font-medium">m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedStatus === 'ALL'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setSelectedStatus('PENDING_REVIEW')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === 'PENDING_REVIEW'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Chờ duyệt</span>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedStatus('APPROVED')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedStatus === 'APPROVED'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã duyệt ({stats.approved})
            </button>
            <button
              onClick={() => setSelectedStatus('REJECTED')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedStatus === 'REJECTED'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Từ chối ({stats.rejected})
            </button>
            <button
              onClick={() => setSelectedStatus('ANOMALY')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                selectedStatus === 'ANOMALY'
                  ? 'bg-white text-purple-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Bất thường / Cảnh báo</span>
            </button>
          </div>

          {/* Period Dropdown & Search Form */}
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="whitespace-nowrap font-medium">Kỳ ghi:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả các kỳ</option>
                {stats.periods.map((p) => (
                  <option key={p} value={p}>
                    Kỳ {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Tìm danh bộ, tên KH, địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <svg className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Đang tải dữ liệu chỉ số nước từ hệ thống...
          </div>
        ) : filteredReadings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="font-semibold text-slate-600 text-sm">Không tìm thấy bản ghi chỉ số nước nào</div>
            <p className="text-slate-400 max-w-sm mx-auto">
              Không có chỉ số nước phù hợp với bộ lọc hiện tại. Thử chọn kỳ nước khác hoặc làm mới danh sách.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Mã phiếu &amp; Thời gian</th>
                  <th className="py-3 px-4">Khách hàng &amp; Danh bộ</th>
                  <th className="py-3 px-4">Đồng hồ &amp; Kỳ</th>
                  <th className="py-3 px-4 text-right">Chỉ số cũ</th>
                  <th className="py-3 px-4 text-right">Chỉ số mới</th>
                  <th className="py-3 px-4 text-right">Tiêu thụ (m³)</th>
                  <th className="py-3 px-4 text-center">Ảnh công tơ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredReadings.map((item) => {
                  const isZero = item.consumptionM3 === 0;
                  const isHigh = item.consumptionM3 >= 50;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                      {/* 1. Ticket ID & Time */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-blue-600 text-xs">
                          #{item.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                          {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* 2. Customer details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {item.customerCode}
                          </span>
                          <span className="font-bold text-slate-800 truncate max-w-[140px]">
                            {item.customerName || 'Chưa cập nhật tên'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-[220px]" title={item.address || ''}>
                          {item.address || 'Địa chỉ đang cập nhật'}
                        </div>
                      </td>

                      {/* 3. Meter & Period */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 font-mono text-[11px]">
                          {item.meterId}
                        </div>
                        <div className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold mt-0.5">
                          Kỳ {item.period}
                        </div>
                      </td>

                      {/* 4. Previous reading */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {item.previousReading.toLocaleString('vi-VN')}
                      </td>

                      {/* 5. Current reading */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {item.currentReading.toLocaleString('vi-VN')}
                      </td>

                      {/* 6. Consumption with anomaly badges */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-extrabold text-sm text-slate-900">
                          {item.consumptionM3.toLocaleString('vi-VN')}
                        </div>
                        {isZero && (
                          <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5" title="Đồng hồ không ghi nhận tiêu thụ">
                            Đứng kim
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded mt-0.5" title="Tiêu thụ trên 50 m3 trong kỳ">
                            Đột biến
                          </span>
                        )}
                      </td>

                      {/* 7. Photo Thumbnail */}
                      <td className="py-3.5 px-4 text-center">
                        {item.photoUrl ? (
                          <button
                            onClick={() => openInspectModal(item)}
                            className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 transition group/img shadow-2xs inline-block cursor-pointer"
                            title="Nhấn để phóng to và đối soát ảnh công tơ"
                          >
                            <img
                              src={item.photoUrl}
                              alt={`Ảnh đồng hồ ${item.customerCode}`}
                              className="w-full h-full object-cover group-hover/img:scale-110 transition duration-150"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              </svg>
                            </div>
                          </button>
                        ) : (
                          <span className="inline-block px-1.5 py-1 text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">
                            Không có ảnh
                          </span>
                        )}
                      </td>

                      {/* 8. Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                        {item.notes && (
                          <div className="text-[10.5px] text-slate-500 line-clamp-1 max-w-[160px] mt-1" title={item.notes}>
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* 9. Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === 'PENDING_REVIEW' ? (
                            <>
                              <button
                                onClick={() => handleApprove(item)}
                                disabled={submittingAction}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 transition shadow-2xs cursor-pointer"
                                title="Phê duyệt chỉ số hợp lệ"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => openRejectModal(item)}
                                disabled={submittingAction}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-300 transition shadow-2xs cursor-pointer"
                                title="Từ chối chỉ số không hợp lệ"
                              >
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openInspectModal(item)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                            >
                              Chi tiết
                            </button>
                          )}
                          <button
                            onClick={() => openInspectModal(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Xem chi tiết và đối soát ảnh"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL SOI ẢNH ĐỒNG HỒ & ĐỐI SOÁT CHI TIẾT */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  #{inspectItem.id.slice(0, 8).toUpperCase()}
                </span>
                <h3 className="font-bold text-slate-800 text-base">
                  Đối Soát Chỉ Số — Danh Bộ {inspectItem.customerCode} (Kỳ {inspectItem.period})
                </h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image Viewer with Zoom & Rotate */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Ảnh chụp công tơ nước</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 cursor-pointer"
                      title="Xoay ảnh 90 độ"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Xoay 90°
                    </button>
                    <button
                      onClick={() => setImageZoom((prev) => Math.min(prev + 0.25, 2.5))}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      title="Phóng to ảnh"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setImageZoom((prev) => Math.max(prev - 0.25, 0.75))}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      title="Thu nhỏ ảnh"
                    >
                      -
                    </button>
                    <button
                      onClick={() => {
                        setImageRotation(0);
                        setImageZoom(1);
                      }}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] cursor-pointer"
                    >
                      Đặt lại
                    </button>
                  </div>
                </div>

                {/* Image Canvas Box */}
                <div className="w-full h-80 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center relative border border-slate-300">
                  {inspectItem.photoUrl ? (
                    <img
                      src={inspectItem.photoUrl}
                      alt="Ảnh đồng hồ"
                      style={{
                        transform: `rotate(${imageRotation}deg) scale(${imageZoom})`,
                        transition: 'transform 0.2s ease-in-out',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-500 text-xs">
                      <svg className="w-10 h-10 mx-auto mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Khách hàng không đính kèm ảnh khi báo chỉ số
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 italic text-center">
                  * Hướng dẫn: Kiểm tra các chữ số màu đen trên mặt đồng hồ và số seri dập nổi xem có trùng khớp với dữ liệu bên dưới không.
                </p>
              </div>

              {/* Right Column: Customer & Calculation Details */}
              <div className="space-y-4">
                {/* Customer Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Thông tin khách hàng &amp; danh bộ
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400">Mã danh bộ:</span>
                      <div className="font-bold font-mono text-slate-800">{inspectItem.customerCode}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Số seri đồng hồ:</span>
                      <div className="font-bold font-mono text-slate-800">{inspectItem.meterId}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Họ và tên:</span>
                      <div className="font-bold text-slate-800">{inspectItem.customerName || 'Đang cập nhật'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Số điện thoại:</span>
                      <div className="font-semibold text-slate-800">{inspectItem.phone || 'Chưa đăng ký'}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Địa chỉ:</span>
                    <div className="text-slate-700 font-medium">{inspectItem.address || 'Đang cập nhật'}</div>
                  </div>
                </div>

                {/* Meter Comparison Box */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2.5">
                  <div className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span>So sánh chỉ số &amp; Tiêu thụ</span>
                    <span className="px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 font-mono font-bold">
                      Kỳ {inspectItem.period}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-lg border border-blue-100">
                    <div>
                      <div className="text-slate-400 text-[11px]">Chỉ số cũ</div>
                      <div className="text-base font-extrabold font-mono text-slate-600">
                        {inspectItem.previousReading} <span className="text-xs font-normal">m³</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-semibold text-[11px]">Chỉ số mới</div>
                      <div className="text-base font-extrabold font-mono text-blue-700">
                        {inspectItem.currentReading} <span className="text-xs font-normal">m³</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold text-[11px]">Tiêu thụ</div>
                      <div className="text-base font-extrabold font-mono text-emerald-700">
                        +{inspectItem.consumptionM3} <span className="text-xs font-normal">m³</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Bill */}
                  <div className="flex items-center justify-between pt-1 border-t border-blue-100 text-xs">
                    <span className="text-slate-600">Tiền nước sinh hoạt tạm tính (VAT + BVMT):</span>
                    <span className="font-bold text-blue-950 text-sm">
                      {calculateEstimatedBill(inspectItem.consumptionM3).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Notes if any */}
                {inspectItem.notes && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">Ghi chú:</span> {inspectItem.notes}
                  </div>
                )}

                {/* Action Buttons in Inspect Modal */}
                <div className="pt-2 flex items-center gap-3">
                  {inspectItem.status === 'PENDING_REVIEW' ? (
                    <>
                      <button
                        onClick={() => handleApprove(inspectItem)}
                        disabled={submittingAction}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Phê Duyệt Chỉ Số
                      </button>
                      <button
                        onClick={() => openRejectModal(inspectItem)}
                        disabled={submittingAction}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Từ Chối Chỉ Số
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs">
                      <span className="text-slate-500">Trạng thái hiện tại:</span>
                      {getStatusBadge(inspectItem.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TỪ CHỐI CHỈ SỐ */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  !
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Từ Chối Chỉ Số Danh Bộ {rejectingItem.customerCode}
                </h3>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="w-7 h-7 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Vui lòng chọn hoặc nhập lý do từ chối để hệ thống lưu vết và phản hồi thông tin cho khách hàng:
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Lý do mẫu thường gặp:
              </label>
              {REJECT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-xs cursor-pointer border transition ${
                    selectedReason === r
                      ? 'bg-rose-50/70 border-rose-300 text-rose-900 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="reject_reason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Ghi chú bổ sung (tuỳ chọn):
              </label>
              <textarea
                rows={2}
                placeholder="Nhập thêm chi tiết nếu cần..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={submittingAction}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer"
              >
                {submittingAction ? 'Đang lưu...' : 'Xác Nhận Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
