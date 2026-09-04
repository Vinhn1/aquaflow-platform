# Thư mục Assets — CAWACO Digital Water

Thư mục này chứa toàn bộ tài nguyên hình ảnh, logo và icon của dự án.

---

## Cấu trúc thư mục

```
assets/
  brand/        ← Logo và nhận diện thương hiệu
  images/       ← Hình ảnh minh họa, cover, banner
  icons/        ← Icon SVG tùy chỉnh (nếu có)
  README.md     ← File này
```

---

## Quy ước đặt tên file

### brand/
| File | Mô tả |
|:---|:---|
| `logo.png` | Logo chính (nền trong suốt, khuyến nghị min 512×512px) |
| `logo-white.png` | Logo màu trắng (dùng trên nền tối) |
| `logo-dark.png` | Logo màu tối (dùng trên nền sáng) |
| `logo.svg` | Logo dạng vector (ưu tiên dùng nếu có) |
| `favicon.ico` | Favicon cho Admin Portal |
| `cover.png` | Ảnh bìa hiển thị trên Zalo Mini App Store (1200×800px) |
| `icon-mini-app.png` | Icon Mini App trên Zalo (512×512px, nền không trong suốt) |

### images/
| File | Mô tả |
|:---|:---|
| `hero-banner.jpg` | Banner trang chủ Mini App |
| `office-hq.jpg` | Ảnh trụ sở 204 Quang Trung, Cà Mau |
| `empty-invoice.png` | Minh họa trạng thái không có hóa đơn |
| `empty-complaint.png` | Minh họa trạng thái không có phản ánh |

### icons/
Chứa các file `.svg` icon tùy chỉnh nếu Lucide React không có sẵn.

---

## Yêu cầu kỹ thuật

- **Logo**: Định dạng PNG (nền trong suốt) hoặc SVG — ưu tiên SVG
- **Cover Zalo**: PNG hoặc JPG, tỉ lệ 3:2, tối thiểu 1200×800px
- **Icon Mini App**: PNG, tỉ lệ 1:1, đúng 512×512px, nền không được trong suốt
- **Ảnh thông thường**: JPG/PNG, tối ưu kích thước dưới 500KB mỗi file

---

## Lưu y

- Sau khi thêm file vào đây, thông báo để chúng được copy sang đúng vị trí trong `apps/mini-app/public/assets/` và `apps/admin/public/assets/`.
- Không đặt file ảnh trực tiếp trong `src/` của các app.
