import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export function createMeterReadingRouter(): Router {
  const router = Router();

  // GET /api/v1/meter-readings?customerCode=...&period=...&status=...&search=...
  router.get('/', async (req, res) => {
    try {
      const customerCode = typeof req.query.customerCode === 'string' ? req.query.customerCode.toUpperCase().trim() : null;
      const period = typeof req.query.period === 'string' && req.query.period.trim() !== '' ? req.query.period.trim() : null;
      const status = typeof req.query.status === 'string' && req.query.status.trim() !== '' ? req.query.status.trim() : null;
      const search = typeof req.query.search === 'string' && req.query.search.trim() !== '' ? req.query.search.trim() : null;

      const where: any = {};

      if (customerCode) {
        where.customerCode = customerCode;
      }

      if (period && period !== 'ALL') {
        where.period = period;
      }

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { customerCode: { contains: search, mode: 'insensitive' } },
          { meterId: { contains: search, mode: 'insensitive' } },
          { customer: { fullName: { contains: search, mode: 'insensitive' } } },
          { customer: { address: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const readings = await prisma.meterReading.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        include: {
          customer: {
            select: {
              fullName: true,
              address: true,
              phone: true,
              meterSerialNumber: true,
            },
          },
        },
      });

      // Lay danh sach tat ca cac ky doc de lam filter dropdown
      const allReadings = await prisma.meterReading.findMany({
        select: {
          period: true,
          status: true,
          consumptionM3: true,
        },
      });

      const distinctPeriods = Array.from(new Set(allReadings.map((r) => r.period))).sort().reverse();
      const pendingCount = allReadings.filter((r) => r.status === 'PENDING_REVIEW').length;
      const approvedCount = allReadings.filter((r) => r.status === 'APPROVED').length;
      const rejectedCount = allReadings.filter((r) => r.status === 'REJECTED').length;
      const totalConsumption = allReadings
        .filter((r) => r.status === 'APPROVED')
        .reduce((sum, r) => sum + (r.consumptionM3 || 0), 0);

      return res.json({
        success: true,
        data: readings.map((r) => ({
          id: r.id,
          customerCode: r.customerCode,
          customerName: r.customer?.fullName,
          phone: r.customer?.phone,
          address: r.customer?.address,
          meterId: r.meterId,
          period: r.period,
          previousReading: r.previousReading,
          currentReading: r.currentReading,
          consumptionM3: r.consumptionM3,
          photoUrl: r.photoUrl,
          notes: r.notes,
          status: r.status,
          submittedAt: r.submittedAt.toISOString(),
        })),
        stats: {
          total: allReadings.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          totalConsumption,
          periods: distinctPeriods,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  });

  // POST /api/v1/meter-readings
  router.post('/', async (req, res) => {
    try {
      const {
        customerCode,
        meterId,
        period,
        previousReading,
        currentReading,
        photoUrl,
        notes,
        userId,
      } = req.body;

      if (!customerCode || currentReading === undefined || previousReading === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'THIEU_THONG_TIN',
            message: 'Vui lòng cung cấp mã danh bộ, chỉ số cũ và chỉ số mới.',
          },
        });
      }

      const formattedCode = customerCode.toUpperCase().trim();
      const prev = Number(previousReading);
      const curr = Number(currentReading);

      if (curr < prev) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CHI_SO_KHONG_HOP_LE',
            message: `Chỉ số mới (${curr}) không được nhỏ hơn chỉ số kỳ trước (${prev}).`,
          },
        });
      }

      // Kiem tra khach hang co ton tai khong
      const customer = await prisma.customer.findUnique({
        where: { customerCode: formattedCode },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: `Không tìm thấy mã danh bộ ${formattedCode} trong hệ thống CAWACO.`,
          },
        });
      }

      const consumptionM3 = curr - prev;
      const currentPeriod = period || new Date().toISOString().slice(0, 7);

      const created = await prisma.meterReading.create({
        data: {
          customerCode: formattedCode,
          meterId: meterId || customer.meterSerialNumber || 'MTR-DEFAULT',
          period: currentPeriod,
          previousReading: prev,
          currentReading: curr,
          consumptionM3,
          photoUrl: photoUrl || null,
          notes: notes ? notes.trim() : null,
          userId: userId || null,
          status: 'PENDING_REVIEW',
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          reading: {
            id: created.id,
            customerCode: created.customerCode,
            meterId: created.meterId,
            period: created.period,
            previousReading: created.previousReading,
            currentReading: created.currentReading,
            consumptionM3: created.consumptionM3,
            photoUrl: created.photoUrl,
            notes: created.notes,
            status: created.status,
            submittedAt: created.submittedAt.toISOString(),
          },
          message: `Gửi chỉ số thành công (Mã phiếu: ${created.id.slice(0, 8).toUpperCase()}). CAWACO sẽ đối soát và cập nhật vào kỳ hóa đơn tiếp theo.`,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  });

  // PATCH /api/v1/meter-readings/:id/status (Admin phe duyet chi so)
  router.patch('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!['PENDING_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: 'Trạng thái duyệt không hợp lệ.' },
        });
      }

      const updateData: any = { status };
      if (typeof notes === 'string') {
        updateData.notes = notes.trim();
      }

      const updated = await prisma.meterReading.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: {
              fullName: true,
              address: true,
              phone: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      });
    }
  });

  return router;
}

