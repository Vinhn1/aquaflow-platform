import React, { useState } from 'react';
import { apiClient } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

interface MeterItem {
  customerCode: string;
  meterId: string;
  address: string;
  previousReading: number;
  period: string;
}

const DEFAULT_METERS: MeterItem[] = [
  {
    customerCode: 'CM102938',
    meterId: 'MTR-88291',
    address: 'Số 204, Quang Trung, P. Tân Thành, TP. Cà Mau',
    previousReading: 145,
    period: '2026-09',
  },
  {
    customerCode: 'CM204819',
    meterId: 'MTR-44910',
    address: 'Số 45, đường Lý Bôn, Phường 2, TP. Cà Mau',
    previousReading: 103,
    period: '2026-09',
  },
];

export const MeterReadingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SUBMIT' | 'HISTORY'>('SUBMIT');
  const [selectedMeterCode, setSelectedMeterCode] = useState<string>('CM102938');
  const [currentReadingInput, setCurrentReadingInput] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);

  const { toastSuccess, toastError, toastWarning } = useToast();

  const selectedMeter = DEFAULT_METERS.find((m) => m.customerCode === selectedMeterCode) || DEFAULT_METERS[0];
  const previousReading = selectedMeter.previousReading;
  const currentReadingNum = currentReadingInput ? Number(currentReadingInput) : null;
  const consumptionM3 = currentReadingNum !== null && !isNaN(currentReadingNum) ? currentReadingNum - previousReading : null;

  // Tinh tien nuoc sinh hoat uoc tinh theo QD 13/2023 tinh Ca Mau
  const estimatedAmount = React.useMemo(() => {
    if (consumptionM3 === null || consumptionM3 <= 0) return 0;
    let total = 0;
    let m3 = consumptionM3;

    // Bac 1: 0 - 10 m3 (7.500d)
    const b1 = Math.min(m3, 10);
    total += b1 * 7500;
    m3 -= b1;

    // Bac 2: 10 - 20 m3 (8.900d)
    if (m3 > 0) {
      const b2 = Math.min(m3, 10);
      total += b2 * 8900;
      m3 -= b2;
    }

    // Bac 3: 20 - 30 m3 (10.200d)
    if (m3 > 0) {
      const b3 = Math.min(m3, 10);
      total += b3 * 10200;
      m3 -= b3;
    }

    // Bac 4: tren 30 m3 (12.500d)
    if (m3 > 0) {
      total += m3 * 12500;
    }

    // Cong them 5% VAT + 10% BVMT = 15%
    return Math.round(total * 1.15);
  }, [consumptionM3]);

  // Handle Photo Capture / Upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastWarning('Ảnh dung lượng tối đa 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setPhotoPreview(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentReadingNum === null || isNaN(currentReadingNum)) {
      toastWarning('Vui lòng nhập chỉ số mới của đồng hồ.');
      return;
    }

    if (currentReadingNum < previousReading) {
      toastError(`Chỉ số mới không được nhỏ hơn chỉ số kỳ trước (${previousReading} m³).`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiClient.post<any>('/api/v1/meter-readings', {
        customerCode: selectedMeter.customerCode,
        meterId: selectedMeter.meterId,
        period: selectedMeter.period,
        previousReading,
        currentReading: currentReadingNum,
        photoUrl: photoPreview || undefined,
        notes,
      });

      if (res?.reading) {
        setSubmitSuccess(res.reading);
      } else if (res) {
        setSubmitSuccess(res);
      }
      toastSuccess('Gửi chỉ số nước thành công!');
    } catch (err: any) {
      toastError(err?.message || 'Không thể gửi chỉ số nước. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="subpage-container" style={{ paddingBottom: '30px' }}>
      {/* Switcher Tab */}
      <div className="subpage-tab-switcher">
        <button
          type="button"
          onClick={() => {
            setActiveTab('SUBMIT');
            setSubmitSuccess(null);
          }}
          className={`subpage-tab-btn ${activeTab === 'SUBMIT' ? 'active' : ''}`}
        >
          Báo chỉ số nước
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`subpage-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
        >
          Lịch sử tự báo
        </button>
      </div>

      {activeTab === 'SUBMIT' && (
        <>
          {submitSuccess ? (
            <div className="card" style={{ textAlign: 'center', padding: '24px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: '#DCFCE7', color: '#16A34A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#166534', margin: 0 }}>
                Gửi Chỉ Số Thành Công!
              </h3>
              <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
                Mã phiếu đối soát: <strong style={{ fontFamily: 'monospace', color: '#0369A1' }}>{submitSuccess.id || 'MR-2026-NEW'}</strong>
              </p>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', textAlign: 'left', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ color: '#64748B' }}>Kỳ nước:</span>
                  <strong>{selectedMeter.period}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ color: '#64748B' }}>Chỉ số báo:</span>
                  <strong>{currentReadingNum} m³</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ color: '#64748B' }}>Tiêu thụ tạm tính:</span>
                  <strong>{consumptionM3} m³</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ color: '#64748B' }}>Trạng thái:</span>
                  <span style={{ color: '#D97706', fontWeight: 700 }}>Đang chờ nhân viên đối soát</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(null);
                  setCurrentReadingInput('');
                  setPhotoPreview(null);
                  setNotes('');
                }}
                className="btn-cawaco-submit"
                style={{ alignSelf: 'center', width: 'auto', padding: '8px 18px', marginTop: '4px' }}
              >
                Nhập phiếu khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-card">
              {/* Thông tin kỳ ghi & chọn đồng hồ */}
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      Kỳ nước tháng 09/2026
                    </span>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Thời hạn tự ghi chỉ số: Từ ngày 01 đến ngày 07 hàng tháng
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 700 }}>
                    Đang mở kỳ
                  </span>
                </div>
              </div>

              {/* Chọn danh bạ */}
              <div className="form-group-item">
                <label className="form-label-title">Chọn đồng hồ nước</label>
                <select
                  value={selectedMeterCode}
                  onChange={(e) => {
                    setSelectedMeterCode(e.target.value);
                    setCurrentReadingInput('');
                  }}
                  className="form-input-field"
                >
                  {DEFAULT_METERS.map((m) => (
                    <option key={m.customerCode} value={m.customerCode}>
                      {m.customerCode} - {m.meterId} ({m.address.split(',')[0]})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Địa chỉ: {selectedMeter.address}
                </div>
              </div>

              {/* Hộp chỉ số cũ vs chỉ số mới */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '4px 0' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>Chỉ số kỳ trước</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#334155', fontFamily: 'monospace', letterSpacing: '2px' }}>
                    {String(previousReading).padStart(5, '0')}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>Đơn vị: m³</div>
                </div>

                <div style={{ backgroundColor: '#F0F9FF', padding: '12px', borderRadius: '10px', border: '1.5px solid #BAE6FD', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#0369A1', fontWeight: 700, marginBottom: '4px' }}>Chỉ số kỳ này *</div>
                  <input
                    type="number"
                    value={currentReadingInput}
                    onChange={(e) => setCurrentReadingInput(e.target.value)}
                    placeholder="VD: 155"
                    required
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '20px',
                      fontWeight: 800,
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      borderRadius: '6px',
                      border: '1px solid #0284C7',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: '#0369A1',
                    }}
                  />
                  <div style={{ fontSize: '10.5px', color: '#0284C7', marginTop: '2px' }}>Nhập số m³ trên đồng hồ</div>
                </div>
              </div>

              {/* Thẻ tạm tính & Cảnh báo sai số */}
              {consumptionM3 !== null && (
                <div>
                  {consumptionM3 < 0 ? (
                    <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '11.5px', fontWeight: 600 }}>
                      Chỉ số mới ({currentReadingNum} m³) không được nhỏ hơn chỉ số kỳ trước ({previousReading} m³).
                    </div>
                  ) : (
                    <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                          Lượng nước tiêu thụ: <strong>{consumptionM3} m³</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#4ADE80', marginTop: '2px' }}>
                          Tiền nước tạm tính (gồm thuế + phí):
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#15803D' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(estimatedAmount)}
                      </div>
                    </div>
                  )}

                  {consumptionM3 >= 45 && (
                    <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', fontSize: '11px', lineHeight: 1.4 }}>
                      Lưu ý: Mức tiêu thụ {consumptionM3} m³ tăng khá cao so với mức thông thường. Quý khách vui lòng kiểm tra lại số vòng quay hoặc chụp ảnh kèm theo.
                    </div>
                  )}
                </div>
              )}

              {/* Chụp / Tải ảnh mặt đồng hồ */}
              <div className="form-group-item">
                <label className="form-label-title">Ảnh chụp mặt đồng hồ (Khuyến nghị)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>{photoPreview ? 'Đổi ảnh chụp' : 'Chụp / Tải ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {photoPreview && (
                    <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                      Đã đính kèm ảnh
                    </span>
                  )}
                </div>

                {photoPreview && (
                  <div style={{ marginTop: '8px', position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                    <img src={photoPreview} alt="Mặt đồng hồ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: 'rgba(0,0,0,0.6)', color: '#FFFFFF',
                        border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div className="form-group-item">
                <label className="form-label-title">Ghi chú (nếu có)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Van đồng hồ bị kẹt nhẹ, đồng hồ bị mờ sương..."
                  className="form-input-field"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || consumptionM3 === null || consumptionM3 < 0}
                className="btn-cawaco-submit"
                style={{ marginTop: '6px' }}
              >
                {submitting ? 'Đang gửi...' : 'Xác Nhận & Gửi Chỉ Số'}
              </button>
            </form>
          )}
        </>
      )}

      {activeTab === 'HISTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Kỳ 08/2026 - CM102938
              </span>
              <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                Đã duyệt &amp; Lập hóa đơn
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>Chỉ số báo: <strong>120 m³ → 145 m³</strong> (Tiêu thụ: 25 m³)</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Gửi lúc: 03/08/2026 08:30</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Kỳ 07/2026 - CM102938
              </span>
              <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                Đã duyệt &amp; Lập hóa đơn
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>Chỉ số báo: <strong>98 m³ → 120 m³</strong> (Tiêu thụ: 22 m³)</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Gửi lúc: 03/07/2026 09:12</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
