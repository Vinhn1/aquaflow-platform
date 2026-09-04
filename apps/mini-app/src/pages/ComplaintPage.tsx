import React, { useState } from 'react';
import { apiClient } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import { openChat } from 'zmp-sdk/apis';
import { ZALO_CONFIG } from '../constants/zalo.js';

export const ComplaintPage: React.FC = () => {
  const [category, setCategory] = useState('PIPE_BURST_LEAK');
  const [address, setAddress] = useState('Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau');
  const [description, setDescription] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toastSuccess, toastError, toastWarning } = useToast();

  const categories = [
    { id: 'PIPE_BURST_LEAK', label: 'Rò rỉ / Bể đường ống nước' },
    { id: 'TURBID_DIRTY_WATER', label: 'Nước đục / Cặn vàng / Mùi lạ' },
    { id: 'LOW_WATER_PRESSURE', label: 'Áp lực nước yếu / Mất nước' },
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
        () => {
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
        toastWarning('Chỉ được tải lên tối đa 3 ảnh hiện trường.');
        return;
      }

      const readPromises = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (loadEvt) => {
              if (loadEvt.target?.result) {
                resolve(loadEvt.target.result as string);
              } else {
                reject(new Error('Đọc file thất bại'));
              }
            };
            reader.onerror = () => reject(new Error('Lỗi đọc file ảnh'));
            reader.readAsDataURL(file);
          })
      );

      Promise.all(readPromises)
        .then((results) => {
          setPhotos((prev) => [...prev, ...results]);
        })
        .catch(() => {
          setErrorMsg('Không thể đọc file ảnh. Vui lòng thử lại.');
        });
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toastError('Vui lòng nhập mô tả chi tiết sự cố.');
      return;
    }

    if (description.trim().length < 5) {
      toastError('Mô tả sự cố phải có ít nhất 5 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category,
        address,
        addressText: address,
        description: description.trim(),
        latitude: gpsCoords?.lat || 9.17682,
        longitude: gpsCoords?.lng || 105.15001,
        imageUrls: photos,
        images: photos,
        photos,
      };
      console.log('[ComplaintPage] Submitting, photos count:', photos.length, 'imageUrls in payload:', payload.imageUrls.length);
      await apiClient.post('/api/v1/complaints', payload);

      toastSuccess('Gửi phản ánh thành công! Đội phản ứng nhanh CAWACO đã tiếp nhận và sẽ liên hệ xử lý.');
      setDescription('');
      setPhotos([]);
    } catch (err: any) {
      toastError(err?.message || 'Có lỗi xảy ra khi gửi phản ánh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '30px' }}>

      <form onSubmit={handleSubmit} className="complaint-form">
        {/* Phan loai su co */}
        <div className="form-group">
          <label className="form-label">
            Loại sự cố nước sạch
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dia chi hien truong */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label">
              Địa chỉ sự cố
            </label>
            <button
              type="button"
              onClick={handleGetGps}
              className="gps-chip-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Lấy vị trí GPS
            </button>
          </div>
          <input
            type="text"
            className="form-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập số nhà, tên đường, khóm/phường..."
            required
          />
          {gpsCoords && (
            <div className="gps-hint">
              GPS: {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Mo ta chi tiet */}
        <div className="form-group">
          <label className="form-label">
            Mô tả chi tiết hiện trường
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Vui lòng mô tả mức độ rò rỉ, thời điểm phát hiện, các đặc điểm nhận dạng vị trí..."
            className="form-textarea"
            required
          />
        </div>

        {/* Anh hien truong */}
        <div className="form-group">
          <label className="form-label">
            Hình ảnh hiện trường (Tối đa 3 ảnh)
          </label>

          <div className="photo-upload-grid">
            {photos.map((src, idx) => (
              <div key={idx} className="photo-preview-item">
                <img src={src} alt={`Ảnh ${idx + 1}`} />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="photo-remove-btn"
                >
                  ✕
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <label className="photo-add-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Thêm ảnh</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-cawaco-submit"
          disabled={loading}
          style={{ width: '100%', marginTop: '6px' }}
        >
          {loading ? 'Đang gửi phản ánh...' : 'Gửi Thông Tin Phản Ánh'}
        </button>

        <button
          type="button"
          onClick={() => {
            try {
              openChat({
                type: 'oa',
                id: ZALO_CONFIG.OA_ID,
                message: `Kính chào CSKH CAWACO, tôi cần báo sự cố nước khẩn cấp: ${description || 'Sự cố tại ' + address}`,
              }).catch(() => {
                window.open(ZALO_CONFIG.OA_URL, '_blank');
              });
            } catch {
              window.open(ZALO_CONFIG.OA_URL, '_blank');
            }
          }}
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '10px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            color: '#166534',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          Hoặc Nhắn Tin Trực Tiếp Zalo OA (Hỗ trợ 24/7)
        </button>
      </form>

      {/* Danh sach su co da gui & Theo doi tien do */}
      <ComplaintHistorySection />
    </div>
  );
};

const CATEGORY_NAMES: Record<string, string> = {
  PIPE_BURST_LEAK: 'Rò rỉ / Bể đường ống nước',
  TURBID_DIRTY_WATER: 'Nước đục / Cặn vàng / Mùi lạ',
  LOW_WATER_PRESSURE: 'Áp lực nước yếu / Mất nước',
  METER_DEFECT: 'Hư hỏng / Kẹt chỉ số đồng hồ',
  OTHER: 'Sự cố & Ý kiến khác',
};

const ComplaintHistorySection: React.FC = () => {
  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyComplaints = async () => {
    try {
      const res = await apiClient.get<any>('/api/v1/complaints/my');
      const list = Array.isArray(res) ? res : res?.data || [];
      setMyComplaints(list);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMyComplaints();
    const t = setInterval(fetchMyComplaints, 6000);
    return () => clearInterval(t);
  }, []);

  if (loading || myComplaints.length === 0) return null;

  return (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-main)', padding: '0 2px' }}>
        Tiến độ xử lý phản ánh của bạn ({myComplaints.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {myComplaints.map((item) => {
          const isPending = item.status === 'SUBMITTED' || item.status === 'PENDING';
          const isInProgress = item.status === 'IN_PROGRESS' || item.status === 'DISPATCHED';
          const isResolved = item.status === 'RESOLVED';
          const isRejected = item.status === 'REJECTED';

          return (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: isInProgress
                  ? '1.5px solid #F59E0B'
                  : isResolved
                  ? '1.5px solid #10B981'
                  : '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: '#0369A1' }}>
                    {item.id}
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                    {CATEGORY_NAMES[item.category] || item.category}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    backgroundColor: isPending
                      ? '#FEF2F2'
                      : isInProgress
                      ? '#FEF3C7'
                      : isResolved
                      ? '#ECFDF5'
                      : '#F1F5F9',
                    color: isPending
                      ? '#DC2626'
                      : isInProgress
                      ? '#B45309'
                      : isResolved
                      ? '#047857'
                      : '#64748B',
                  }}
                >
                  {isPending
                    ? 'Chờ điều phối'
                    : isInProgress
                    ? 'Đang xử lý'
                    : isResolved
                    ? 'Đã khắc phục'
                    : 'Đã từ chối'}
                </span>
              </div>

              <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '8px', lineHeight: '1.4' }}>
                {item.address}
              </div>

              {/* Thông tin thợ đã điều phối */}
              {isInProgress && (
                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#92400E' }}>
                    Đã điều phối: {item.assignedWorkerName || 'Kỹ thuật viên CAWACO'}
                  </div>
                  {item.assignedWorkerPhone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#B45309' }}>SĐT: {item.assignedWorkerPhone}</span>
                      <a
                        href={`tel:${item.assignedWorkerPhone.replace(/\s+/g, '')}`}
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#B45309',
                          backgroundColor: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          border: '1px solid #FCD34D',
                        }}
                      >
                        Gọi thợ
                      </a>
                    </div>
                  )}
                  {item.dispatchNote && (
                    <div style={{ fontSize: '10.5px', color: '#78350F', fontStyle: 'italic' }}>
                      "{item.dispatchNote}"
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin kết quả khắc phục */}
              {isResolved && (
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginTop: '4px',
                    fontSize: '11.5px',
                    color: '#065F46',
                  }}
                >
                  <div style={{ fontWeight: '700' }}>Sự cố đã được khắc phục hoàn tất</div>
                  {item.resolutionNote && (
                    <div style={{ fontSize: '11px', marginTop: '2px', color: '#047857' }}>
                      {item.resolutionNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
