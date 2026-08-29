import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export function createBranchRouter(): Router {
  const router = Router();
  const isMock = process.env.MOCK_CAWACO_API === 'true';

  const mockBranches = [
    {
      id: 'b1',
      code: 'CM-HQ-01',
      name: 'Trụ sở chính & Phòng Giao dịch Khách hàng CAWACO',
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      phone: '0290 3836 360',
      workingHours: 'Sáng: 07:00 - 11:00 | Chiều: 13:00 - 17:00 (Thứ 2 - Thứ 6)',
      latitude: 9.1768,
      longitude: 105.1502,
    },
  ];

  // GET /api/v1/branches
  router.get('/', async (req, res, next) => {
    try {
      if (isMock) {
        return res.json({ success: true, data: mockBranches });
      }
      const branches = await prisma.branch.findMany({
        where: { isActive: true },
      });
      return res.json({ success: true, data: branches });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
