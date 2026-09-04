import { Router } from 'express';
import { PrismaClient, RegistrationStatus, TariffGroup } from '@prisma/client';
import { CreateRegistrationSchema } from '@aquaflow/validation';

const prisma = new PrismaClient();

export function createRegistrationRouter(): Router {
  const router = Router();

  // POST /api/v1/registrations (Nop ho so dang ky lap moi dong ho nuoc)
  router.post('/', async (req, res, next) => {
    try {
      const validatedData = CreateRegistrationSchema.parse(req.body);
      const {
        fullName,
        phone,
        idCardNumber,
        district,
        ward,
        streetAddress,
        purpose = 'DOMESTIC_TP',
        attachedDocs = [],
        userId,
      } = validatedData;

      // Sinh ma ho so tu dong REG-2026-XXXX
      const count = await prisma.waterRegistration.count();
      const codeNumber = String(count + 1).padStart(4, '0');
      const registrationCode = `REG-2026-${codeNumber}`;

      const registration = await prisma.waterRegistration.create({
        data: {
          registrationCode,
          userId: userId || null,
          fullName: fullName.trim(),
          phone: phone.trim(),
          idCardNumber: idCardNumber.trim(),
          district: district.trim(),
          ward: ward.trim(),
          streetAddress: streetAddress.trim(),
          purpose: (purpose as TariffGroup) || TariffGroup.DOMESTIC_TP,
          attachedDocs: Array.isArray(attachedDocs) ? attachedDocs : [],
          status: RegistrationStatus.SUBMITTED,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          registration,
          message: 'Nộp hồ sơ đăng ký lắp mới thành công! Mã hồ sơ của bạn là: ' + registrationCode,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/registrations (Danh sach ho so)
  router.get('/', async (req, res, next) => {
    try {
      const { status, search, phone, userId } = req.query;

      const where: any = {};
      if (status && status !== 'ALL') {
        where.status = status as RegistrationStatus;
      }
      if (userId) {
        where.userId = String(userId);
      }
      if (phone) {
        where.phone = String(phone);
      }
      if (search) {
        where.OR = [
          { registrationCode: { contains: String(search), mode: 'insensitive' } },
          { fullName: { contains: String(search), mode: 'insensitive' } },
          { idCardNumber: { contains: String(search), mode: 'insensitive' } },
          { phone: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const registrations = await prisma.waterRegistration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: registrations,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/v1/registrations/:identifier (Tra cuu chi tiet theo ma ho so hoac CCCD/SDT)
  router.get('/:identifier', async (req, res, next) => {
    try {
      const { identifier } = req.params;

      const item = await prisma.waterRegistration.findFirst({
        where: {
          OR: [
            { registrationCode: identifier.toUpperCase() },
            { idCardNumber: identifier },
            { phone: identifier },
            { id: identifier },
          ],
        },
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: { code: 'KHONG_TIM_THAY', message: 'Không tìm thấy hồ sơ đăng ký phù hợp.' },
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

  // PUT /api/v1/registrations/:id/status (Cap nhat trang thai xu ly - Admin)
  router.put('/:id/status', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, estimatedCost, adminNote, assignedStaffId } = req.body;

      const updated = await prisma.waterRegistration.update({
        where: { id },
        data: {
          ...(status ? { status: status as RegistrationStatus } : {}),
          ...(estimatedCost !== undefined ? { estimatedCost } : {}),
          ...(adminNote !== undefined ? { adminNote } : {}),
          ...(assignedStaffId !== undefined ? { assignedStaffId } : {}),
        },
      });

      res.json({
        success: true,
        data: {
          registration: updated,
          message: 'Cập nhật trạng thái hồ sơ thành công!',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
