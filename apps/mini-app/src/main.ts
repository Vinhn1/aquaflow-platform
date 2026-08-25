import { MockUser, MockLinkedMeter, MockInvoice, MockNews, MockBranch, MockQueueTicket } from './types';

// State Management
const state = {
  activeTab: 'HOME' as 'HOME' | 'NEWS' | 'MAP' | 'ACCOUNT',
  currentUser: {
    id: 'usr-zalo-8891',
    zaloId: 'zalo_user_cawaco_01',
    fullName: 'Nguyễn Văn An',
    phone: '0918 234 567',
    avatarText: 'AN',
  } as MockUser,
  meters: [
    {
      id: 'm1',
      customerCode: 'CM102938',
      ownerName: 'NGUYỄN VĂN AN',
      address: 'Số 204, đường Quang Trung, P. Tân Thành, TP. Cà Mau',
      label: 'Nhà riêng',
      isDefault: true,
      meterSerialNumber: 'MTR-88291',
    },
    {
      id: 'm2',
      customerCode: 'CM204819',
      ownerName: 'NGUYỄN THỊ MAI',
      address: 'Khóm 4, Phường 5, TP. Cà Mau',
      label: 'Nhà ba mẹ',
      isDefault: false,
      meterSerialNumber: 'MTR-99102',
    },
  ] as MockLinkedMeter[],
  activeMeterCode: 'CM102938',
  invoices: [
    {
      id: 'inv-082026',
      invoiceCode: 'INV-2026-08-001',
      customerCode: 'CM102938',
      period: 'Kỳ 08/2026',
      previousIndex: 120,
      currentIndex: 145,
      consumptionM3: 25,
      baseAmount: 195000,
      vatAmount: 9750,
      environmentalFeeAmount: 19500,
      totalAmount: 224250,
      status: 'UNPAID',
      dueDate: '05/09/2026',
    },
    {
      id: 'inv-072026',
      invoiceCode: 'INV-2026-07-001',
      customerCode: 'CM102938',
      period: 'Kỳ 07/2026',
      previousIndex: 98,
      currentIndex: 120,
      consumptionM3: 22,
      baseAmount: 166200,
      vatAmount: 8310,
      environmentalFeeAmount: 16620,
      totalAmount: 191130,
      status: 'PAID',
      dueDate: '05/08/2026',
    },
  ] as MockInvoice[],
  newsList: [
    {
      id: 'n1',
      title: 'Thông báo tạm ngưng cấp nước phục vụ đấu nối mạng lưới tuyến đường Quang Trung',
      summary: 'Công ty Cổ phần Cấp nước Cà Mau trân trọng thông báo tạm ngưng cung cấp nước sạch để thi công đấu nối tuyến ống D300.',
      category: 'OUTAGE',
      isOutageAlert: true,
      affectedArea: 'Khu vực Phường Tân Thành và một phần Phường 5, TP. Cà Mau',
      outageTime: 'Từ 22:00 ngày 28/08/2026 đến 04:00 ngày 29/08/2026',
      publishedAt: '26/08/2026',
    },
    {
      id: 'n2',
      title: 'Khuyến cáo người dân bảo vệ đồng hồ nước và an toàn sử dụng nước sạch trong mùa mưa bão',
      summary: 'Các biện pháp kiểm tra van khóa, chống ngập úng và bảo vệ hộp bảo vệ cụm thủy lượng kế tại hộ gia đình.',
      category: 'SAFETY',
      isOutageAlert: false,
      publishedAt: '25/08/2026',
    },
    {
      id: 'n3',
      title: 'Áp dụng biểu giá nước sạch sinh hoạt mới theo Quyết định số 13/2023/QĐ-UBND tỉnh Cà Mau',
      summary: 'Chi tiết bảng giá lũy tiến 4 bậc thang dành cho hộ dân cư sinh hoạt và các cơ quan, đơn vị sản xuất kinh doanh.',
      category: 'TARIFF',
      isOutageAlert: false,
      publishedAt: '20/08/2026',
    },
  ] as MockNews[],
  branches: [
    {
      id: 'b1',
      code: 'CM-HQ-01',
      name: 'Trụ sở chính & Phòng Giao dịch Khách hàng CAWACO',
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      type: 'HEADQUARTERS',
      phone: '0290 3836 360',
      workingHours: 'Sáng: 07:00 - 11:00 | Chiều: 13:00 - 17:00 (Thứ 2 - Thứ 6)',
      distanceKm: 0.8,
      lat: 9.1768,
      lng: 105.1502,
    },
    {
      id: 'b2',
      code: 'CM-BR-02',
      name: 'Điểm thu tiền nước & Tiếp nhận khách hàng Phường 5',
      address: 'Đường Trần Hưng Đạo, Phường 5, TP. Cà Mau',
      type: 'PAYMENT_POINT',
      phone: '0290 3836 723',
      workingHours: '07:30 - 16:30 (Thứ 2 - Thứ 7)',
      distanceKm: 2.3,
      lat: 9.1824,
      lng: 105.1432,
    },
    {
      id: 'b3',
      code: 'CM-BR-03',
      name: 'Xí nghiệp Cấp nước Huyện Trần Văn Thời',
      address: 'Thị trấn Trần Văn Thời, Huyện Trần Văn Thời, Tỉnh Cà Mau',
      type: 'BRANCH',
      phone: '0290 3895 112',
      workingHours: '07:00 - 17:00 (Thứ 2 - Thứ 6)',
      distanceKm: 28.5,
      lat: 9.1121,
      lng: 104.9812,
    },
  ] as MockBranch[],
  activeTicket: null as MockQueueTicket | null,
};

