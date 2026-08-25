# Hướng Dẫn Triển Khai & Vận Hành Nền Tảng AquaFlow (CAWACO)

Tài liệu này hướng dẫn chi tiết quy trình triển khai môi trường sản xuất (Production Deployment) và vận hành hệ thống chăm sóc khách hàng số hóa cho **Công ty Cổ phần Cấp nước Cà Mau (CAWACO)**.

---

## 1. Yêu Cầu Hệ Thống (System Prerequisites)
- **Hệ điều hành**: Linux (Ubuntu 22.04 LTS khuyến nghị) hoặc Docker Enterprise.
- **Phần mềm cài đặt**:
  - Docker Engine v24.0+ & Docker Compose v2.20+
  - Node.js v20.x LTS (nếu chạy trực tiếp không qua Docker)
  - PostgreSQL v16+
- **Băng thông & Cổng mạng**:
  - Cổng 80/443 (Reverse Proxy / HTTPS Nginx)
  - Cổng 3000 (Backend API nội bộ)
  - Cổng 5432 (PostgreSQL nội bộ)

---

## 2. Các Bước Triển Khai Bằng Docker Compose

### Bước 1: Chuẩn bị Biến Môi Trường Sản Xuất
Sao chép tệp mẫu và cập nhật các thông số bảo mật thực tế:
```bash
cp .env.production.example .env.production
```

Các biến môi trường cần thiết lập:
- `DATABASE_URL`: Đường dẫn kết nối cơ sở dữ liệu PostgreSQL của CAWACO.
- `JWT_SECRET`: Khóa bí mật tối thiểu 32 ký tự ngẫu nhiên dùng để mã hóa phiên đăng nhập Zalo.
- `PAYMENT_WEBHOOK_SECRET`: Khóa bí mật HMAC SHA-256 đối soát Webhook với ngân hàng (VietinBank / MB Bank / Vietcombank).
- `ZALO_APP_ID` & `ZALO_APP_SECRET`: Định danh Mini App cấp bởi Zalo for Developers.

### Bước 2: Khởi Chạy Toàn Bộ Hệ Thống
Chạy lệnh duy nhất để build và khởi chạy tất cả các dịch vụ:
```bash
docker compose -f docker-compose.yml up -d --build
```

Kiểm tra trạng thái các container:
```bash
docker compose ps
```

---

## 3. Kiểm Tra Sức Khỏe Hệ Thống (Health Check)

Truy cập endpoint kiểm tra trạng thái hoạt động:
```bash
curl http://localhost:3000/health
```

Kết quả phản hồi thành công:
```json
{
  "status": "UP",
  "service": "AquaFlow CAWACO API",
  "timestamp": "2026-08-26T08:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 4. Quy Trình Vận Hành & Bảo Trì

### A. Sao Lưu Cơ Sở Dữ Liệu Tự Động
Lệnh backup database định kỳ hàng ngày:
```bash
docker exec -t aquaflow-postgres pg_dump -U aquaflow_user aquaflow_cawaco > /backup/cawaco_db_$(date +%Y%m%d).sql
```

### B. Cơ Chế Tắt An Toàn (Graceful Shutdown)
Khi cập nhật phiên bản mới hoặc bảo trì server:
```bash
docker compose stop
```
Hệ thống sẽ tự động bắt tín hiệu `SIGTERM`, giữ kết nối tối đa 10 giây để hoàn tất các lượt gạch nợ Webhook và cấp vé bốc số đang xử lý dở dang trước khi đóng hoàn toàn.

---

## 5. Danh Mục Đầu Mối Hỗ Trợ Kỹ Thuật CAWACO
- **Trụ sở chính**: Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau.
- **Tổng đài CSKH**: `0290 3836 360` - `0290 3836 723`.
- **Đội Kỹ thuật Mạng lưới**: Tiếp nhận và điều phối sự cố rò rỉ nước 24/7.
