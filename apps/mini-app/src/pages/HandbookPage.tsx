import React, { useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  categoryTheme: { bg: string; color: string; border: string };
  readTime: string;
  summary: string;
  icon: string;
  renderContent: () => React.ReactNode;
  tags: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'hb-01',
    title: 'Hướng dẫn đọc chỉ số đồng hồ nước cơ và điện tử chính xác',
    category: 'HUONG_DAN',
    categoryLabel: 'Hướng Dẫn Kỹ Thuật',
    categoryTheme: { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
    readTime: '3 phút đọc',
    summary: 'Cách phân biệt phần số nguyên (m³) màu đen và phần số thập phân màu đỏ trên mặt đồng hồ nước.',
    icon: 'meter',
    tags: ['Đồng hồ nước', 'Chỉ số m3', 'Đo đếm'],
    renderContent: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Section 1: Dong ho co */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'var(--cawaco-primary, #0369A1)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>1</span>
            <strong style={{ fontSize: '13px', color: '#0F172A' }}>Đồng hồ nước cơ (Hộp số cơ học)</strong>
          </div>

          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: '0 0 10px' }}>
            Mặt số đồng hồ cơ tiêu chuẩn gồm dãy chữ số màu đen và các kim quay hoặc số màu đỏ.
          </p>

          {/* Minh hoa truc quan o so */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {['0', '0', '1', '4', '5'].map((num, i) => (
                <span key={i} style={{ width: '26px', height: '36px', backgroundColor: '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', fontFamily: 'monospace' }}>
                  {num}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
              {['6', '2'].map((num, i) => (
                <span key={i} style={{ width: '26px', height: '36px', backgroundColor: '#DC2626', color: '#FFFFFF', border: '1px solid #EF4444', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', fontFamily: 'monospace' }}>
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '11px', fontWeight: '700', marginBottom: '10px' }}>
            <span style={{ color: '#0369A1' }}>▲ Dãy số ĐEN: 145 m³ (Tính tiền)</span>
            <span style={{ color: '#DC2626' }}>▲ Dãy số ĐỎ: Lít (Không tính)</span>
          </div>

          <div style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #0369A1', fontSize: '11.5px', color: '#1E40AF', lineHeight: '1.45' }}>
            <strong>Quy tắc chốt số:</strong> Nhân viên ghi thu CAWACO chỉ ghi nhận <strong>dãy chữ số màu đen</strong> để lập hóa đơn tiền nước. Dãy số đỏ dùng để quan sát lưu lượng rò rỉ nhỏ.
          </div>
        </div>

        {/* Section 2: Dong ho dien tu */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#0D9488', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>2</span>
            <strong style={{ fontSize: '13px', color: '#0F172A' }}>Đồng hồ nước điện tử (Màn hình LCD)</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
            Chỉ số hiển thị trực tiếp trên màn hình kỹ thuật số dưới dạng <code>145.62 m³</code>. Khi theo dõi, quý khách chỉ cần đọc phần số nguyên đứng trước dấu chấm (<strong>145</strong>).
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'hb-02',
    title: 'Cách tự kiểm tra và phát hiện rò rỉ đường ống nước ngầm trong nhà',
    category: 'TIET_KIEM',
    categoryLabel: 'Mẹo Tiết Kiệm & An Toàn',
    categoryTheme: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    readTime: '4 phút đọc',
    summary: 'Quy trình 3 bước đơn giản giúp bạn phát hiện thất thoát nước âm tường hoặc dưới nền nhà.',
    icon: 'leak',
    tags: ['Rò rỉ nước', 'Tiết kiệm', 'Bảo trì'],
    renderContent: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', gap: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
            1
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '3px' }}>Khóa toàn bộ van & vòi nước trong nhà</strong>
            <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.45', margin: 0 }}>
              Đóng chặt tất cả vòi lavabo, vòi sen, ngắt máy giặt và không cho nước xả vào bồn chứa.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
            2
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '3px' }}>Quan sát kim quay hình sao trên đồng hồ</strong>
            <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.45', margin: 0 }}>
              Nếu <strong>kim hình sao màu đỏ (hoặc bánh răng phụ)</strong> vẫn quay chầm chậm khi không có thiết bị nào mở nước → <strong>Đường ống âm tường/ngầm đang bị rò rỉ</strong>.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', gap: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
            3
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '3px' }}>Kiểm tra van phao bồn nước & két nước bồn cầu</strong>
            <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.45', margin: 0 }}>
              Hơn 80% trường hợp hóa đơn tăng vọt bắt nguồn từ việc van phao bồn cầu bị hở gioăng cao su, khiến nước chảy tràn liên tục vào cống thoát ngầm.
            </p>
          </div>
        </div>

        {/* Canh bao */}
        <div style={{ backgroundColor: '#FFFBEB', borderRadius: '10px', padding: '12px', border: '1px solid #FDE68A', display: 'flex', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div style={{ fontSize: '11.5px', color: '#92400E', lineHeight: '1.45' }}>
            <strong>Khuyến cáo:</strong> Nếu phát hiện rò rỉ phía trước đồng hồ (ngoài đường), hãy dùng tính năng <strong>"Báo sự cố"</strong> để thợ CAWACO đến sửa chữa miễn phí.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'hb-03',
    title: 'Biểu giá nước sinh hoạt và cách tính tiền nước bậc thang tại Cà Mau',
    category: 'CHINH_SACH',
    categoryLabel: 'Biểu Giá & Chính Sách',
    categoryTheme: { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
    readTime: '5 phút đọc',
    summary: 'Chi tiết 4 bậc giá nước sinh hoạt hộ gia đình và cách tính thuế VAT 5%, phí bảo vệ môi trường 10%.',
    icon: 'tariff',
    tags: ['Giá nước', 'Bậc thang', 'Biểu giá'],
    renderContent: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Table 4 bac thang */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderBottom: '1px solid #E2E8F0', fontWeight: '700', fontSize: '12.5px', color: '#0F172A' }}>
            Biểu giá nước sinh hoạt hộ dân cư TP. Cà Mau
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { tier: 'Bậc 1', range: 'Từ 1 - 10 m³/tháng', price: '6.800 đ/m³', bg: '#F0FDF4', color: '#166534' },
              { tier: 'Bậc 2', range: 'Từ 11 - 20 m³/tháng', price: '8.200 đ/m³', bg: '#EFF6FF', color: '#1E40AF' },
              { tier: 'Bậc 3', range: 'Từ 21 - 30 m³/tháng', price: '10.500 đ/m³', bg: '#FEF3C7', color: '#92400E' },
              { tier: 'Bậc 4', range: 'Trên 30 m³/tháng', price: '13.000 đ/m³', bg: '#FEE2E2', color: '#991B1B' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderBottom: idx < 3 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: item.bg, color: item.color, fontWeight: '700', fontSize: '10.5px' }}>
                    {item.tier}
                  </span>
                  <span style={{ fontSize: '12px', color: '#334155' }}>{item.range}</span>
                </div>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>{item.price}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Phi va thue */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong style={{ fontSize: '12.5px', color: '#0F172A' }}>Các khoản thu bổ sung theo quy định pháp luật:</strong>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', paddingTop: '4px' }}>
            <span>1. Thuế Giá trị gia tăng (VAT):</span>
            <strong>5% tiền nước</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
            <span>2. Phí bảo vệ môi trường đối với nước thải:</span>
            <strong>10% tiền nước</strong>
          </div>
          <div style={{ borderTop: '1px solid #CBD5E1', marginTop: '6px', paddingTop: '6px', fontSize: '11px', color: 'var(--cawaco-primary, #0369A1)', fontWeight: '700' }}>
            Tổng thanh toán = Tiền nước + Thuế VAT (5%) + Phí BVMT (10%)
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'hb-04',
    title: 'Quy chuẩn chất lượng nước sạch QCVN 01-1:2018/BYT tại CAWACO',
    category: 'CHAT_LUONG',
    categoryLabel: 'Tiêu Chuẩn QCVN',
    categoryTheme: { bg: '#FCE7F3', color: '#9D174D', border: '#FBCFE8' },
    readTime: '3 phút đọc',
    summary: 'Các chỉ số xét nghiệm ngoại kiểm hóa lý và vi sinh định kỳ của phòng thí nghiệm CAWACO.',
    icon: 'quality',
    tags: ['QCVN 01-1:2018/BYT', 'Chất lượng nước', 'Xét nghiệm'],
    renderContent: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Certificate Card */}
        <div style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)', color: '#FFFFFF', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', color: '#A7F3D0' }}>CHỨNG NHẬN ĐẠT CHUẨN BỘ Y TẾ</span>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>QCVN 01-1:2018/BYT</h3>
          <p style={{ fontSize: '11.5px', color: '#E6FFFA', lineHeight: '1.45', margin: 0 }}>
            Nguồn nước sinh hoạt do CAWACO cung cấp được kiểm định nghiêm ngặt bởi Trung tâm Kiểm soát Bệnh tật tỉnh Cà Mau (CDC Cà Mau).
          </p>
        </div>

        {/* 3 chi tieu cot loi */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Clo dư tự do</span>
            <strong style={{ fontSize: '12.5px', color: '#0369A1' }}>0.2 - 1.0 mg/L</strong>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Độ đục (NTU)</span>
            <strong style={{ fontSize: '12.5px', color: '#059669' }}>≤ 2.0 NTU</strong>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '10px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>E.Coli / Coliform</span>
            <strong style={{ fontSize: '12.5px', color: '#7C3AED' }}>0 CFU/100ml</strong>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
          Hàm lượng Clo dư tự do tại vòi người tiêu dùng luôn duy trì trong ngưỡng chuẩn để đảm bảo khử trùng và an toàn tuyệt đối trong suốt quá trình dẫn truyền mạng lưới đường ống.
        </p>
      </div>
    ),
  },
];