// UI Render Helpers
function getActiveMeter(): MockLinkedMeter {
  return state.meters.find((m) => m.customerCode === state.activeMeterCode) || state.meters[0];
}

function getActiveInvoice(): MockInvoice | undefined {
  return state.invoices.find((inv) => inv.customerCode === state.activeMeterCode);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Render Top Header
function renderHeader() {
  const container = document.getElementById('header-container');
  if (!container) return;

  const currentMeter = getActiveMeter();

  container.innerHTML = `
    <div class="app-header">
      <div class="header-top">
        <div class="user-profile">
          <div class="user-avatar">${state.currentUser.avatarText}</div>
          <div class="user-info">
            <div class="user-name">${state.currentUser.fullName}</div>
            <div class="user-phone">${state.currentUser.phone}</div>
          </div>
        </div>
      </div>
      <div class="meter-selector" id="btn-select-meter">
        <div>
          <span style="opacity: 0.8; font-size: 11px;">MÃ DANH BỘ ĐANG XEM:</span><br/>
          <strong>${currentMeter.customerCode}</strong> - ${currentMeter.label}
        </div>
        <span style="font-weight: bold;">[Đổi]</span>
      </div>
    </div>
  `;

  document.getElementById('btn-select-meter')?.addEventListener('click', () => {
    openSwitchMeterModal();
  });
}

// Render Bottom Navigation
function renderBottomNav() {
  const container = document.getElementById('bottom-nav-container');
  if (!container) return;

  container.innerHTML = `
    <div class="bottom-nav">
      <div class="nav-tab ${state.activeTab === 'HOME' ? 'active' : ''}" data-tab="HOME">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Trang chủ</span>
      </div>
      <div class="nav-tab ${state.activeTab === 'NEWS' ? 'active' : ''}" data-tab="NEWS">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
        <span>Tin tức</span>
      </div>
      <div class="nav-tab ${state.activeTab === 'MAP' ? 'active' : ''}" data-tab="MAP">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
        <span>Bản đồ</span>
      </div>
      <div class="nav-tab ${state.activeTab === 'ACCOUNT' ? 'active' : ''}" data-tab="ACCOUNT">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Tài khoản</span>
      </div>
    </div>
  `;

  container.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const targetTab = (e.currentTarget as HTMLElement).getAttribute('data-tab') as any;
      if (targetTab) {
        state.activeTab = targetTab;
        renderBottomNav();
        renderMainContent();
      }
    });
  });
}

