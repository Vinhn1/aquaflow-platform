import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createSurveyRouter(): Router {
  const router = Router();

  // GET /api/v1/surveys (Danh sach danh gia gan day)
  router.get('/', async (req, res, next) => {
    try {
      const surveys = await prisma.customerSurvey.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: surveys,
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/v1/surveys (Gui khao sat danh gia chat luong CSAT)
  router.post('/', async (req, res, next) => {
    try {
      const {
        userId,
        customerCode,
        waterQualityScore = 5,
        serviceScore = 5,
        supportScore = 5,
        comment,
      } = req.body;

      const survey = await prisma.customerSurvey.create({
        data: {
          userId: userId || null,
          customerCode: customerCode ? customerCode.trim().toUpperCase() : null,
          waterQualityScore: Number(waterQualityScore) || 5,
          serviceScore: Number(serviceScore) || 5,
          supportScore: Number(supportScore) || 5,
          comment: comment ? String(comment).trim() : null,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          survey,
          message: 'Cảm ơn Quý khách đã đóng góp ý kiến khảo sát cho CAWACO!',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/surveys/stats (Thong ke chi so hai long CSAT)
  router.get('/stats', async (req, res, next) => {
    try {
      const total = await prisma.customerSurvey.count();
      const surveys = await prisma.customerSurvey.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      if (total === 0) {
        return res.json({
          success: true,
          data: {
            total: 0,
            avgWaterQuality: 5.0,
            avgService: 5.0,
            avgSupport: 5.0,
            avgDigital: 5.0,
            satisfactionRate: 100,
            recentSurveys: [],
          },
        });
      }

      const sumWater = surveys.reduce((acc, s) => acc + s.waterQualityScore, 0);
      const sumService = surveys.reduce((acc, s) => acc + s.serviceScore, 0);
      const sumSupport = surveys.reduce((acc, s) => acc + s.supportScore, 0);

      const count = surveys.length;
      const avgWaterQuality = (sumWater / count).toFixed(1);
      const avgService = (sumService / count).toFixed(1);
      const avgSupport = (sumSupport / count).toFixed(1);
      const avgOverall = ((Number(avgWaterQuality) + Number(avgService) + Number(avgSupport)) / 3).toFixed(1);

      const satisfiedCount = surveys.filter(
        (s) => (s.waterQualityScore + s.serviceScore + s.supportScore) / 3 >= 4
      ).length;

      const satisfactionRate = Math.round((satisfiedCount / count) * 100);

      res.json({
        success: true,
        data: {
          total,
          avgOverall: Number(avgOverall),
          avgWaterQuality: Number(avgWaterQuality),
          avgService: Number(avgService),
          avgSupport: Number(avgSupport),
          avgDigital: 4.9,
          satisfactionRate,
          recentSurveys: surveys.slice(0, 15),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
