# Hướng Dẫn Chi Tiết Triển Khai Thực Tế Nền Tảng AquaFlow CAWACO

Tài liệu này cung cấp hướng dẫn từng bước (Step-by-step) dành cho kỹ sư vận hành để:
1. Hiểu phương án tối ưu nhất về thanh toán và dữ liệu thật.
2. Triển khai Backend API và Admin Portal lên máy chủ VPS Ubuntu với Domain và SSL HTTPS.
3. Đóng gói và triển khai Zalo Mini App lên nền tảng Zalo, cấu hình thành viên phát triển và xin cấp quyền kiểm thử (Development/Testing).
4. Quy trình chuyển giao tài khoản Zalo chính thức cho Công ty Cổ phần Cấp nước Cà Mau.

---

## 1. Đề Xuất Phương Án Tối Ưu Nhất Cho Hệ Thống

### A. Phương án Dữ liệu Khách hàng & Hóa đơn: Single Source of Truth
- **Hiện trạng:** Hệ thống kế toán/thu tiền nội bộ của CAWACO chưa mở cổng API trực tiếp ra Internet.
- **Giải pháp tối ưu:** Sử dụng CSDL PostgreSQL của AquaFlow làm trung tâm vận hành. Cán bộ CAWACO đăng nhập vào Admin Portal (`admin.yourdomain.com`), xuất file danh sách khách hàng và hóa đơn kỳ từ phần mềm kế toán cũ (định dạng Excel/CSV) và import vào AquaFlow.
- **Lợi ích:** Hệ thống hoạt động độc lập, không phụ thuộc vào hạ tầng mạng nội bộ của nhà máy nước, bảo mật tối đa và sẵn sàng chuyển sang API tự động khi CAWACO nâng cấp ERP.

### B. Phương án Thanh toán: VietQR Chuẩn NAPAS247 + Webhook Tự Động (SePay)
- **Cơ chế hoạt động:**
  1. Khi người dân mở ứng dụng Zalo Mini App để thanh toán tiền nước, hệ thống tự động sinh mã VietQR chuẩn NAPAS247:
     - Số tài khoản: Tài khoản ngân hàng thực tế của Công ty Cổ phần Cấp nước Cà Mau (BIDV, VietinBank, Agribank,...).
     - Nội dung chuyển khoản: `TIENNUOC [MÃ DANH BỘ] [KỲ HÓA ĐƠN]` (Ví dụ: `TIENNUOC CM102938 2026-08`).
  2. Người dân dùng bất kỳ ứng dụng ngân hàng nào (App ngân hàng hoặc MoMo, ZaloPay) quét mã và bấm chuyển khoản.
  3. Dịch vụ SePay (hoặc Casso) phát hiện biến động số dư tài khoản ngân hàng của CAWACO ngay lập tức trong 1 - 3 giây và bắn Webhook bảo mật về:
     `POST https://api.yourdomain.com/api/v1/payments/webhook`
  4. Backend AquaFlow tự động gạch nợ hóa đơn sang trạng thái `PAID` và lưu lịch sử giao dịch.
- **Lợi ích:** Tiền vào thẳng 100% tài khoản ngân hàng của công ty, không mất phí chiết khấu cổng thanh toán trung gian, không cần thủ tục tích hợp phức tạp, triển khai trong 30 phút.

### C. Quản lý Tài khoản Zalo & Phân quyền
- **Giai đoạn Demo / Phát triển hiện tại:**
  - Tiếp tục sử dụng Zalo App ID `3879828502555234376`, Mini App ID `2784671839475576206` và OA `2562028218754028209`.
  - Phân quyền các thành viên kỹ thuật vào nhóm **Developer / Tester** để quét mã QR trải nghiệm đầy đủ các tính năng mà không cần chờ Zalo xét duyệt công khai toàn quốc.
- **Giai đoạn Bàn giao:**
  - Chỉ cần cập nhật các biến `ZALO_APP_ID`, `ZALO_APP_SECRET`, `ZALO_MINI_APP_ID`, `ZALO_OA_ID` trong tệp cấu hình `.env.production` trên server và `.env` trong mini app là hoàn tất chuyển giao.

---

## 2. Hướng Dẫn Triển Khai Backend Lên Máy Chủ VPS

### Bước 1: Trỏ Tên Miền (DNS Records)
Đăng nhập vào trang quản lý tên miền của bạn (Cloudflare, Tenten, PA Vietnam, Mat Bao,...) và tạo 2 bản ghi A trỏ về IP của VPS:
- Bản ghi 1: `api.yourdomain.com` -> `IP_VPS_CUA_BAN`
- Bản ghi 2: `admin.yourdomain.com` -> `IP_VPS_CUA_BAN`

