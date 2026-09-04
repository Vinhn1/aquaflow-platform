import { Router } from 'express';
import { CreateNewsSchema } from '@aquaflow/validation';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { prisma } from '../lib/prisma.js';
import { NewsScraperService, ScrapedNewsItem } from '../services/news-scraper.service.js';

export function createNewsRouter(): Router {
  const router = Router();
  const isMock = process.env.MOCK_CAWACO_API === 'true';

  // GET /api/v1/news — Lấy danh sách tin tức từ Database + Scraper
  router.get('/', async (req, res, next) => {
    try {
      const category = req.query.category as string | undefined;

      let dbNews: any[] = [];
      try {
        dbNews = await prisma.$queryRawUnsafe<any[]>(
          `SELECT id, title, slug, summary, content, category, is_outage_alert as "isOutageAlert", affected_area as "affectedArea", thumbnail_url as "thumbnailUrl", outage_start_time as "outageStartTime", outage_end_time as "outageEndTime", published_at as "publishedAt" FROM news WHERE is_published = true ORDER BY published_at DESC`
        );
      } catch {
        try {
          dbNews = await prisma.news.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: 'desc' },
          });
        } catch {
          // Fallback neu DB chua san sang
        }
      }

      const scrapedNews = await NewsScraperService.fetchLatestNews();

      const formattedDbNews: ScrapedNewsItem[] = dbNews.map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        summary: n.summary,
        content: n.content,
        category: n.category,
        isOutageAlert: n.isOutageAlert,
        affectedArea: n.affectedArea || undefined,
        thumbnailUrl: n.thumbnailUrl || undefined,
        publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : new Date().toISOString(),
      }));

      const allNews: ScrapedNewsItem[] = [...formattedDbNews];
      for (const item of scrapedNews) {
        if (!allNews.some((n) => n.slug === item.slug || n.title === item.title)) {
          allNews.push(item);
        }
      }

      let filtered = allNews;
      if (category && category !== 'ALL') {
        filtered = allNews.filter((n) => n.category === category);
      }

      return res.json({ success: true, data: filtered });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/news/outages — Lịch cúp nước & cảnh báo
  router.get('/outages', async (req, res, next) => {
    try {
      let dbOutages: any[] = [];
      try {
        dbOutages = await prisma.$queryRawUnsafe<any[]>(
          `SELECT id, title, slug, summary, content, category, is_outage_alert as "isOutageAlert", affected_area as "affectedArea", thumbnail_url as "thumbnailUrl", outage_start_time as "outageStartTime", outage_end_time as "outageEndTime", published_at as "publishedAt" FROM news WHERE is_published = true AND is_outage_alert = true ORDER BY published_at DESC`
        );
      } catch {
        try {
          dbOutages = await prisma.news.findMany({
            where: { isPublished: true, isOutageAlert: true },
            orderBy: { publishedAt: 'desc' },
          });
        } catch {
          // Fallback
        }
      }

      const scrapedNews = await NewsScraperService.fetchLatestNews();
      const scrapedOutages = scrapedNews.filter((n) => n.isOutageAlert);

      const formattedDbOutages: ScrapedNewsItem[] = dbOutages.map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        summary: n.summary,
        content: n.content,
        category: n.category,
        isOutageAlert: true,
        affectedArea: n.affectedArea || undefined,
        thumbnailUrl: n.thumbnailUrl || undefined,
        publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : new Date().toISOString(),
      }));

      const allOutages = [...formattedDbOutages];
      for (const item of scrapedOutages) {
        if (!allOutages.some((n) => n.slug === item.slug || n.title === item.title)) {
          allOutages.push(item);
        }
      }

      return res.json({ success: true, data: allOutages });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/news/:idOrSlug — Chi tiết bài viết
  router.get('/:idOrSlug', async (req, res, next) => {
    try {
      const { idOrSlug } = req.params;

      try {
        const dbItems = await prisma.$queryRawUnsafe<any[]>(
          `SELECT id, title, slug, summary, content, category, is_outage_alert as "isOutageAlert", affected_area as "affectedArea", thumbnail_url as "thumbnailUrl", published_at as "publishedAt" FROM news WHERE id = $1 OR slug = $1 LIMIT 1`,
          idOrSlug
        );
        if (dbItems && dbItems.length > 0) {
          const dbItem = dbItems[0];
          return res.json({
            success: true,
            data: {
              id: dbItem.id,
              title: dbItem.title,
              slug: dbItem.slug,
              summary: dbItem.summary,
              content: dbItem.content,
              category: dbItem.category,
              isOutageAlert: dbItem.isOutageAlert,
              affectedArea: dbItem.affectedArea || undefined,
              thumbnailUrl: dbItem.thumbnailUrl || undefined,
              publishedAt: dbItem.publishedAt ? new Date(dbItem.publishedAt).toISOString() : new Date().toISOString(),
            },
          });
        }
      } catch {
        // Fallback
      }

      const detail = await NewsScraperService.getNewsDetail(idOrSlug);
      if (!detail) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết tin tức yêu cầu',
        });
      }
      return res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/news/sync — Kích hoạt đồng bộ lại từ website ctncamau.com.vn
  router.post('/sync', async (req, res, next) => {
    try {
      const updated = await NewsScraperService.fetchLatestNews();
      return res.json({
        success: true,
        message: 'Đồng bộ tin tức từ website Cấp nước Cà Mau thành công',
        count: updated.length,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/news (Admin create news)
  router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'),
    validateBody(CreateNewsSchema),
    async (req, res, next) => {
      try {
        // Chuyen doi danh muc sang dung Enum trong Prisma DB
        let dbCategory: 'ANNOUNCEMENT' | 'MAINTENANCE_OUTAGE' | 'WATER_SAFETY' | 'TARIFF_POLICY' = 'ANNOUNCEMENT';
        const rawCat = req.body.category;
        if (rawCat === 'OUTAGE_NOTICE' || rawCat === 'MAINTENANCE_OUTAGE') {
          dbCategory = 'MAINTENANCE_OUTAGE';
        } else if (rawCat === 'POLICY_UPDATE' || rawCat === 'TARIFF_POLICY') {
          dbCategory = 'TARIFF_POLICY';
        } else if (rawCat === 'WATER_SAFETY') {
          dbCategory = 'WATER_SAFETY';
        } else {
          dbCategory = 'ANNOUNCEMENT';
        }

        const isOutage = req.body.isOutageAlert ?? (dbCategory === 'MAINTENANCE_OUTAGE');

        // Xu ly hinh anh dai dien (optional)
        const customThumbnail = req.body.thumbnailUrl?.trim() || null;

        if (isMock) {
          return res.status(201).json({
            success: true,
            data: {
              id: `news-${Date.now()}`,
              ...req.body,
              category: dbCategory,
              isOutageAlert: isOutage,
              thumbnailUrl: customThumbnail,
            },
            message: 'Tạo tin tức thành công (Mock)',
          });
        }

        // Tu dong tao slug tu title neu khong duoc cung cap
        const autoSlug = req.body.slug || req.body.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .substring(0, 180) + '-' + Date.now();

        const created = await prisma.news.create({
          data: {
            title: req.body.title,
            slug: autoSlug,
            summary: req.body.summary,
            content: req.body.content,
            category: dbCategory,
            isOutageAlert: isOutage,
            affectedArea: req.body.affectedArea || req.body.affectedAreas || null,
            outageStartTime: req.body.outageStartTime ? new Date(req.body.outageStartTime) : null,
            outageEndTime: req.body.outageEndTime ? new Date(req.body.outageEndTime) : null,
            isPublished: req.body.isPublished ?? true,
          },
        });

        // Cap nhat thumbnail_url truc tiep vao PostgreSQL neu co
        if (customThumbnail) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE news SET thumbnail_url = $1 WHERE id = $2`,
              customThumbnail,
              created.id
            );
          } catch (errThumb) {
            console.error('[News Route] Loi khi luu thumbnail_url vao DB:', errThumb);
          }
        }

        return res.status(201).json({
          success: true,
          data: {
            ...created,
            thumbnailUrl: customThumbnail,
          },
          message: 'Tạo bài viết tin tức thành công',
        });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}