// Views
function renderHomeView(): string {
  const currentInvoice = getActiveInvoice();
  const currentMeter = getActiveMeter();

  return `
    <!-- Ticker Notice -->
    <div class="ticker-card">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E67E22" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <div><strong>Thông báo:</strong> Cúp nước phục vụ sửa chữa tuyến Quang Trung đêm 28/08.</div>
    </div>

    <!-- Active Queue Ticket Widget (If booked) -->
    ${state.activeTicket ? `
      <div class="card" style="background: #E6F4FF; border-color: #0B6BCB;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #004B87;">Vé Bốc Số Trực Tuyến</strong>
          <span class="badge" style="background: #0B6BCB; color: #fff;">${state.activeTicket.status === 'WAITING' ? 'Đang chờ phục vụ' : 'Đang phục vụ'}</span>
        </div>
        <div style="font-size: 24px; font-weight: 700; color: #0B6BCB; margin: 4px 0;">Mã vé: ${state.activeTicket.ticketNumber}</div>
        <div style="font-size: 13px; color: #1E293B;">Dịch vụ: ${state.activeTicket.serviceName}</div>
        <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Ước tính: còn <strong>${state.activeTicket.positionInQueue}</strong> người phía trước (~${state.activeTicket.estimatedWaitMinutes} phút)</div>
      </div>
    ` : ''}

    <!-- Hero Invoice Card -->
    <div class="card bill-hero-card">
      <div class="bill-header">
        <span style="font-size: 13px; font-weight: 600; color: var(--color-text-muted);">HÓA ĐƠN TIỀN NƯỚC</span>
        <span class="badge ${currentInvoice?.status === 'UNPAID' ? 'badge-unpaid' : 'badge-paid'}">
          ${currentInvoice?.status === 'UNPAID' ? 'Chưa thanh toán' : 'Đã thanh toán'}
        </span>
      </div>
      <div class="bill-amount">${currentInvoice ? formatCurrency(currentInvoice.totalAmount) : '0 đ'}</div>
      <div class="bill-meta">
        ${currentInvoice ? `${currentInvoice.period} | Tiêu thụ: ${currentInvoice.consumptionM3} m³ | Hạn: ${currentInvoice.dueDate}` : 'Không có hóa đơn nợ'}
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary" id="btn-pay-vietqr">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
          Thanh toán VietQR
        </button>
        <button class="btn btn-secondary" id="btn-view-invoice-detail" style="width: auto;">
          Chi tiết
        </button>
      </div>
    </div>

    <!-- 6 Bento Quick Actions -->
    <div class="section-title">Tiện ích Dịch vụ Nước</div>
    <div class="bento-grid">
      <div class="bento-item" id="btn-action-lookup">
        <div class="bento-icon icon-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div class="bento-label">Tra cứu<br/>Tiền nước</div>
      </div>
      <div class="bento-item" id="btn-action-queue">
        <div class="bento-icon icon-cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="bento-label">Bốc số<br/>Trực tuyến</div>
      </div>
      <div class="bento-item" id="btn-action-complaint">
        <div class="bento-icon icon-amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="bento-label">Báo sự cố<br/>Rò rỉ nước</div>
      </div>
      <div class="bento-item" id="btn-action-self-reading">
        <div class="bento-icon icon-green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="bento-label">Ghi chỉ số<br/>Tự đọc</div>
      </div>
      <div class="bento-item" id="btn-action-new-contract">
        <div class="bento-icon icon-purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        </div>
        <div class="bento-label">Đăng ký<br/>Cấp nước</div>
      </div>
      <div class="bento-item" id="btn-action-hotline">
        <div class="bento-icon icon-red">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div class="bento-label">Tổng đài<br/>Hỗ trợ</div>
      </div>
    </div>
  `;
}

function renderNewsView(): string {
  return `
    <div class="section-title">Tin tức & Cảnh báo Cúp nước</div>
    <div style="display: flex; gap: 8px; overflow-x: auto; margin-bottom: 14px; padding-bottom: 4px;">
      <button class="badge" style="background: var(--color-primary); color: #fff; border: none; cursor: pointer;">Tất cả</button>
      <button class="badge" style="background: var(--color-surface); color: var(--color-text-main); border: 1px solid var(--color-border); cursor: pointer;">Lịch cúp nước</button>
      <button class="badge" style="background: var(--color-surface); color: var(--color-text-main); border: 1px solid var(--color-border); cursor: pointer;">Chính sách giá</button>
    </div>

    ${state.newsList.map((item) => `
      <div class="card" style="${item.isOutageAlert ? 'border-left: 4px solid var(--color-accent);' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span class="badge ${item.isOutageAlert ? 'badge-unpaid' : 'badge-paid'}">
            ${item.isOutageAlert ? 'Lịch cúp nước' : 'Tin tức CAWACO'}
          </span>
          <span style="font-size: 11px; color: var(--color-text-muted);">${item.publishedAt}</span>
        </div>
        <div style="font-size: 14px; font-weight: 700; color: var(--color-text-main); margin-bottom: 6px; line-height: 1.4;">
          ${item.title}
        </div>
        <div style="font-size: 13px; color: var(--color-text-muted); line-height: 1.4; margin-bottom: 8px;">
          ${item.summary}
        </div>
        ${item.affectedArea ? `
          <div style="background: var(--color-accent-light); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px; color: var(--color-accent);">
            <strong>Khu vực:</strong> ${item.affectedArea}<br/>
            <strong>Thời gian:</strong> ${item.outageTime}
          </div>
        ` : ''}
      </div>
    `).join('')}
  `;
}