*(Thời gian cập nhật DNS thông thường từ 1 - 5 phút).*

---

### Bước 2: Chuẩn Bị Môi Trường Trên VPS Ubuntu
Kết nối SSH vào VPS bằng Terminal hoặc PowerShell:
```bash
ssh root@IP_VPS_CUA_BAN
```

Cập nhật hệ thống và cài đặt các công cụ cần thiết:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx

# Cài đặt Docker Engine
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# Mở các cổng tường lửa bắt buộc
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

### Bước 3: Đưa Mã Nguồn Lên VPS & Cấu Hình Môi Trường
Tạo thư mục dự án và clone mã nguồn:
```bash
sudo mkdir -p /opt/aquaflow-platform
sudo chown -R $USER:$USER /opt/aquaflow-platform
cd /opt/aquaflow-platform

# Clone code từ Git repository của bạn
git clone <URL_GIT_REPO> .
```

Tạo file biến môi trường sản xuất `.env.production`:
```bash
cp .env.production.example .env.production
nano .env.production
```

Cập nhật các giá trị thực tế trong `.env.production`:
```env
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.yourdomain.com

# Thông tin cơ sở dữ liệu PostgreSQL bảo mật
POSTGRES_DB=aquaflow_cawaco
POSTGRES_USER=aquaflow_admin
POSTGRES_PASSWORD=MatKhauBaoMatCucManh2026!@#

DATABASE_URL="postgresql://aquaflow_admin:MatKhauBaoMatCucManh2026!@#@postgres:5432/aquaflow_cawaco?schema=public"

# Khóa JWT Secret và Webhook Secret
JWT_SECRET=chuoi_ngau_nhien_dai_it_nhat_64_ky_tu_cuc_ky_bao_mat_2026
PAYMENT_WEBHOOK_SECRET=chuoi_secret_webhook_sepay_cawaco_2026

# Tắt toàn bộ chế độ Mock để dùng cơ sở dữ liệu thật
MOCK_CAWACO_API=false
MOCK_PAYMENT_GATEWAY=false
MOCK_ZALO_AUTH=false

# Cấu hình Zalo hiện tại
ZALO_APP_ID=3879828502555234376
ZALO_APP_SECRET=e63PhT2GDL5N5v6L3OUw
ZALO_MINI_APP_ID=2784671839475576206
ZALO_OA_ID=2562028218754028209
```

---

### Bước 4: Khởi Chạy Dịch Vụ Với Docker Compose
Cấp quyền thực thi và chạy script triển khai:
```bash
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

Kiểm tra trạng thái các container đang chạy:
```bash
docker compose -f docker-compose.prod.yml ps
```
Cả 3 container `aquaflow-postgres`, `aquaflow-api` và `aquaflow-admin` đều phải ở trạng thái `Up (healthy)` hoặc `Up`.

---

### Bước 5: Cấu Hình Nginx Reverse Proxy & Chứng Chỉ SSL Miễn Phí (Let's Encrypt)
1. Tạo tệp cấu hình Nginx:
```bash
sudo cp nginx/aquaflow.conf.example /etc/nginx/sites-available/aquaflow.conf
```

2. Chỉnh sửa tệp cấu hình và thay thế `YOUR_DOMAIN.com` bằng tên miền thật của bạn:
```bash
sudo sed -i 's/YOUR_DOMAIN.com/yourdomain.com/g' /etc/nginx/sites-available/aquaflow.conf
```

3. Kích hoạt cấu hình Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/aquaflow.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Chạy Certbot để tự động đăng ký và gia hạn chứng chỉ SSL HTTPS:
```bash
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com
```

5. Kiểm tra hoạt động:
Mở trình duyệt hoặc dùng lệnh:
```bash
curl https://api.yourdomain.com/health
```
Phản hồi nhận được dạng JSON:
```json
{
  "status": "UP",
  "service": "AquaFlow CAWACO API",
  "adapterMode": "REAL_POSTGRESQL",
  "version": "1.0.0"
}
```

---

## 3. Hướng Dẫn Deploy Zalo Mini App & Xin Cấp Quyền Development

### Bước 1: Chuẩn Bị & Cấu Hình API Endpoint Cho Mini App
Trên máy tính của bạn, mở tệp `apps/mini-app/.env` và cập nhật:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ZALO_APP_ID=3879828502555234376
VITE_ZALO_MINI_APP_ID=2784671839475576206
VITE_ZALO_OA_ID=2562028218754028209
```

Kiểm tra tệp `apps/mini-app/app-config.json` đảm bảo `headerTitle` hiển thị: `CAWACO - Cấp nước Cà Mau`.

---

