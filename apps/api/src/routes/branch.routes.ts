import { Router } from 'express';

export function createBranchRouter(): Router {
  const router = Router();

  const branches = [
    {
      id: 'b1',
      code: 'CM-HQ-01',
      name: 'Trụ sở chính & Phòng Giao dịch Khách hàng CAWACO',
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      type: 'HEADQUARTERS',
      phone: '0290 3836 360',
      workingHours: 'Sáng: 07:00 - 11:00 | Chiều: 13:00 - 17:00 (Thứ 2 - Thứ 6)',
      latitude: 9.1768,
      longitude: 105.1502,
    },
    {
      id: 'b2',
      code: 'CM-BR-02',
      name: 'Điểm thu tiền nước & Tiếp nhận khách hàng Phường 5',
      address: 'Đường Trần Hưng Đạo, Phường 5, TP. Cà Mau',
      type: 'PAYMENT_POINT',
      phone: '0290 3836 723',
      workingHours: '07:30 - 16:30 (Thứ 2 - Thứ 7)',
      latitude: 9.1824,
      longitude: 105.1432,
    },
    {
      id: 'b3',
      code: 'CM-BR-03',
      name: 'Xí nghiệp Cấp nước Huyện Trần Văn Thời',
      address: 'Thị trấn Trần Văn Thời, Huyện Trần Văn Thời, Tỉnh Cà Mau',
      type: 'BRANCH',
      phone: '0290 3895 112',
      workingHours: '07:00 - 17:00 (Thứ 2 - Thứ 6)',
      latitude: 9.1121,
      longitude: 104.9812,
    },
  ];

  // GET /api/v1/branches
  router.get('/', (req, res) => {
    res.json({
      success: true,
      data: branches,
    });
  });

  return router;
}
