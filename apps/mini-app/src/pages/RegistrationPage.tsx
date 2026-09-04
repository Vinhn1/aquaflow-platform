import React, { useState } from 'react';
import { apiClient } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import { validateCCCD, validatePhone, validateStreetAddress } from '@aquaflow/validation';

export const CAMAU_ADMINISTRATIVE_DATA: Record<string, string[]> = {
  'TP. Cà Mau': [
    'Phường 1 (Đã sáp nhập P.2)',
    'Phường 4',
    'Phường 5',
    'Phường 6',
    'Phường 7',
    'Phường 8',
    'Phường 9',
    'Phường Tân Xuyên',
    'Phường Tân Thành',
    'Xã An Xuyên',
    'Xã Định Bình',
    'Xã Hòa Tân',
    'Xã Hòa Thành',
    'Xã Lý Văn Lâm',
    'Xã Tắc Vân',
    'Xã Tân Thành',
  ],
  'Huyện Thới Bình': [
    'Thị trấn Thới Bình',
    'Xã Biển Bạch',
    'Xã Biển Bạch Đông',
    'Xã Hồ Thị Kỷ',
    'Xã Tân Bằng',
    'Xã Tân Lộc',
    'Xã Tân Lộc Bắc',
    'Xã Tân Lộc Đông',
    'Xã Tân Phú',
    'Xã Thới Bình',
    'Xã Trí Lực',
    'Xã Trí Phải',
  ],
  'Huyện Trần Văn Thời': [
    'Thị trấn Trần Văn Thời',
    'Thị trấn Sông Đốc',
    'Xã Khánh Bình',
    'Xã Khánh Bình Đông',
    'Xã Khánh Bình Tây',
    'Xã Khánh Bình Tây Bắc',
    'Xã Khánh Hưng',
    'Xã Khánh Hải',
    'Xã Khánh Lộc',
    'Xã Phong Điền',
    'Xã Phong Lạc',
    'Xã Trần Hợi',
  ],
  'Huyện Cái Nước': [
    'Thị trấn Cái Nước',
    'Xã Đông Hưng',
    'Xã Đông Thới',
    'Xã Hòa Mỹ',
    'Xã Hưng Mỹ',
    'Xã Lương Thế Trân',
    'Xã Phú Hưng',
    'Xã Tân Hưng',
    'Xã Tân Hưng Đông',
    'Xã Thạnh Phú',
    'Xã Trần Thới',
  ],
  'Huyện Đầm Dơi': [
    'Thị trấn Đầm Dơi',
    'Xã Ngọc Chánh',
    'Xã Nguyễn Huân',
    'Xã Quách Phẩm',
    'Xã Quách Phẩm Bắc',
    'Xã Tân Dân',
    'Xã Tân Duyệt',
    'Xã Tân Đức',
    'Xã Tân Thuận',
    'Xã Tân Tiến',
    'Xã Tân Trung',
    'Xã Thanh Tùng',
    'Xã Tạ An Khương',
    'Xã Tạ An Khương Đông',
    'Xã Tạ An Khương Nam',
    'Xã Trần Phán',
  ],
  'Huyện Năm Căn': [
    'Thị trấn Năm Căn',
    'Xã Đất Mới',
    'Xã Hàm Rồng',
    'Xã Hàng Vịnh',
    'Xã Hiệp Tùng',
    'Xã Lâm Hải',
    'Xã Tam Giang',
    'Xã Tam Giang Đông',
  ],
  'Huyện U Minh': [
    'Thị trấn U Minh',
    'Xã Khánh An',
    'Xã Khánh Hòa',
    'Xã Khánh Hội',
    'Xã Khánh Lâm',
    'Xã Khánh Thuận',
    'Xã Khánh Tiến',
    'Xã Nguyễn Phích',
  ],
  'Huyện Phú Tân': [
    'Thị trấn Cái Đôi Vàm',
    'Xã Nguyễn Việt Khái',
    'Xã Phú Mỹ',
    'Xã Phú Tân',
    'Xã Phú Thuận',
    'Xã Rạch Chèo',
    'Xã Tân Hải',
    'Xã Tân Hưng Tây',
    'Xã Việt Thắng',
  ],
  'Huyện Ngọc Hiển': [
    'Thị trấn Rạch Gốc',
    'Xã Đất Mũi',
    'Xã Tam Giang Tây',
    'Xã Tân Ân',
    'Xã Tân Ân Tây',
    'Xã Viên An',
    'Xã Viên An Đông',
  ],
};