export const HandbookPage: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="subpage-container">
      {selectedArticle ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Back button */}
          <button
            onClick={() => setSelectedArticle(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'var(--cawaco-primary, #0369A1)', fontWeight: '700',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Quay lại danh mục sổ tay</span>
          </button>

          {/* Category Badge & Read Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700',
                backgroundColor: selectedArticle.categoryTheme.bg,
                color: selectedArticle.categoryTheme.color,
                border: `1px solid ${selectedArticle.categoryTheme.border}`,
              }}
            >
              {selectedArticle.categoryLabel}
            </span>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
              • {selectedArticle.readTime}
            </span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', lineHeight: '1.4', margin: 0 }}>
            {selectedArticle.title}
          </h2>

          {/* Render Rich Interactive Article Content */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
            {selectedArticle.renderContent()}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
            {selectedArticle.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px',
                  backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '600',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Header Banner */}
          <div className="subpage-banner-hero">
            <span className="subpage-banner-badge">CẨM NANG NGƯỜI DÙNG NƯỚC</span>
            <h2 className="subpage-banner-title">Sổ Tay Hướng Dẫn &amp; Sử Dụng Nước Sạch</h2>
            <p className="subpage-banner-desc">
              Hướng dẫn đọc đồng hồ, tự kiểm tra rò rỉ ngầm, biểu giá bậc thang và tiêu chuẩn an toàn nước sạch CAWACO.
            </p>
          </div>

          {/* Article List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ARTICLES.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="card"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  border: '1px solid #E2E8F0',
                  marginBottom: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: '700',
                      backgroundColor: art.categoryTheme.bg,
                      color: art.categoryTheme.color,
                      border: `1px solid ${art.categoryTheme.border}`,
                    }}
                  >
                    {art.categoryLabel}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '600' }}>
                    {art.readTime}
                  </span>
                </div>

                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0, lineHeight: '1.35' }}>
                  {art.title}
                </h3>

                <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.45', margin: 0 }}>
                  {art.summary}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: '11px', color: 'var(--cawaco-primary, #0369A1)', fontWeight: '700' }}>
                    Xem cẩm nang chi tiết →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
