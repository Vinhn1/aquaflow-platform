import React from 'react';

interface EnterprisePageProps {
  onNavigate?: (tab: string) => void;
}

export const EnterprisePage: React.FC<EnterprisePageProps> = ({ onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 0 16px 0' }}>
      
      {/* Banner Khách hàng Doanh nghiệp & Cơ quan */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 100%)',
          borderRadius: '12px',
          padding: '14px 16px',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(3, 105, 161, 0.15)',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            padding: '3px 8px',
            borderRadius: '100px',
            marginBottom: '6px',
          }}
        >
          DỊCH VỤ CẤP NƯỚC DOANH NGHIỆP
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', color: '#FFF' }}>
          Cổng Dịch Vụ Cơ Quan & Doanh Nghiệp
        </h2>
        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4', margin: 0 }}>
          Giải pháp cấp nước chuyên biệt cho nhà máy, khu công nghiệp và cơ quan hành chính trên địa bàn tỉnh Cà Mau.
        </p>
      </div>

      {/* Card 1: Thỏa thuận đấu nối tuyến ống lớn */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#E0F2FE',
              color: '#0369A1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            1
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
              Thỏa thuận đấu nối tuyến ống lớn (D50 - D300)
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Dành cho dự án nhà xưởng, khu dân cư, công trình</div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.45', margin: 0, paddingLeft: '42px' }}>
          Khảo sát thực địa, thẩm định hồ sơ kỹ thuật và cấp phép thỏa thuận đấu nối trực tiếp vào mạng lưới cấp nước chính của CAWACO.
        </p>

        <div style={{ paddingLeft: '42px' }}>
          <a
            href="tel:02903836360"
            style={{
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              color: '#0284C7',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Phòng Kỹ thuật: 0290 3836 360 (Nhánh 2)</span>
          </a>
        </div>
      </div>

      {/* Card 2: Biểu giá nước sản xuất & kinh doanh dịch vụ */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            2
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
              Biểu giá nước cơ quan & sản xuất kinh doanh
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Biểu giá nước sạch ban hành mới nhất</div>
          </div>
        </div>

        <div style={{ paddingLeft: '42px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#334155' }}>Cơ quan hành chính sự nghiệp:</span>
            <strong style={{ color: '#0369A1', fontSize: '13px' }}>9.500 đ/m³</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#334155' }}>Đơn vị sản xuất vật chất:</span>
            <strong style={{ color: '#0369A1', fontSize: '13px' }}>11.800 đ/m³</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#334155' }}>Kinh doanh dịch vụ, du lịch:</span>
            <strong style={{ color: '#0369A1', fontSize: '13px' }}>15.500 đ/m³</strong>
          </div>

          <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
            * Chưa bao gồm 5% thuế VAT và 10% phí bảo vệ môi trường theo quy định.
          </div>
        </div>
      </div>

      {/* Card 3: Kiểm định đồng hồ lưu lượng cỡ lớn */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EDE9FE',
              color: '#5B21B6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            3
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
              Kiểm định đồng hồ lưu lượng cỡ lớn
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Dịch vụ đo kiểm theo tiêu chuẩn ĐLVN</div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.45', margin: 0, paddingLeft: '42px' }}>
          Thực hiện kiểm định định kỳ đồng hồ đo nước công nghiệp, cấp giấy chứng nhận kiểm định phục vụ kiểm toán môi trường và sản xuất.
        </p>
      </div>

      {/* Card 4: Quản lý & thanh toán tập trung nhiều danh bộ */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            4
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
              Quản lý tập trung & Xuất hóa đơn tổng
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Hỗ trợ doanh nghiệp chuỗi, nhiều điểm dùng nước</div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.45', margin: 0, paddingLeft: '42px' }}>
          Gộp nhiều mã danh bộ chi nhánh để nhận 1 hóa đơn điện tử tổng hợp hàng tháng, chuyển khoản VietQR hoặc ủy nhiệm chi tự động.
        </p>
      </div>
    </div>
  );
};