interface RegistrationPageProps {
  user?: any;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ user }) => {
  const [activeMode, setActiveMode] = useState<'NEW' | 'LOOKUP'>('NEW');

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [district, setDistrict] = useState('TP. Cà Mau');
  const [ward, setWard] = useState('Phường Tân Thành');
  const [streetAddress, setStreetAddress] = useState('');
  const [purpose, setPurpose] = useState('DOMESTIC_TP');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const { toastError, toastWarning } = useToast();

  // Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toastWarning('Vui lòng nhập Họ và tên chủ hộ.');
      return;
    }

    // 1. Kiểm tra Số điện thoại
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      toastWarning(phoneCheck.message || 'Số điện thoại không hợp lệ.');
      return;
    }

    // 2. Kiểm tra Số CCCD / CMND
    const cccdCheck = validateCCCD(idCardNumber);
    if (!cccdCheck.valid) {
      toastWarning(cccdCheck.message || 'Số CCCD không hợp lệ.');
      return;
    }

    // 3. Kiểm tra Địa chỉ lắp đặt cụ thể
    const addressCheck = validateStreetAddress(streetAddress);
    if (!addressCheck.valid) {
      toastWarning(addressCheck.message || 'Địa chỉ lắp đặt cụ thể không hợp lệ.');
      return;
    }

    if (!ward.trim()) {
      toastWarning('Vui lòng nhập Phường/Xã.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiClient.post<any>('/api/v1/registrations', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        idCardNumber: idCardNumber.trim(),
        district: district.trim(),
        ward: ward.trim(),
        streetAddress: streetAddress.trim(),
        purpose,
        userId: user?.id,
      });

      if (res?.registration) {
        setSuccessResult(res.registration);
      } else if (res) {
        setSuccessResult(res);
      } else {
        throw new Error('Gửi hồ sơ thất bại.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Có lỗi xảy ra khi nộp hồ sơ.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await apiClient.get<any>(`/api/v1/registrations/${encodeURIComponent(lookupQuery.trim())}`);
      if (res) {
        setLookupResult(res);
      } else {
        toastError('Không tìm thấy hồ sơ đăng ký phù hợp.');
      }
    } catch (err: any) {
      toastError('Không tìm thấy hồ sơ hoặc có lỗi xảy ra.');
    } finally {
      setLookingUp(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Đã nộp hồ sơ', bg: '#E0F2FE', text: '#0369A1' };
      case 'DOCS_APPROVED':
        return { label: 'Hồ sơ hợp lệ', bg: '#D1FAE5', text: '#065F46' };
      case 'SURVEYING':
        return { label: 'Đang khảo sát hiện trường', bg: '#FEF3C7', text: '#92400E' };
      case 'PAYMENT_DUE':
        return { label: 'Chờ nộp phí lắp đặt', bg: '#EDE9FE', text: '#5B21B6' };
      case 'INSTALLING':
        return { label: 'Đang thi công gắn đồng hồ', bg: '#E0E7FF', text: '#3730A3' };
      case 'COMPLETED':
        return { label: 'Hoàn thành cấp nước', bg: '#CCFBF1', text: '#115E59' };
      default:
        return { label: 'Đang xử lý', bg: '#F1F5F9', text: '#475569' };
    }
  };

  // CCCD Format validation helper status
  const cccdStatus = idCardNumber ? validateCCCD(idCardNumber) : null;
  const addressStatus = streetAddress ? validateStreetAddress(streetAddress) : null;

  return (
    <div className="subpage-container">
      {/* Mode Switch Tabs */}
      <div className="subpage-tab-switcher">
        <button
          type="button"
          onClick={() => {
            setActiveMode('NEW');
            setSuccessResult(null);
          }}
          className={`subpage-tab-btn ${activeMode === 'NEW' ? 'active' : ''}`}
        >
          Nộp Hồ Sơ Lắp Mới
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('LOOKUP')}
          className={`subpage-tab-btn ${activeMode === 'LOOKUP' ? 'active' : ''}`}
        >
          Tra Cứu Tiến Độ
        </button>
      </div>

      {/* Mode 1: Nop ho so moi */}
      {activeMode === 'NEW' && (
        <>
          {successResult ? (
            <div className="card" style={{ textAlign: 'center', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  backgroundColor: '#DCFCE7', color: '#16A34A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#166534', margin: 0 }}>Nộp Hồ Sơ Đăng Ký Thành Công!</h3>
              <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
                Mã hồ sơ của bạn là: <strong style={{ fontFamily: 'monospace', color: 'var(--cawaco-primary, #0369A1)', fontSize: '14px' }}>{successResult.registrationCode}</strong>
              </p>
              <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.45', margin: 0 }}>
                CAWACO sẽ cử cán bộ kỹ thuật liên hệ theo số điện thoại <strong>{successResult.phone}</strong> để lên lịch khảo sát thực tế trong 48 giờ làm việc.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSuccessResult(null);
                  setStreetAddress('');
                  setIdCardNumber('');
                }}
                className="btn-cawaco-submit"
                style={{ marginTop: '8px', alignSelf: 'center', width: 'auto', padding: '9px 20px' }}
              >
                Nộp hồ sơ khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-card">
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px' }}>
                  Thông tin chủ hộ đăng ký
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Áp dụng cho hộ gia đình và cơ sở kinh doanh tại Tỉnh Cà Mau</p>
              </div>

              <div className="form-group-item">
                <label className="form-label-title">Họ và tên chủ hộ *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="VD: NGUYỄN VĂN AN"
                  className="form-input-field"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-item">
                  <label className="form-label-title">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, '').slice(0, 10))}
                    required
                    placeholder="VD: 0918234567"
                    className="form-input-field"
                  />
                </div>
                <div className="form-group-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label-title">Số CCCD *</label>
                    <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
                      {idCardNumber.length}/12 số
                    </span>
                  </div>
                  <input
                    type="text"
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    required
                    placeholder="12 chữ số CCCD"
                    className="form-input-field"
                    style={{
                      borderColor: cccdStatus && !cccdStatus.valid && idCardNumber.length >= 9 ? '#EF4444' : undefined,
                    }}
                  />
                  {cccdStatus && !cccdStatus.valid && idCardNumber.length >= 9 && (
                    <span style={{ fontSize: '10px', color: '#DC2626', marginTop: '2px', display: 'block', lineHeight: '1.3' }}>
                      {cccdStatus.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-item">
                  <label className="form-label-title">Quận / Huyện</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const newDistrict = e.target.value;
                      setDistrict(newDistrict);
                      const wards = CAMAU_ADMINISTRATIVE_DATA[newDistrict] || [];
                      if (wards.length > 0) {
                        setWard(wards[0]);
                      }
                    }}
                    className="form-input-field"
                  >
                    {Object.keys(CAMAU_ADMINISTRATIVE_DATA).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-item">
                  <label className="form-label-title">Phường / Xã *</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="form-input-field"
                  >
                    {(CAMAU_ADMINISTRATIVE_DATA[district] || []).map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-item">
                <label className="form-label-title">Địa chỉ lắp đặt cụ thể *</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                  placeholder="VD: Số 124 đường Lý Thường Kiệt, Khóm 6 (hoặc Ấp 2)"
                  className="form-input-field"
                  style={{
                    borderColor: addressStatus && !addressStatus.valid && streetAddress.length > 0 ? '#EF4444' : undefined,
                  }}
                />
                {addressStatus && !addressStatus.valid && streetAddress.length > 0 ? (
                  <span style={{ fontSize: '10px', color: '#DC2626', marginTop: '2px', display: 'block', lineHeight: '1.3' }}>
                    {addressStatus.message}
                  </span>
                ) : (
                  <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px', display: 'block' }}>
                    Ghi rõ số nhà, ngõ/hẻm, tên đường hoặc khóm/ấp để thợ kỹ thuật tìm đến khảo sát.
                  </span>
                )}
              </div>

              <div className="form-group-item">
                <label className="form-label-title">Mục đích sử dụng nước</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="form-input-field"
                >
                  <option value="DOMESTIC_TP">Sinh hoạt hộ gia đình (Đô thị)</option>
                  <option value="DOMESTIC_DISTRICT">Sinh hoạt hộ gia đình (Nông thôn/Huyện)</option>
                  <option value="COMMERCIAL">Kinh doanh dịch vụ, buôn bán</option>
                  <option value="PRODUCTION">Sản xuất vật chất, nhà xưởng</option>
                  <option value="ADMINISTRATIVE">Cơ quan hành chính sự nghiệp</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-cawaco-submit"
                style={{ marginTop: '6px' }}
              >
                {submitting ? 'Đang gửi hồ sơ...' : 'Gửi Hồ Sơ Đăng Ký'}
              </button>
            </form>
          )}
        </>
      )}

      {/* Mode 2: Tra cuu tien do ho so */}
      {activeMode === 'LOOKUP' && (
        <div className="form-card">
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px' }}>
              Tra cứu hồ sơ gắn mới
            </h3>
            <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Nhập Mã hồ sơ (VD: REG-2026-0001) hoặc Số điện thoại, CCCD</p>
          </div>

          <form onSubmit={handleLookup} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Mã hồ sơ / SĐT / CCCD"
              className="form-input-field"
              style={{ flex: 1 }}
              required
            />
            <button
              type="submit"
              disabled={lookingUp}
              className="btn-cawaco-submit"
              style={{ width: 'auto', padding: '0 16px', whiteSpace: 'nowrap' }}
            >
              {lookingUp ? 'Tìm...' : 'Tra cứu'}
            </button>
          </form>

          {lookupResult && (
            <div style={{ marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Mã hồ sơ:</span>
                <strong style={{ fontFamily: 'monospace', color: '#0369A1' }}>{lookupResult.registrationCode}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Trạng thái:</span>
                {(() => {
                  const b = getStatusBadge(lookupResult.status);
                  return (
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: b.bg, color: b.text }}>
                      {b.label}
                    </span>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Chủ hộ:</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A' }}>{lookupResult.fullName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Địa chỉ gắn mới:</span>
                <span style={{ fontSize: '11.5px', color: '#334155', textAlign: 'right', maxWidth: '60%' }}>
                  {lookupResult.streetAddress}, {lookupResult.ward}, {lookupResult.district}
                </span>
              </div>

              {lookupResult.estimatedCost && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Chi phí dự toán:</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#B91C1C' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lookupResult.estimatedCost)}
                  </span>
                </div>
              )}

              {lookupResult.adminNote && (
                <div style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px dashed #CBD5E1', fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                  <strong>Ghi chú từ CAWACO:</strong> {lookupResult.adminNote}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
