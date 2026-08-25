import { Router } from 'express';
import { CreateNewsSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

export function createNewsRouter(): Router {
  const router = Router();

  const newsList = [
    {
      id: 'news-01',
      title: 'Thông báo tạm ngưng cấp nước phục vụ đấu nối mạng lưới tuyến đường Quang Trung',
      slug: 'thong-bao-tam-ngung-cap-nuoc-tuyen-duong-quang-trung',
      summary: 'Công ty Cổ phần Cấp nước Cà Mau trân trọng thông báo tạm ngưng cung cấp nước sạch để thi công đấu nối tuyến ống D300.',
      content: 'Chi tiết lịch tạm ngưng cấp nước phục vụ công tác nâng cấp hạ tầng mạng lưới cấp nước sạch đô thị.',
      category: 'OUTAGE',
      isOutageAlert: true,
      affectedArea: 'Khu vực Phường Tân Thành và một phần Phường 5, TP. Cà Mau',
      outageStartTime: '2026-08-28T22:00:00.000Z',
      outageEndTime: '2026-08-29T04:00:00.000Z',
      publishedAt: '2026-08-26T00:00:00.000Z',
    },
    {
      id: 'news-02',
      title: 'Khuyến cáo người dân bảo vệ đồng hồ nước và an toàn sử dụng nước sạch trong mùa mưa bão',
      slug: 'khuyen-cao-bao-ve-dong-ho-nuoc-mua-mua-bao',
      summary: 'Các biện pháp kiểm tra van khóa, chống ngập úng và bảo vệ cụm thủy lượng kế tại hộ gia đình.',
      content: 'Hướng dẫn chi tiết các bước bảo quản hộp đồng hồ và phối hợp cùng cán bộ kỹ thuật CAWACO.',
      category: 'SAFETY',
      isOutageAlert: false,
      publishedAt: '2026-08-25T00:00:00.000Z',
    },
    {
      id: 'news-03',
      title: 'Áp dụng biểu giá nước sạch sinh hoạt mới theo Quyết định số 13/2023/QĐ-UBND tỉnh Cà Mau',
      slug: 'ap-dung-bieu-gia-nuoc-sach-sinh-hoat-moi-ca-mau',
      summary: 'Chi tiết bảng giá lũy tiến 4 bậc thang dành cho hộ dân cư sinh hoạt và các cơ quan, đơn vị sản xuất kinh doanh.',
      content: 'Bảng giá chi tiết 4 bậc thang sinh hoạt: 6.600đ (1-10m³), 8.100đ (11-20m³), 9.600đ (21-30m³), 11.500đ (>30m³). Thuế GTGT 5%, Phí BVMT 10%.',
      category: 'TARIFF',
      isOutageAlert: false,
      publishedAt: '2026-08-20T00:00:00.000Z',
    },
  ];

  // GET /api/v1/news
  router.get('/', (req, res) => {
    res.json({
      success: true,
      data: newsList,
    });
  });

  // GET /api/v1/news/outages
  router.get('/outages', (req, res) => {
    const outages = newsList.filter((n) => n.isOutageAlert);
    res.json({
      success: true,
      data: outages,
    });
  });

  // POST /api/v1/news (Admin creates news)
  router.post('/', authenticate, validateBody(CreateNewsSchema), (req, res) => {
    const newItem = {
      id: `news-${Date.now()}`,
      ...req.body,
      publishedAt: new Date().toISOString(),
    };
    newsList.unshift(newItem);
    res.status(201).json({
      success: true,
      data: newItem,
    });
  });

  return router;
}
