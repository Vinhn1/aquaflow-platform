import React, { useState } from 'react';

export const CustomerLookup: React.FC = () => {
  const [customerCode, setCustomerCode] = useState('CM102938');
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Tra Cứu Hồ Sơ Khách Hàng & Đồng Hồ Nước
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Dữ liệu kết nối trực tiếp cơ sở dữ liệu khách hàng PostgreSQL CAWACO
        </p>

        {/* Search Bar */}
        <div className="mt-4 flex gap-3 max-w-lg">
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
              <span className="text-xs text-slate-400 block">Mục đích & Biểu giá áp dụng:</span>
              <span className="font-semibold text-teal-700">
                {customer.tariffGroup === 'DOMESTIC_TP'
                  ? 'Sinh hoạt hộ gia đình TP. Cà Mau (QĐ 13/2023)'
                  : customer.tariffGroup}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
