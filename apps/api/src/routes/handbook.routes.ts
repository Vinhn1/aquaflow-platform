import { Router } from 'express';

export function createHandbookRouter(): Router {
  const router = Router();

  const HANDBOOK_ARTICLES = [
    {
      id: 'hb-01',
      title: 'Hướng dẫn đọc chỉ số đồng hồ nước cơ và điện tử chính xác',
      category: 'HUONG_DAN',
      readTime: '3 phút',
      summary: 'Cách phân biệt phần số nguyên (m³) màu đen và phần thập phân màu đỏ trên mặt đồng hồ nước.',
      content: `### 1. Đồng hồ nước cơ (mặt số hộp số cơ)
- **Hộp số hiển thị:** Thường có 4 hoặc 5 chữ số màu đen và 1 đến 3 chữ số màu đỏ.
- **Quy tắc ghi chỉ số:** Công ty Cấp nước Cà Mau chỉ thu tiền và ghi nhận **dãy chữ số màu đen** (đại diện cho mét khối - m³). Các kim quay hoặc dãy số màu đỏ là hàng trăm lít, chục lít dùng để theo dõi lưu lượng nhỏ và kiểm tra rò rỉ, **không tính vào chỉ số lũy kế tính tiền**.

### 2. Đồng hồ nước điện tử (màn hình LCD)
- Chỉ số hiển thị trực tiếp bằng số điện tử dạng thập phân. Chỉ cần ghi nhận phần số nguyên đứng trước dấu chấm.`,
      tags: ['Đồng hồ nước', 'Chỉ số m3', 'Đo đếm'],
    },
    {
      id: 'hb-02',
      title: 'Cách tự kiểm tra và phát hiện rò rỉ đường ống nước ngầm trong nhà',
      category: 'TIET_KIEM',
      readTime: '4 phút',
      summary: 'Quy trình 3 bước đơn giản giúp bạn phát hiện thất thoát nước âm tường hoặc dưới nền nhà.',
      content: `### Quy trình kiểm tra rò rỉ nước:
1. **Bước 1:** Khóa tất cả các van, vòi nước trong nhà (vòi rửa chén, vòi sen, máy giặt, phao bồn cầu).
2. **Bước 2:** Ra vị trí đặt cụm đồng hồ nước của CAWACO và quan sát kỹ:
   - Nếu **kim quay hình sao (ngôi sao nhỏ hoặc cánh quạt phụ màu đỏ)** vẫn tiếp tục quay chầm chậm hoặc xoay liên tục, chứng tỏ **đường ống sau đồng hồ đang bị rò rỉ ngầm**.
3. **Bước 3:** Kiểm tra ngay các vị trí van phao bồn nước trên mái và van cấp bồn cầu (đây là 2 nguyên nhân phổ biến nhất khiến hóa đơn tiền nước tăng đột biến).`,
      tags: ['Rò rỉ nước', 'Tiết kiệm', 'Bảo trì'],
    },
    {
      id: 'hb-03',
      title: 'Biểu giá nước sinh hoạt và cách tính tiền nước bậc thang tại Cà Mau',
      category: 'CHINH_SACH',
      readTime: '5 phút',
      summary: 'Chi tiết 4 bậc giá nước sinh hoạt hộ gia đình và cách tính thuế VAT 5%, phí bảo vệ môi trường 10%.',
      content: `### Biểu giá nước sinh hoạt bậc thang:
- **Bậc 1 (Từ 1 - 10 m³/hộ/tháng):** 6.800 đ/m³
- **Bậc 2 (Từ 11 - 20 m³/hộ/tháng):** 8.200 đ/m³
- **Bậc 3 (Từ 21 - 30 m³/hộ/tháng):** 10.500 đ/m³
- **Bậc 4 (Trên 30 m³/hộ/tháng):** 13.000 đ/m³

### Các khoản phí theo quy định:
1. **Thuế GTGT (VAT):** 5% tiền nước.
2. **Tiền dịch vụ thoát nước & xử lý nước thải (Phí BVMT):** 10% tiền nước.
*Tổng tiền thanh toán = Tiền nước + Thuế VAT (5%) + Phí BVMT (10%)*`,
      tags: ['Giá nước', 'Bậc thang', 'Biểu giá'],
    },
    {
      id: 'hb-04',
      title: 'Quy chuẩn chất lượng nước sạch QCVN 01-1:2018/BYT tại CAWACO',
      category: 'CHAT_LUONG',
      readTime: '3 phút',
      summary: 'Các chỉ số xét nghiệm ngoại kiểm hóa lý và vi sinh định kỳ của phòng thí nghiệm CAWACO.',
      content: `### Đảm bảo an toàn nguồn nước sạch:
- Nguồn nước sinh hoạt do CAWACO cung cấp được kiểm định nghiêm ngặt theo **Quy chuẩn kỹ thuật quốc gia về chất lượng nước sạch sử dụng cho mục đích sinh hoạt (QCVN 01-1:2018/BYT)**.
- Hàm lượng Clo dư tự do tại vòi người tiêu dùng luôn duy trì trong ngưỡng quy định (0.2 - 1.0 mg/L) để đảm bảo vô trùng trong suốt hành trình truyền dẫn mạng lưới đường ống.
- Kết quả nội kiểm và ngoại kiểm từ Trung tâm Kiểm soát Bệnh tật tỉnh Cà Mau (CDC Cà Mau) được công bố định kỳ hàng tháng trên cổng thông tin.`,
      tags: ['QCVN 01-1:2018/BYT', 'Chất lượng nước', 'Xét nghiệm'],
    },
  ];

  // GET /api/v1/handbook/articles
  router.get('/articles', (req, res) => {
    const { category } = req.query;
    let list = HANDBOOK_ARTICLES;
    if (category && category !== 'ALL') {
      list = list.filter((a) => a.category === category);
    }
    res.json({
      success: true,
      data: list,
    });
  });

  // GET /api/v1/handbook/articles/:id
  router.get('/articles/:id', (req, res) => {
    const article = HANDBOOK_ARTICLES.find((a) => a.id === req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: 'KHONG_TIM_THAY', message: 'Không tìm thấy bài viết.' },
      });
    }
    res.json({
      success: true,
      data: article,
    });
  });

  return router;
}
