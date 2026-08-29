import React, { useState } from 'react';

interface ComplaintItem {
  id: string;
  citizenName: string;
  phone: string;
  address: string;
  category: string;
  description: string;
  gpsCoords?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    {
      id: 'SC-2026-0891',
      citizenName: 'Nguyễn Văn An',
      phone: '0918 234 567',
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      category: 'Rò rỉ / Bể đường ống nước',
      description: 'Phát hiện nước sạch chảy tràn ra vỉa hè trước cửa nhà, áp lực nước trong nhà bị giảm rõ rệt.',
      gpsCoords: '9.17682, 105.15001',
      status: 'PENDING',
      createdAt: '29/08/2026 08:30',
    },
    {
      id: 'SC-2026-0887',
      citizenName: 'Lê Hoàng Nam',
      phone: '0945 112 334',
      address: 'Khóm 4, Phường 5, TP. Cà Mau',
      category: 'Nước đục / Cặn vàng',
      description: 'Nước xả ra có màu vàng nhạt và nhiều cặn lắng sau khi công ty cấp nước lại.',
      gpsCoords: '9.18210, 105.14820',
      status: 'IN_PROGRESS',
      createdAt: '28/08/2026 16:45',
    },
    {
      id: 'SC-2026-0879',
      citizenName: 'Trần Thị Huệ',
      phone: '0913 887 990',
      address: 'Đường Phan Ngọc Hiển, Phường 2, TP. Cà Mau',
      category: 'Hư hỏng / Kẹt chỉ số đồng hồ',
      description: 'Đồng hồ nước không quay dù vẫn đang mở van sử dụng sinh hoạt.',
      gpsCoords: '9.17950, 105.15340',
      status: 'RESOLVED',
      createdAt: '27/08/2026 10:15',
    },
  ]);

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  const updateStatus = (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    if (selectedComplaint?.id === id) {
      setSelectedComplaint((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filtered = complaints.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

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
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL'
                ? `Tất cả (${complaints.length})`
                : st === 'PENDING'
                ? `Chờ tiếp nhận (${complaints.filter((c) => c.status === 'PENDING').length})`
                : st === 'IN_PROGRESS'
                ? `Đang xử lý (${complaints.filter((c) => c.status === 'IN_PROGRESS').length})`
                : `Đã xử lý (${complaints.filter((c) => c.status === 'RESOLVED').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sach su co */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Danh Sách Phản Ánh Hiện Trường</h3>
            <span className="text-xs text-slate-400">Hiển thị {filtered.length} sự cố</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedComplaint(item)}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition ${
                  selectedComplaint?.id === item.id ? 'bg-blue-50/60' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-blue-900">{item.id}</span>
                    <span className="text-xs text-slate-400 ml-2">{item.createdAt}</span>
                    <div className="text-sm font-semibold text-slate-800 mt-1">{item.category}</div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      item.status === 'PENDING'
                        ? 'bg-rose-100 text-rose-700'
                        : item.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.status === 'PENDING'
                      ? 'Chờ tiếp nhận'
                      : item.status === 'IN_PROGRESS'
                      ? 'Đang xử lý'
                      : 'Đã hoàn thành'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mt-2 line-clamp-1">
                  Địa chỉ: {item.address}
                </div>

                <div className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
                  "{item.description}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chi tiet & Thao tac dieu phoi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit">
          <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100 mb-4">
            Chi Tiết Xử Lý & Điều Phối
          </h3>

          {selectedComplaint ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400">Mã phản ánh:</span>
                <div className="font-bold text-sm text-blue-900">{selectedComplaint.id}</div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Người phản ánh:</span>
                <div className="text-sm font-semibold text-slate-800">
                  {selectedComplaint.citizenName} ({selectedComplaint.phone})
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Địa chỉ hiện trường:</span>
                <div className="text-sm text-slate-700">{selectedComplaint.address}</div>
                {selectedComplaint.gpsCoords && (
                  <div className="text-xs text-teal-600 font-mono mt-1">
                    GPS: {selectedComplaint.gpsCoords}
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400">Mô tả sự cố:</span>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg mt-1 border border-slate-100">
                  {selectedComplaint.description}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Cập nhật trạng thái xử lý:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(selectedComplaint.id, 'IN_PROGRESS')}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Điều phối thợ
                  </button>
                  <button
                    onClick={() => updateStatus(selectedComplaint.id, 'RESOLVED')}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Đã khắc phục
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Vui lòng chọn một sự cố trong danh sách bên cạnh để xem chi tiết và điều phối kỹ thuật.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
