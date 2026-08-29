import { Router } from 'express';
import { CreateNewsSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { prisma } from '../lib/prisma.js';

export function createNewsRouter(): Router {
  const router = Router();
  const isMock = process.env.MOCK_CAWACO_API === 'true';

  const mockNewsList = [
    {
      id: 'news-01',
      title: 'Thông báo tạm ngưng cấp nước phục vụ đấu nối mạng lưới tuyến đường Quang Trung',
      slug: 'thong-bao-tam-ngung-cap-nuoc-tuyen-duong-quang-trung',
      summary: 'Công ty Cổ phần Cấp nước Cà Mau trân trọng thông báo tạm ngưng cung cấp nước sạch để thi công đấu nối tuyến ống D300.',
      content: 'Chi tiết lịch tạm ngưng cấp nước phục vụ công tác nâng cấp hạ tầng mạng lưới cấp nước sạch đô thị.',
      category: 'MAINTENANCE_OUTAGE',
      isOutageAlert: true,
      affectedArea: 'Khu vực Phường Tân Thành và một phần Phường 5, TP. Cà Mau',
      outageStartTime: '2026-08-28T22:00:00.000Z',
      outageEndTime: '2026-08-29T04:00:00.000Z',
      publishedAt: '2026-08-26T00:00:00.000Z',
    },
  ];

  // GET /api/v1/news
  router.get('/', async (req, res, next) => {
    try {
      if (isMock) {
        return res.json({ success: true, data: mockNewsList });
      }
      const news = await prisma.news.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
      });
      return res.json({ success: true, data: news });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/news/outages
  router.get('/outages', async (req, res, next) => {
    try {
      if (isMock) {
        const outages = mockNewsList.filter((n) => n.isOutageAlert);
        return res.json({ success: true, data: outages });
      }
      const outages = await prisma.news.findMany({
        where: { isPublished: true, isOutageAlert: true },
        orderBy: { publishedAt: 'desc' },
      });
      return res.json({ success: true, data: outages });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/news (Admin create news)
  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN'),
    validateBody(CreateNewsSchema),
    async (req, res, next) => {
      try {
        if (isMock) {
          return res.status(201).json({
            success: true,
            data: { id: `news-${Date.now()}`, ...req.body },
            message: 'Tạo tin tức thành công (Mock)',
          });
        }
        const created = await prisma.news.create({
          data: {
            title: req.body.title,
            slug: req.body.slug,
            summary: req.body.summary,
            content: req.body.content,
            category: req.body.category,
            isOutageAlert: req.body.isOutageAlert ?? false,
            affectedArea: req.body.affectedArea,
            outageStartTime: req.body.outageStartTime ? new Date(req.body.outageStartTime) : null,
            outageEndTime: req.body.outageEndTime ? new Date(req.body.outageEndTime) : null,
            isPublished: req.body.isPublished ?? true,
          },
        });
        return res.status(201).json({
          success: true,
          data: created,
          message: 'Tạo bài viết tin tức thành công',
        });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
