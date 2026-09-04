import { Router } from 'express';

export interface MeterReadingSubmission {
  id: string;
  customerCode: string;
  meterId: string;
  period: string; // VD: '2026-09'
  previousReading: number;
  currentReading: number;
  consumptionM3: number;
  photoUrl?: string;
  notes?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

// In-memory store for meter readings (co san du lieu mau)
const METER_READINGS_STORE: MeterReadingSubmission[] = [
  {
    id: 'MR-2026-001',
    customerCode: 'CM102938',
    meterId: 'MTR-88291',
    period: '2026-08',
    previousReading: 120,
    currentReading: 145,
    consumptionM3: 25,
    status: 'APPROVED',
    submittedAt: '2026-08-03T08:30:00Z',
    notes: 'Chỉ số ghi định kỳ tháng 8/2026',
  },
  {
    id: 'MR-2026-002',
    customerCode: 'CM204819',
    meterId: 'MTR-44910',
    period: '2026-08',
    previousReading: 85,
    currentReading: 103,
    consumptionM3: 18,
    status: 'APPROVED',
    submittedAt: '2026-08-04T09:15:00Z',
  },
];

export function createMeterReadingRouter(): Router {
  const router = Router();

  // GET /api/v1/meter-readings?customerCode=...
  router.get('/', (req, res) => {
    const customerCode = typeof req.query.customerCode === 'string' ? req.query.customerCode.toUpperCase() : null;

    if (!customerCode) {
      return res.json({
        success: true,
        data: METER_READINGS_STORE,
      });
    }

    const readings = METER_READINGS_STORE.filter((r) => r.customerCode === customerCode);
    return res.json({
      success: true,
      data: readings,
    });
  });

  // POST /api/v1/meter-readings
  router.post('/', (req, res) => {
    const {
      customerCode,
      meterId,
      period,
      previousReading,
      currentReading,
      photoUrl,
      notes,
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

    const consumptionM3 = curr - prev;
    const newId = `MR-2026-${String(METER_READINGS_STORE.length + 1).padStart(3, '0')}`;

    const newReading: MeterReadingSubmission = {
      id: newId,
      customerCode: customerCode.toUpperCase(),
      meterId: meterId || 'MTR-DEFAULT',
      period: period || '2026-09',
      previousReading: prev,
      currentReading: curr,
      consumptionM3,
      photoUrl: photoUrl || undefined,
      notes: notes ? notes.trim() : undefined,
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
    };

    METER_READINGS_STORE.unshift(newReading);

    return res.status(201).json({
      success: true,
      data: {
        reading: newReading,
        message: `Gửi chỉ số thành công (Mã phiếu: ${newId}). CAWACO sẽ đối soát và cập nhật vào kỳ hóa đơn tiếp theo.`,
      },
    });
  });

  return router;
}
