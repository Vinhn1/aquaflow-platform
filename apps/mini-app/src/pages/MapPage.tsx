/**
 * MapPage.tsx — Bản đồ điểm giao dịch CAWACO
 *
 * Tính năng:
 * - Bản đồ Leaflet.js + OpenStreetMap tiles (miễn phí, không cần API key)
 * - Markers các điểm giao dịch CAWACO tại Cà Mau
 * - Nút "Vị trí của tôi" — GPS người dùng
 * - Bottom sheet chi tiết khi tap vào marker (tên, địa chỉ, giờ làm việc, SĐT)
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Sửa lỗi icon Leaflet bị mất khi dùng Vite bundler
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet icon issue với Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

/** Thông tin điểm giao dịch CAWACO */
interface CawacoLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  type: 'headquarter' | 'branch' | 'payment';
}

/** Danh sách điểm giao dịch CAWACO tại Cà Mau */
const CAWACO_LOCATIONS: CawacoLocation[] = [
  {
    id: 'hq',
    name: 'Trụ sở chính CAWACO',
    address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
    lat: 9.1768,
    lng: 105.1524,
    phone: '02903836360',
    hours: 'T2-T6: 07:30 - 17:00',
    type: 'headquarter',
  },
  {
    id: 'branch1',
    name: 'Chi nhánh Phường 1',
    address: 'Đường Lý Thường Kiệt, Phường 1, TP. Cà Mau',
    lat: 9.1785,
    lng: 105.1501,
    phone: '02903836361',
    hours: 'T2-T6: 07:30 - 17:00',
    type: 'branch',
  },
  {
    id: 'payment8',
    name: 'Điểm thu tiền Phường 8',
    address: 'Đường Nguyễn Trãi, Phường 8, TP. Cà Mau',
    lat: 9.172,
    lng: 105.158,
    phone: '02903836362',
    hours: 'T2-T7: 08:00 - 17:00',
    type: 'payment',
  },
];

/** Màu icon theo loại điểm */
const MARKER_COLORS: Record<CawacoLocation['type'], string> = {
  headquarter: '#003B6F', // Deep Navy — trụ sở chính
  branch: '#127AB5',      // Primary Blue — chi nhánh
  payment: '#0E8E89',     // Teal — điểm thu tiền
};