function renderMapView(): string {
  return `
    <div class="section-title">Điểm Giao dịch & Thu tiền Nước</div>
    <div style="background: #E2E8F0; height: 180px; border-radius: var(--radius-lg); margin-bottom: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--color-border); text-align: center; padding: 16px;">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <div style="font-size: 14px; font-weight: 700; color: var(--color-primary); margin-top: 8px;">Bản đồ Số Cấp Nước Cà Mau</div>
      <div style="font-size: 12px; color: var(--color-text-muted);">Đang định vị 3 điểm giao dịch gần bạn nhất</div>
    </div>

    ${state.branches.map((b) => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <div style="font-size: 14px; font-weight: 700; color: var(--color-primary);">${b.name}</div>
          <span class="badge" style="background: #E6F4FF; color: #0B6BCB;">Cách ${b.distanceKm} km</span>
        </div>
        <div style="font-size: 13px; color: var(--color-text-main); margin-bottom: 4px;">
          <strong>Địa chỉ:</strong> ${b.address}
        </div>
        <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 4px;">
          <strong>Giờ làm việc:</strong> ${b.workingHours}
        </div>
        <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 12px;">
          <strong>Hotline:</strong> <a href="tel:${b.phone.replace(/\s+/g, '')}" style="color: var(--color-primary); font-weight: 600;">${b.phone}</a>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" onclick="alert('Đang mở dẫn đường tới: ' + '${b.name}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Chỉ đường
          </button>
          <a href="tel:${b.phone.replace(/\s+/g, '')}" class="btn btn-secondary" style="text-decoration: none;">
            Gọi điện
          </a>
        </div>
      </div>
    `).join('')}
  `;
}

function renderAccountView(): string {
  return `
    <div class="section-title">Tài khoản & Quản lý Đồng hồ nước</div>
    
    <!-- Zalo Profile Card -->
    <div class="card" style="display: flex; align-items: center; gap: 14px;">
      <div class="user-avatar" style="width: 54px; height: 54px; font-size: 20px;">
        ${state.currentUser.avatarText}
      </div>
      <div>
        <div style="font-size: 16px; font-weight: 700;">${state.currentUser.fullName}</div>
        <div style="font-size: 13px; color: var(--color-text-muted);">SĐT: ${state.currentUser.phone}</div>
        <span class="badge" style="background: #E8F8F0; color: #2ECC71; margin-top: 4px; display: inline-block;">
          Đã xác thực tài khoản Zalo
        </span>
      </div>
    </div>

    <!-- Linked Meters Management -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <div class="section-title" style="margin-bottom: 0;">Mã Danh Bộ Đã Liên Kết (${state.meters.length})</div>
      <button class="btn btn-secondary" id="btn-add-meter" style="width: auto; padding: 6px 12px; font-size: 12px;">
        + Thêm mã mới
      </button>
    </div>

    ${state.meters.map((m) => `
      <div class="card" style="${m.customerCode === state.activeMeterCode ? 'border: 2px solid var(--color-primary);' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong>${m.label}</strong>
          ${m.isDefault ? '<span class="badge" style="background: #E6F4FF; color: #0B6BCB;">Mặc định</span>' : ''}
        </div>
        <div style="font-size: 13px; color: var(--color-text-muted);">Mã danh bộ: <strong>${m.customerCode}</strong></div>
        <div style="font-size: 13px; color: var(--color-text-muted);">Chủ hộ: ${m.ownerName}</div>
        <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 2px;">Địa chỉ: ${m.address}</div>
      </div>
    `).join('')}

    <!-- Help & Support -->
    <div class="card" style="margin-top: 20px;">
      <div style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Tổng đài Chăm sóc Khách hàng</div>
      <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 12px;">
        Hỗ trợ giải đáp hóa đơn, cấp nước và phản ánh sự cố 24/7.
      </div>
      <a href="tel:02903836360" class="btn btn-primary" style="text-decoration: none;">
        Gọi 0290 3836 360
      </a>
    </div>
  `;
}

// Modal Handlers
function openModal(title: string, contentHtml: string) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="bottom-sheet">
      <div class="sheet-header">
        <div class="sheet-title">${title}</div>
        <button class="close-btn" id="modal-close">&times;</button>
      </div>
      <div class="sheet-body">${contentHtml}</div>
    </div>
  `;

  modalContainer.classList.remove('hidden');
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
}

