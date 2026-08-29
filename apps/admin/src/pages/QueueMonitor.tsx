import React, { useState, useEffect } from 'react';

interface CounterState {
  counterNumber: number;
  currentTicket: string | null;
  serviceName: string;
  status: 'SERVING' | 'IDLE';
}

export const QueueMonitor: React.FC = () => {
  const [counters, setCounters] = useState<CounterState[]>([
    { counterNumber: 1, currentTicket: 'A-101', serviceName: 'Đăng ký lắp mới', status: 'SERVING' },
    { counterNumber: 2, currentTicket: 'D-204', serviceName: 'Thu ngân & Nộp tiền nước', status: 'SERVING' },
    { counterNumber: 3, currentTicket: 'B-108', serviceName: 'Sang tên / Chuyển hợp đồng', status: 'SERVING' },
    { counterNumber: 4, currentTicket: null, serviceName: 'Kiểm định & Khiếu nại', status: 'IDLE' },
  ]);

  const [waitingList, setWaitingList] = useState([
    { ticketNumber: 'A-102', customerCode: 'CM102938', service: 'Đăng ký lắp mới', waitMinutes: 8, time: '09:15' },
    { ticketNumber: 'D-205', customerCode: 'CM204819', service: 'Thu ngân & Nộp tiền nước', waitMinutes: 6, time: '09:17' },
    { ticketNumber: 'C-301', customerCode: 'CM301294', service: 'Kiểm định & Khiếu nại', waitMinutes: 3, time: '09:20' },
    { ticketNumber: 'A-103', customerCode: 'CM449102', service: 'Đăng ký lắp mới', waitMinutes: 1, time: '09:22' },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleCallNext = (counterNum: number) => {
    if (waitingList.length === 0) {
      setNotification('Hiện không có khách hàng nào đang đợi trong hàng.');
      return;
    }

    const nextTicket = waitingList[0];
    const newWaiting = waitingList.slice(1);
    setWaitingList(newWaiting);

    setCounters((prev) =>
      prev.map((c) =>
        c.counterNumber === counterNum
          ? { ...c, currentTicket: nextTicket.ticketNumber, status: 'SERVING' }
          : c
      )
    );

    setNotification(`Quầy số 0${counterNum} đang gọi số: ${nextTicket.ticketNumber}`);
  };

  const handleComplete = (counterNum: number) => {
    setCounters((prev) =>
      prev.map((c) =>
        c.counterNumber === counterNum
          ? { ...c, currentTicket: null, status: 'IDLE' }
          : c
      )
    );
    setNotification(`Quầy số 0${counterNum} đã hoàn thành phục vụ khách hàng.`);
  };

  return (
    <div className="space-y-6">
      {/* Header thong tin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Hệ Thống Gọi Số Quầy Giao Dịch Trực Tiếp
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Trụ sở chính Công ty CP Cấp Nước Cà Mau — Số 204, đường Quang Trung, Phường Tân Thành, TP. Cà Mau
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Đang hoạt động (Trực tuyến)
          </span>
          <span className="text-xs text-slate-400">Cập nhật: {new Date().toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-sm flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-semibold text-blue-700 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* 4 Quầy Giao Dịch */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {counters.map((c) => (
          <div
            key={c.counterNumber}
            className={`p-5 rounded-xl border transition-all ${
              c.status === 'SERVING'
                ? 'bg-white border-blue-300 shadow-sm ring-1 ring-blue-100'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quầy số 0{c.counterNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  c.status === 'SERVING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {c.status === 'SERVING' ? 'Đang phục vụ' : 'Chờ khách'}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium h-8 line-clamp-2">{c.serviceName}</div>

            <div className="my-4 py-3 bg-slate-100 rounded-lg text-center">
              <div className="text-xs text-slate-400 uppercase font-semibold">Số thứ tự</div>
              <div className="text-3xl font-extrabold text-blue-900 tracking-wider">
                {c.currentTicket || '---'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCallNext(c.counterNumber)}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Gọi tiếp
              </button>
              {c.status === 'SERVING' && (
                <button
                  onClick={() => handleComplete(c.counterNumber)}
                  className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Xong
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Thong ke nhanh & Danh sach cho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase">Khách đang đợi trong hàng</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{waitingList.length} người</div>
            <div className="text-xs text-emerald-600 mt-1">Thời gian chờ TB: ~7 phút</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase">Đã phục vụ trong ngày</div>
            <div className="text-3xl font-bold text-blue-800 mt-2">142 lượt</div>
            <div className="text-xs text-slate-500 mt-1">Tỷ lệ hài lòng: 98.6%</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase">Trực ban quản lý quầy</div>
            <div className="text-sm font-semibold text-slate-800 mt-2">Trần Văn B (Mã NV: CW-889)</div>
            <div className="text-xs text-slate-500 mt-1">Ca trực: 07:30 - 11:30 | 13:30 - 17:00</div>
          </div>
        </div>

        {/* Danh sach cho */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800">
              Hàng Đợi Trực Tiếp Tại Trụ Sở ({waitingList.length})
            </h3>
            <span className="text-xs text-slate-400">Tự động đồng bộ theo thời gian thực</span>
          </div>

          {waitingList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Hiện tại không có khách hàng nào đang chờ ở quầy.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
                    <th className="pb-3">Số vé</th>
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3">Thủ tục giao dịch</th>
                    <th className="pb-3">Giờ lấy số</th>
                    <th className="pb-3 text-right">Thời gian chờ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {waitingList.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-blue-900">{item.ticketNumber}</td>
                      <td className="py-3 text-slate-700">{item.customerCode}</td>
                      <td className="py-3 text-slate-600">{item.service}</td>
                      <td className="py-3 text-slate-500">{item.time}</td>
                      <td className="py-3 text-right font-medium text-amber-600">~{item.waitMinutes} phút</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
