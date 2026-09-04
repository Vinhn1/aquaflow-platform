import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createFeedbackRouter(): Router {
  const router = Router();

  // POST /api/v1/feedbacks (Gui gop y, phan anh)
  router.post('/', async (req, res, next) => {
    try {
      const {
        userId,
        fullName,
        phone,
        email,
        title,
        content,
        category = 'GOP_Y',
      } = req.body;

      if (!fullName || !phone || !title || !content) {
        return res.status(400).json({
          success: false,
          error: { code: 'THIEU_THONG_TIN', message: 'Vui lòng điền họ tên, số điện thoại, tiêu đề và nội dung góp ý.' },
        });
      }

      const count = await prisma.customerFeedback.count();
      const codeNumber = String(count + 1).padStart(4, '0');
      const ticketCode = `FB-2026-${codeNumber}`;

      const feedback = await prisma.customerFeedback.create({
        data: {
          ticketCode,
          userId: userId || null,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email ? email.trim() : null,
          title: title.trim(),
          content: content.trim(),
          category: category || 'GOP_Y',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          feedback,
          message: 'Gửi góp ý thành công! Mã phiếu của bạn là ' + ticketCode + '. CAWACO sẽ phản hồi trong thời gian sớm nhất.',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/feedbacks (Danh sach gop y)
  router.get('/', async (req, res, next) => {
    try {
      const { category, isResolved, search, phone } = req.query;

      const where: any = {};
      if (category && category !== 'ALL') {
        where.category = String(category);
      }
      if (isResolved !== undefined) {
        where.isResolved = isResolved === 'true';
      }
      if (phone) {
        where.phone = String(phone);
      }
      if (search) {
        where.OR = [
          { ticketCode: { contains: String(search), mode: 'insensitive' } },
          { fullName: { contains: String(search), mode: 'insensitive' } },
          { title: { contains: String(search), mode: 'insensitive' } },
          { content: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const list = await prisma.customerFeedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/feedbacks/:ticketCode (Tra cuu phan hoi)
  router.get('/:ticketCode', async (req, res, next) => {
    try {
      const { ticketCode } = req.params;

      const item = await prisma.customerFeedback.findFirst({
        where: {
          OR: [
            { ticketCode: ticketCode.toUpperCase() },
            { id: ticketCode },
            { phone: ticketCode },
          ],
        },
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: 'KHONG_TIM_THAY', message: 'Không tìm thấy phiếu góp ý phù hợp.' },
        });
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/v1/feedbacks/:id/reply (Tra loi gop y - Admin)
  router.put('/:id/reply', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { replyContent } = req.body;

      if (!replyContent || !replyContent.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'THIEU_NOI_DUNG', message: 'Nội dung phản hồi không được để trống.' },
        });
      }

      const updated = await prisma.customerFeedback.update({
        where: { id },
        data: {
          replyContent: replyContent.trim(),
          isResolved: true,
          resolvedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: {
          feedback: updated,
          message: 'Đã gửi nội dung phản hồi tới khách hàng thành công!',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