function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) modalContainer.classList.add('hidden');
}

function openSwitchMeterModal() {
  const html = `
    <div style="margin-bottom: 16px;">Chọn mã danh bộ bạn muốn theo dõi hóa đơn và lịch cúp nước:</div>
    ${state.meters.map((m) => `
      <div class="card meter-option" data-code="${m.customerCode}" style="cursor: pointer; ${m.customerCode === state.activeMeterCode ? 'background: #E6F4FF; border-color: #0B6BCB;' : ''}">
        <div style="font-weight: 700; font-size: 14px;">${m.label} (${m.customerCode})</div>
        <div style="font-size: 12px; color: var(--color-text-muted);">${m.address}</div>
      </div>
    `).join('')}
  `;
  openModal('Đổi Mã Danh Bộ Theo Dõi', html);

  document.querySelectorAll('.meter-option').forEach((el) => {
    el.addEventListener('click', (e) => {
      const code = (e.currentTarget as HTMLElement).getAttribute('data-code');
      if (code) {
        state.activeMeterCode = code;
        closeModal();
        renderHeader();
        renderMainContent();
      }
    });
  });
}

function openVietQrModal() {
  const invoice = getActiveInvoice();
  if (!invoice) return;

  const html = `
    <div style="text-align: center;">
      <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 8px;">
        Quét mã bằng ứng dụng ngân hàng bất kỳ để thanh toán tự động
      </div>
      <!-- Mock Dynamic VietQR Container -->
      <div style="background: #ffffff; padding: 16px; border-radius: var(--radius-md); border: 2px dashed #0B6BCB; display: inline-block; margin-bottom: 12px;">
        <svg width="180" height="180" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#fff"/>
          <rect x="20" y="20" width="50" height="50" fill="#004B87"/>
          <rect x="130" y="20" width="50" height="50" fill="#004B87"/>
          <rect x="20" y="130" width="50" height="50" fill="#004B87"/>
          <rect x="30" y="30" width="30" height="30" fill="#fff"/>
          <rect x="140" y="30" width="30" height="30" fill="#fff"/>
          <rect x="30" y="140" width="30" height="30" fill="#fff"/>
          <circle cx="100" cy="100" r="16" fill="#0B6BCB"/>
          <text x="100" y="105" font-size="10" fill="#fff" text-anchor="middle" font-weight="bold">VIETQR</text>
        </svg>
      </div>
      <div style="font-size: 22px; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">
        ${formatCurrency(invoice.totalAmount)}
      </div>
      <div style="font-size: 13px; color: var(--color-text-main); margin-bottom: 16px;">
        <strong>Nội dung CK:</strong> ${invoice.customerCode} ${invoice.period.replace('/', '')}
      </div>
      <button class="btn btn-primary" id="btn-simulate-paid">
        Mô phỏng Thanh toán Thành công
      </button>
    </div>
  `;
  openModal('Thanh Toán Tiền Nước Qua VietQR', html);

  document.getElementById('btn-simulate-paid')?.addEventListener('click', () => {
    invoice.status = 'PAID';
    closeModal();
    renderMainContent();
    alert('Thanh toán thành công! Hóa đơn đã được gạch nợ trên hệ thống CAWACO.');
  });
}

