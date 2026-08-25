const adminState = {
  currentView: 'QUEUE' as 'QUEUE' | 'COMPLAINTS' | 'OUTAGES' | 'CUSTOMERS',
  activeCallingTicket: 'A-102' as string | null,
  waitingTickets: [
    { ticketNumber: 'A-103', customerName: 'Lê Hoàng Nam', serviceName: 'Đăng ký lắp mới đồng hồ nước', waitTime: '12 phút' },
    { ticketNumber: 'A-104', customerName: 'Trần Thị Thu', serviceName: 'Thu tiền nước & Tra cứu hóa đơn', waitTime: '8 phút' },
    { ticketNumber: 'A-105', customerName: 'Nguyễn Văn An', serviceName: 'Đăng ký lắp mới đồng hồ nước', waitTime: '5 phút' },
  ],
  complaints: [
    { id: 'CP-01', type: 'Bể đường ống nước', address: '204 Quang Trung, P. Tân Thành', reporter: 'Nguyễn Văn An', status: 'IN_PROGRESS', time: '26/08/2026 08:30' },
    { id: 'CP-02', type: 'Nước bị đục', address: 'Khóm 4, Phường 5, TP. Cà Mau', reporter: 'Phạm Minh', status: 'RECEIVED', time: '26/08/2026 09:15' },
  ],
};

function renderAdminContent() {
  const content = document.getElementById('admin-content');
  if (!content) return;

  if (adminState.currentView === 'QUEUE') {
    content.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Bàn Làm Việc Quầy Giao Dịch Số 01</div>
          <div style="color: var(--admin-muted); font-size: 14px;">Trụ sở chính: 204 Quang Trung, P. Tân Thành, TP. Cà Mau</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Left: Calling Action Box -->
        <div>
          <div class="calling-box">
            <div style="font-size: 14px; font-weight: 600; color: var(--admin-muted); margin-bottom: 8px;">SỐ THỨ TỰ ĐANG PHỤC VỤ TẠI QUẦY:</div>
            <div class="ticket-large">${adminState.activeCallingTicket || '---'}</div>
            <div style="font-size: 16px; margin: 12px 0 24px; color: #1E293B;">
              ${adminState.activeCallingTicket ? 'Khách hàng: <strong>Nguyễn Văn An</strong> (CM102938)' : 'Quầy đang trống'}
            </div>
            <div style="display: flex; gap: 12px; max-width: 400px; margin: 0 auto 16px;">
              <button class="btn-large btn-call" id="btn-call-next">GỌI SỐ TIẾP THEO</button>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button class="btn-success" id="btn-complete-ticket">Hoàn thành lượt</button>
              <button class="btn-warning" id="btn-miss-ticket">Vắng mặt / Bỏ qua</button>
            </div>
          </div>
        </div>

        <!-- Right: Waiting Queue List -->
        <div>
          <div class="admin-card">
            <div class="card-title">Hàng Đợi Chờ Phục Vụ (${adminState.waitingTickets.length})</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Số vé</th>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                </tr>
              </thead>
              <tbody>
                ${adminState.waitingTickets.map((t) => `
                  <tr>
                    <td><strong>${t.ticketNumber}</strong></td>
                    <td>${t.customerName}</td>
                    <td style="font-size: 12px; color: var(--admin-muted);">${t.serviceName}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-call-next')?.addEventListener('click', () => {
      if (adminState.waitingTickets.length > 0) {
        const next = adminState.waitingTickets.shift();
        adminState.activeCallingTicket = next?.ticketNumber || null;
        renderAdminContent();
      } else {
        alert('Hàng đợi đã hết khách!');
      }
    });

    document.getElementById('btn-complete-ticket')?.addEventListener('click', () => {
      alert(`Đã hoàn tất phục vụ cho vé ${adminState.activeCallingTicket}`);
      adminState.activeCallingTicket = null;
      renderAdminContent();
    });
  } else if (adminState.currentView === 'COMPLAINTS') {
    content.innerHTML = `
      <div class="page-header">
        <div class="page-title">Điều Phối & Xử Lý Sự Cố Rò Rỉ Nước</div>
      </div>
      <div class="admin-card">
        <div class="card-title">Danh sách Phản ánh từ Người dân qua Zalo Mini App</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã sự cố</th>
              <th>Loại sự cố</th>
              <th>Địa chỉ / Tọa độ</th>
              <th>Người báo</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${adminState.complaints.map((c) => `
              <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.type}</td>
                <td>${c.address}</td>
                <td>${c.reporter}</td>
                <td>${c.time}</td>
                <td>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${c.status === 'IN_PROGRESS' ? '#FEF3C7; color: #D97706;' : '#E0E7FF; color: #4338CA;'}">
                    ${c.status === 'IN_PROGRESS' ? 'Đang sửa chữa' : 'Đã tiếp nhận'}
                  </span>
                </td>
                <td>
                  <button class="btn-success" style="padding: 4px 8px; font-size: 12px;" onclick="alert('Đã cập nhật hoàn tất sửa chữa cho sự cố ${c.id}')">Hoàn tất</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (adminState.currentView === 'OUTAGES') {
    content.innerHTML = `
      <div class="page-header">
        <div class="page-title">Phát Thông Báo & Lịch Cúp Nước</div>
      </div>
      <div class="admin-card" style="max-width: 650px;">
        <div class="card-title">Soạn Thông Báo Cúp Nước Mới</div>
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Tiêu đề thông báo:</label>
          <input type="text" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--admin-border);" placeholder="Ví dụ: Tạm ngưng cấp nước đường Phan Ngọc Hiển..." />
        </div>
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Khu vực ảnh hưởng:</label>
          <input type="text" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--admin-border);" placeholder="Khóm 1, 2, 3 Phường 5, TP. Cà Mau" />
        </div>
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Thời gian cúp nước:</label>
          <input type="text" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--admin-border);" placeholder="Từ 22:00 ngày 28/08/2026 đến 04:00 ngày 29/08/2026" />
        </div>
        <button class="btn-large btn-call" onclick="alert('Đã phát thông báo cúp nước tức thì tới toàn bộ người dân trên Zalo Mini App!')">
          Phát Thông Báo Đến Zalo Mini App
        </button>
      </div>
    `;
  }
}

function initAdmin() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('active'));
      const target = e.currentTarget as HTMLElement;
      target.classList.add('active');
      adminState.currentView = target.getAttribute('data-view') as any;
      renderAdminContent();
    });
  });

  renderAdminContent();
}

window.addEventListener('DOMContentLoaded', initAdmin);