### Bước 2: Đăng Nhập & Deploy Bằng ZMP CLI
1. Cài đặt ZMP CLI (nếu chưa có):
```bash
npm install -g zmp-cli
```

2. Đăng nhập tài khoản Zalo Developer:
```bash
zmp login
```
*Trình duyệt sẽ mở mã QR Zalo. Dùng điện thoại mở Zalo quét mã và nhấn Đồng ý đăng nhập.*

3. Đóng gói và Deploy lên hệ thống Zalo:
```bash
npm --prefix apps/mini-app run build
cd apps/mini-app
zmp deploy
```
Nhập ghi chú cho phiên bản (Ví dụ: `Bản thử nghiệm v1.0.0 kết nối backend thật`).
Sau khi hoàn tất, màn hình terminal sẽ hiển thị link phiên bản và mã QR trải nghiệm.

---

### Bước 3: Cấu Hình Trên Trang Quản Trị Zalo Mini App Console
Truy cập vào trang quản trị: **[https://mini.zalo.me/manage](https://mini.zalo.me/manage)**
Chọn Mini App: **CAWACO - Cấp nước Cà Mau** (ID: `2784671839475576206`).

#### 1. Thiết Lập Danh Sách Domain Cho Phép (Domain Whitelist)
- Vào menu **Cài đặt** -> chọn tab **Thiết lập domain**.
- Thêm các domain sau vào danh sách:
  - `https://api.yourdomain.com` (Domain Backend API)
  - `https://tile.openstreetmap.org` (Tải bản đồ OpenStreetMap trong trang Bản đồ)
  - `https://img.vietqr.io` (Hiển thị mã thanh toán VietQR)

#### 2. Thêm Thành Viên Phát Triển & Kiểm Thử (Development Team / Testers)
- Vào menu **Thành viên** (Members) -> Chọn **Thêm thành viên**.
- Nhập Số điện thoại hoặc Zalo ID của các thành viên trong đội phát triển hoặc cán bộ CAWACO cần dùng thử.
- Chọn vai trò:
  - **Developer**: Có quyền triển khai mã nguồn và xem log debug.
  - **Tester**: Có quyền mở và sử dụng phiên bản thử nghiệm trước khi xuất bản.

#### 3. Bật Các Quyền API (Permissions)
- Vào menu **Quản lý quyền** (Permissions).
- Kiểm tra các quyền sau:
  - `scope.userInfo`: Cho phép hiển thị tên và avatar khách hàng trên đầu trang chủ và khi gửi phản ánh sự cố.
  - `scope.userLocation`: Cho phép lấy tọa độ GPS chính xác khi khách hàng chụp ảnh báo vỡ đường ống nước trên địa bàn Cà Mau.
  - `scope.userPhonenumber`: Lấy số điện thoại tài khoản Zalo để tự động đối chiếu danh bạ khách hàng. *(Lưu ý: Trong giai đoạn demo chưa xác thực OA doanh nghiệp, ứng dụng sẽ cho phép khách hàng tự nhập mã danh bộ hoặc số điện thoại mà không bị chặn).*

#### 4. Kích Hoạt Phiên Bản Trải Nghiệm (Test Version)
- Vào menu **Phiên bản** (Versions).
- Tìm bản build bạn vừa chạy `zmp deploy`.
- Bấm vào dấu ba chấm `...` -> Chọn **Đặt làm phiên bản trải nghiệm**.
- Bấm vào biểu tượng **Mã QR** bên cạnh phiên bản: Mở ứng dụng Zalo trên điện thoại quét mã này để bắt đầu trải nghiệm thực tế ngay lập tức!

---

## 4. Quy Trình Bàn Giao Tài Khoản Cho Công Ty CAWACO

Khi dự án nghiệm thu và chuyển giao cho Công ty Cổ phần Cấp nước Cà Mau vận hành chính thức:
1. Đăng ký tài khoản Zalo Doanh nghiệp cho CAWACO tại [https://business.zalo.me](https://business.zalo.me) và xác thực giấy phép kinh doanh.
2. Tạo mới hoặc chuyển quyền quản trị Mini App ID sang tài khoản doanh nghiệp CAWACO.
3. Cập nhật các thông số mới vào:
   - Server VPS: File `.env.production`
   - Frontend Mini App: File `.env`
4. Chạy lệnh cập nhật:
   ```bash
   # Cập nhật backend trên VPS
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml up -d --build
   
   # Deploy bản chính thức lên Zalo
   cd apps/mini-app
   npm run build
   zmp deploy
   ```
5. Gửi hồ sơ xét duyệt chính thức trên Zalo Console để xuất bản (Release) cho toàn bộ người dân tỉnh Cà Mau tìm kiếm và sử dụng trên Zalo.
