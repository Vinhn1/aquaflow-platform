import React, { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiClient } from '../services/api.js';
import { Skeleton } from '../components/states/Skeleton.js';
import { EmptyState } from '../components/states/EmptyState.js';
import { ErrorAlert } from '../components/states/ErrorAlert.js';

interface InvoicePageProps {
  onOpenVietQr: (invoice: any) => void;
}

export const InvoicePage: React.FC<InvoicePageProps> = ({ onOpenVietQr }) => {
  const [customerCode, setCustomerCode] = useState('CM102938');
  const [searchInput, setSearchInput] = useState('CM102938');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const {
    data: invoices,
    status,
    error,
    refetch,
  } = useApi(() => apiClient.get<any[]>(`/api/v1/invoices?customerCode=${customerCode}`), [customerCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCustomerCode(searchInput.trim().toUpperCase());
    }
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* Form tra cuu ma danh bo */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '8px' }}>
          Tra cứu mã danh bộ khách hàng
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="input-field"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập mã danh bộ (VD: CM102938)"
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm, 8px)',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              textTransform: 'uppercase',
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 16px' }}>
            Tra cứu
          </button>
        </form>

        {/* Quick select danh bạ có sẵn */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Mẫu có sẵn:</span>
          <button
            type="button"
            onClick={() => {
              setSearchInput('CM102938');
              setCustomerCode('CM102938');
            }}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #E2E8F0',
              backgroundColor: customerCode === 'CM102938' ? 'var(--cawaco-primary-subtle)' : '#FFF',
              cursor: 'pointer',
            }}
          >
            CM102938 (Nguyễn Văn An)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchInput('CM204819');
              setCustomerCode('CM204819');
            }}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #E2E8F0',
              backgroundColor: customerCode === 'CM204819' ? 'var(--cawaco-primary-subtle)' : '#FFF',
              cursor: 'pointer',
            }}
          >
            CM204819 (Nguyễn Thị Mai)
          </button>
        </div>
      </div>

      {/* Danh sach hoa don */}
      <div className="section-title">Lịch sử hóa đơn tiền nước ({customerCode})</div>

      {status === 'loading' ? (
        <div className="card">
          <Skeleton height="24px" width="140px" />
          <div style={{ marginTop: '12px' }}>
            <Skeleton height="40px" count={2} />
          </div>
        </div>
      ) : error ? (
        <ErrorAlert message={error} onRetry={refetch} />
      ) : !invoices || invoices.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Không tìm thấy hóa đơn"
            description={`Chưa có hóa đơn tiền nước cho mã danh bộ ${customerCode}.`}
          />
        </div>
      ) : (
        invoices.map((inv) => (
          <div key={inv.id} className="card" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                  Kỳ {inv.period}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Chỉ số: {inv.previousReading} m³ → {inv.currentReading} m³ ({inv.consumptionM3} m³)
                </div>
              </div>
              <span className={`badge ${inv.status === 'UNPAID' ? 'badge-unpaid' : 'badge-paid'}`}>
                {inv.status === 'UNPAID' ? 'Chưa thanh toán' : 'Đã thanh toán'}
              </span>
            </div>

            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)', margin: '8px 0' }}>
              {formatVnd(inv.totalAmount)}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Hạn nộp: {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {inv.status === 'UNPAID' && (
                <button
                  className="btn btn-primary"
                  onClick={() => onOpenVietQr(inv)}
                  style={{ flex: 1, fontSize: '13px' }}
                >
                  Thanh toán VietQR
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedInvoice(inv)}
                style={{ flex: inv.status === 'UNPAID' ? 'none' : 1, fontSize: '13px' }}
              >
                Chi tiết bảng kê giá
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal / Bottom Sheet Chi tiet bang ke gia QĐ 13/2023 */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)' }}>
                Bảng kê giá nước Kỳ {selectedInvoice.period}
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Áp dụng biểu giá Quyết định số 13/2023/QĐ-UBND tỉnh Cà Mau (Mục Sinh hoạt TP. Cà Mau)
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                <span>Bậc 1 (0 - 10 m³): 10 m³ × 6.600đ</span>
                <strong>66.000 đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                <span>Bậc 2 (10 - 20 m³): 8 m³ × 8.100đ</span>
                <strong>64.800 đ</strong>
              </div>
              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                <span>Tiền nước trước thuế:</span>
                <strong>{formatVnd(selectedInvoice.waterAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                <span>Thuế GTGT (5%):</span>
                <strong>{formatVnd(selectedInvoice.vatAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                <span>Phí BVMT nước thải (10%):</span>
                <strong>{formatVnd(selectedInvoice.envFeeAmount)}</strong>
              </div>
              <div style={{ height: '1px', backgroundColor: '#CBD5E1', margin: '8px 0' }} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--color-primary)',
                  paddingTop: '4px',
                }}
              >
                <span>Tổng cộng thanh toán:</span>
                <span>{formatVnd(selectedInvoice.totalAmount)}</span>
              </div>
            </div>

            {selectedInvoice.status === 'UNPAID' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  const inv = selectedInvoice;
                  setSelectedInvoice(null);
                  onOpenVietQr(inv);
                }}
              >
                Thanh toán VietQR ngay
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