function openInvoiceDetailModal() {
  const invoice = getActiveInvoice();
  if (!invoice) return;

  const html = `
    <div style="font-size: 13px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>Mã hóa đơn:</span><strong>${invoice.invoiceCode}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>Kỳ tiêu thụ:</span><strong>${invoice.period}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>Chỉ số cũ - mới:</span><strong>${invoice.previousIndex} -> ${invoice.currentIndex}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span>Tổng lượng tiêu thụ:</span><strong>${invoice.consumptionM3} m³</strong>
      </div>
      
      <div style="border-top: 1px dashed var(--color-border); padding-top: 10px; margin-bottom: 10px;">
        <div style="font-weight: 600; margin-bottom: 6px;">Bảng kê tiền nước (QĐ 13/2023 Cà Mau):</div>
        <div style="display: flex; justify-content: space-between; color: var(--color-text-muted); margin-bottom: 4px;">
          <span>Bậc 1 (1-10 m³ x 6.600đ):</span><span>66.000 đ</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--color-text-muted); margin-bottom: 4px;">
          <span>Bậc 2 (11-20 m³ x 8.100đ):</span><span>81.000 đ</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--color-text-muted); margin-bottom: 4px;">
          <span>Bậc 3 (21-25 m³ x 9.600đ):</span><span>48.000 đ</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px;">
          <span>Tiền nước chưa thuế:</span><strong>${formatCurrency(invoice.baseAmount)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span>Thuế GTGT (5%):</span><strong>${formatCurrency(invoice.vatAmount)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span>Phí bảo vệ môi trường (10%):</span><strong>${formatCurrency(invoice.environmentalFeeAmount)}</strong>
        </div>
      </div>

      <div style="border-top: 2px solid var(--color-primary); padding-top: 10px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: var(--color-primary);">
        <span>Tổng thanh toán:</span><span>${formatCurrency(invoice.totalAmount)}</span>
      </div>
    </div>
  `;
  openModal('Chi Tiết Tiền Nước ' + invoice.period, html);
}

function openQueueModal() {
  const html = `
    <div class="form-group">
      <label class="form-label">Chọn Chi Nhánh / Quầy Giao Dịch:</label>
      <select class="form-select" id="queue-branch">
        <option value="b1">Trụ sở chính - 204 Quang Trung, P. Tân Thành, TP. Cà Mau</option>
        <option value="b2">Điểm thu tiền nước Phường 5, TP. Cà Mau</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Chọn Dịch Vụ Cần Thực Hiện:</label>
      <select class="form-select" id="queue-service">
        <option value="NEW_METER_REGISTRATION">Đăng ký lắp đặt mới đồng hồ nước</option>
        <option value="BILLING_PAYMENT">Thu tiền nước & Tra cứu hóa đơn</option>
        <option value="CONTRACT_TRANSFER">Sang tên / Đổi thông tin hợp đồng</option>
        <option value="COMPLAINT_INSPECTION">Khiếu nại & Kiểm định đồng hồ nước</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Tên Người Đặt Số:</label>
      <input type="text" class="form-input" id="queue-name" value="${state.currentUser.fullName}" />
    </div>
    <button class="btn btn-primary" id="btn-submit-queue">
      Lấy Số Thứ Tự Điện Tử
    </button>
  `;
  openModal('Bốc Số Giao Dịch Trực Tuyến', html);

  document.getElementById('btn-submit-queue')?.addEventListener('click', () => {
    const serviceName = (document.getElementById('queue-service') as HTMLSelectElement).selectedOptions[0].text;
    state.activeTicket = {
      ticketNumber: 'A-' + Math.floor(100 + Math.random() * 900),
      branchName: 'Trụ sở 204 Quang Trung, P. Tân Thành',
      serviceName: serviceName,
      status: 'WAITING',
      positionInQueue: 3,
      estimatedWaitMinutes: 15,
      issuedAt: new Date().toLocaleTimeString('vi-VN'),
    };
    closeModal();
    renderMainContent();
    alert(`Bốc số thành công! Mã vé của bạn là: ${state.activeTicket.ticketNumber}`);
  });
}