/** Tạo custom marker SVG cho Leaflet */
function createCustomMarker(color: string): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        width: 32px; height: 38px;
        display: flex; flex-direction: column; align-items: center;
      ">
        <div style="
          width: 28px; height: 28px; background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          width: 4px; height: 10px;
          background: ${color}; border-radius: 0 0 2px 2px;
          margin-top: -2px; opacity: 0.7;
        "></div>
      </div>`,
    className: '',
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -40],
  });
}

export const MapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<CawacoLocation | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Khởi tạo bản đồ Leaflet một lần sau khi component mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Tạo map với center tại Cà Mau
    const map = L.map(mapContainerRef.current, {
      center: [9.1768, 105.1524],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    // Sử dụng OpenStreetMap tiles — miễn phí, không cần API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Thêm markers cho tất cả điểm CAWACO
    CAWACO_LOCATIONS.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createCustomMarker(MARKER_COLORS[loc.type]),
        title: loc.name,
      }).addTo(map);

      // Click vào marker → hiện bottom sheet chi tiết
      marker.on('click', () => {
        setSelectedLocation(loc);
        map.panTo([loc.lat, loc.lng], { animate: true, duration: 0.4 });
      });
    });

    mapInstanceRef.current = map;

    // Cleanup khi component unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  /** Lấy vị trí GPS của người dùng */
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setUserPosition({ lat, lng });
        setGpsLoading(false);

        const map = mapInstanceRef.current;
        if (!map) return;

        // Xóa marker cũ nếu có
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // Thêm marker vị trí người dùng (màu đỏ cam)
        const userIcon = L.divIcon({
          html: `<div style="
            width: 18px; height: 18px;
            background: #EF4444; border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 3px rgba(239,68,68,0.3), 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Vị trí của bạn', { closeButton: false });

        // Điều chỉnh view để hiện cả trụ sở và vị trí người dùng
        map.flyTo([lat, lng], 15, { animate: true, duration: 1 });
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Bạn chưa cho phép ứng dụng truy cập vị trí.');
        } else {
          setGpsError('Không thể xác định vị trí. Vui lòng thử lại.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /** Badge loại điểm giao dịch */
  const getLocationTypeBadge = (type: CawacoLocation['type']) => {
    const map = {
      headquarter: { label: 'Trụ sở chính', color: 'var(--cawaco-deep-navy)' },
      branch: { label: 'Chi nhánh', color: 'var(--cawaco-primary)' },
      payment: { label: 'Điểm thu tiền', color: 'var(--cawaco-teal)' },
    };
    return map[type];
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Header trang */}
      <div style={{
        padding: '14px 16px 10px',
        background: '#fff',
        borderBottom: '1px solid var(--color-border-subtle)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--cawaco-deep-navy)' }}>
          Điểm giao dịch CAWACO
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {CAWACO_LOCATIONS.length} điểm tại TP. Cà Mau
        </div>
      </div>

      {/* Controls trên bản đồ */}
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '12px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Nút GPS */}
        <button
          onClick={handleGetUserLocation}
          disabled={gpsLoading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: gpsLoading ? 'wait' : 'pointer',
            color: userPosition ? 'var(--cawaco-primary)' : 'var(--color-text-muted)',
          }}
          title="Vị trí của tôi"
        >
          {gpsLoading ? (
            /* Spinner khi đang tải GPS */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            /* Icon GPS */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          )}
        </button>
      </div>

      {/* Bản đồ Leaflet */}
      <div
        ref={mapContainerRef}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '320px',
          zIndex: 1,
        }}
      />

      {/* Lỗi GPS */}
      {gpsError && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: '16px',
          right: '60px',
          background: 'var(--color-danger-subtle)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: '12px',
          color: 'var(--color-danger)',
          zIndex: 1000,
        }}>
          {gpsError}
        </div>
      )}

      {/* Legend loại điểm */}
      <div style={{
        padding: '10px 16px',
        background: '#fff',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        gap: '14px',
        flexShrink: 0,
      }}>
        {Object.entries(MARKER_COLORS).map(([type, color]) => {
          const badge = getLocationTypeBadge(type as CawacoLocation['type']);
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: color, flexShrink: 0,
              }} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{badge.label}</span>
            </div>
          );
        })}
        {userPosition && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#EF4444', flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Vị trí của bạn</span>
          </div>
        )}
      </div>

      {/* Bottom Sheet chi tiết điểm giao dịch */}
      {selectedLocation && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '55%', paddingBottom: '24px' }}
          >
            <div className="sheet-handle" />

            {/* Badge loại */}
            <div style={{ marginBottom: '10px' }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '700',
                background: `${MARKER_COLORS[selectedLocation.type]}1A`,
                color: MARKER_COLORS[selectedLocation.type],
              }}>
                {getLocationTypeBadge(selectedLocation.type).label}
              </span>
            </div>

            {/* Tên điểm giao dịch */}
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--cawaco-deep-navy)', marginBottom: '6px' }}>
              {selectedLocation.name}
            </div>

            {/* Địa chỉ */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cawaco-primary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: '13px', color: 'var(--color-text-body)', lineHeight: 1.4 }}>
                {selectedLocation.address}
              </span>
            </div>

            {/* Giờ làm việc */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cawaco-teal)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ fontSize: '13px', color: 'var(--color-text-body)' }}>{selectedLocation.hours}</span>
            </div>

            {/* Số điện thoại */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 4.11a19.79 19.79 0 0 1 3.07-8.67A2 2 0 0 1 9.36 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L13.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href={`tel:${selectedLocation.phone}`} style={{ fontSize: '13px', color: 'var(--cawaco-primary)', fontWeight: '600', textDecoration: 'none' }}>
                {selectedLocation.phone.replace(/(\d{4})(\d{3})(\d{4})/, '($1) $2 $3')}
              </a>
            </div>

            {/* Nút hành động */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <a
                href={`tel:${selectedLocation.phone}`}
                className="btn btn-primary"
                style={{ textDecoration: 'none', fontSize: '13px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 4.11a19.79 19.79 0 0 1 3.07-8.67A2 2 0 0 1 9.36 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L13.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Gọi ngay
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', fontSize: '13px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                Chỉ đường
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CSS animation spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
