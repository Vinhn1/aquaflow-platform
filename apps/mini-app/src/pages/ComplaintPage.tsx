import React, { useState } from 'react';
import { apiClient } from '../services/api.js';

export const ComplaintPage: React.FC = () => {
  const [category, setCategory] = useState('LEAKAGE');
  const [address, setAddress] = useState('Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau');
  const [description, setDescription] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    { id: 'LEAKAGE', label: 'Rò rỉ / Bể đường ống nước' },
    { id: 'WATER_QUALITY', label: 'Nước đục / Cặn vàng / Mùi lạ' },
    { id: 'LOW_PRESSURE', label: 'Áp lực nước yếu / Mất nước' },
    { id: 'METER_DEFECT', label: 'Hư hỏng / Kẹt chỉ số đồng hồ' },
    { id: 'OTHER', label: 'Sự cố & Ý kiến khác' },
  ];

  const handleGetGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setSuccessMsg(`Đã định vị tọa độ GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        },
        (err) => {
          setErrorMsg('Không thể lấy tọa độ GPS tự động. Vui lòng nhập địa chỉ cụ thể.');
        }
      );
    } else {
      setErrorMsg('Trình duyệt hoặc thiết bị không hỗ trợ định vị GPS.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (photos.length + files.length > 3) {
        setErrorMsg('Chỉ được tải lên tối đa 3 ảnh hiện trường.');
        return;
      }

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          if (loadEvt.target?.result) {
            setPhotos((prev) => [...prev, loadEvt.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Vui lòng nhập mô tả chi tiết sự cố.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await apiClient.post('/api/v1/complaints', {
        category,
        address,
        description,
        latitude: gpsCoords?.lat,
        longitude: gpsCoords?.lng,
        photos,
      });

      setSuccessMsg('Gửi phản ánh thành công! Đội kỹ thuật CAWACO đã tiếp nhận và sẽ liên hệ xử lý.');
      setDescription('');
      setPhotos([]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi gửi phản ánh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      <div className="section-title">Tiếp nhận sự cố mạng lưới cấp nước</div>

      {successMsg && (
        <div
          style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #16A34A',
            color: '#15803D',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            lineHeight: 1.5,
            marginBottom: '14px',
          }}
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: '#FDECEC',
            border: '1px solid #D9383A',
            color: '#991B1B',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            marginBottom: '14px',
          }}
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* Phan loai su co */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
            Loại sự cố nước sạch
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm, 8px)',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              backgroundColor: '#FFF',
            }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dia chi hien truong */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-main)' }}>
              Địa chỉ sự cố
            </label>
            <button
              type="button"
              onClick={handleGetGps}
              style={{
                fontSize: '11px',
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Lấy vị trí GPS
            </button>
          </div>
          <input
            type="text"
            className="input-field"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập số nhà, tên đường, khóm/phường..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm, 8px)',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
            }}
            required
          />
          {gpsCoords && (
            <div style={{ fontSize: '11px', color: 'var(--cawaco-teal, #0E8E89)', marginTop: '4px' }}>
              GPS: {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Mo ta chi tiet */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
            Mô tả chi tiết hiện trường
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Vui lòng mô tả mức độ rò rỉ, thời điểm phát hiện, các đặc điểm nhận dạng vị trí..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm, 8px)',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
            required
          />
        </div>

        {/* Anh hien truong */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
            Hình ảnh hiện trường (Tối đa 3 ảnh)
          </label>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {photos.map((src, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid #CBD5E1',
                }}
              >
                <img src={src} alt={`Ảnh ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#FFF',
                    border: 'none',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <label
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '6px',
                  border: '1px dashed #94A3B8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Thêm ảnh</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Đang gửi phản ánh...' : 'Gửi thông tin phản ánh'}
        </button>
      </form>
    </div>
  );
};