function openComplaintModal() {
  const html = `
    <div class="form-group">
      <label class="form-label">Loại Sự Cố:</label>
      <select class="form-select" id="comp-category">
        <option value="PIPE_BURST_LEAK">Bể đường ống / Rò rỉ nước tràn mặt đường</option>
        <option value="TURBID_DIRTY_WATER">Nước bị đục / Có cặn bẩn</option>
        <option value="LOW_WATER_PRESSURE">Áp lực nước yếu / Không có nước</option>
        <option value="METER_DEFECT">Đồng hồ nước bị kẹt / Hư hỏng chì niêm</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Vị Trí Hiện Tại (Tọa độ GPS):</label>
      <input type="text" class="form-input" value="9.1768, 105.1502 (Gần 204 Quang Trung, TP. Cà Mau)" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Mô Tả Chi Tiết Sự Cố:</label>
      <textarea class="form-textarea" id="comp-desc" rows="3" placeholder="Mô tả cụ thể vị trí và tình trạng rò rỉ..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Hình Ảnh Hiện Trường (Tối đa 3 ảnh):</label>
      <input type="file" class="form-input" accept="image/*" />
    </div>
    <button class="btn btn-primary" id="btn-submit-comp">
      Gửi Báo Cáo Sự Cố
    </button>
  `;
  openModal('Phản Ánh Sự Cố Nước Khẩn Cấp', html);

  document.getElementById('btn-submit-comp')?.addEventListener('click', () => {
    closeModal();
    alert('Đã gửi phản ánh thành công! Đội kỹ thuật CAWACO đã tiếp nhận và sẽ liên hệ xử lý.');
  });
}

function openSelfReadingModal() {
  const html = `
    <div class="form-group">
      <label class="form-label">Mã Danh Bộ:</label>
      <input type="text" class="form-input" value="${state.activeMeterCode}" readonly />
    </div>
    <div class="form-group">
      <label class="form-label">Nhập Chỉ Số Đồng Hồ Nước Mới:</label>
      <input type="number" class="form-input" id="reading-value" placeholder="Ví dụ: 145" />
    </div>
    <div class="form-group">
      <label class="form-label">Chụp Ảnh Mặt Đồng Hồ Nước Đối Soát:</label>
      <input type="file" class="form-input" accept="image/*" />
    </div>
    <button class="btn btn-primary" id="btn-submit-reading">
      Gửi Chỉ Số Nước
    </button>
  `;
  openModal('Tự Gửi Chỉ Số Nước Kỳ Này', html);

  document.getElementById('btn-submit-reading')?.addEventListener('click', () => {
    closeModal();
    alert('Gửi chỉ số thành công! Dữ liệu đã được lưu vào hệ thống đối soát kỳ ghi số.');
  });
}

// Render Main Content
function renderMainContent() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  if (state.activeTab === 'HOME') {
    mainContent.innerHTML = renderHomeView();
    // Attach Home Event Handlers
    document.getElementById('btn-pay-vietqr')?.addEventListener('click', openVietQrModal);
    document.getElementById('btn-view-invoice-detail')?.addEventListener('click', openInvoiceDetailModal);
    document.getElementById('btn-action-lookup')?.addEventListener('click', openInvoiceDetailModal);
    document.getElementById('btn-action-queue')?.addEventListener('click', openQueueModal);
    document.getElementById('btn-action-complaint')?.addEventListener('click', openComplaintModal);
    document.getElementById('btn-action-self-reading')?.addEventListener('click', openSelfReadingModal);
    document.getElementById('btn-action-new-contract')?.addEventListener('click', () => {
      alert('Đang mở biểu mẫu nộp hồ sơ lắp đặt mới bộ thủy lượng kế...');
    });
    document.getElementById('btn-action-hotline')?.addEventListener('click', () => {
      window.location.href = 'tel:02903836360';
    });
  } else if (state.activeTab === 'NEWS') {
    mainContent.innerHTML = renderNewsView();
  } else if (state.activeTab === 'MAP') {
    mainContent.innerHTML = renderMapView();
  } else if (state.activeTab === 'ACCOUNT') {
    mainContent.innerHTML = renderAccountView();
    document.getElementById('btn-add-meter')?.addEventListener('click', () => {
      const newCode = prompt('Nhập Mã Danh Bộ mới (Ví dụ: CM309182):');
      if (newCode) {
        state.meters.push({
          id: 'm' + (state.meters.length + 1),
          customerCode: newCode.toUpperCase(),
          ownerName: state.currentUser.fullName,
          address: 'TP. Cà Mau',
          label: 'Nhà mới thêm',
          isDefault: false,
          meterSerialNumber: 'MTR-' + Math.floor(10000 + Math.random() * 90000),
        });
        renderHeader();
        renderMainContent();
        alert('Liên kết mã danh bộ mới thành công!');
      }
    });
  }
}

// App Initialization
function initApp() {
  renderHeader();
  renderBottomNav();
  renderMainContent();
}

window.addEventListener('DOMContentLoaded', initApp);
