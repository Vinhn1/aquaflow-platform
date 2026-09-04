import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function createAssistantRouter(): Router {
  const router = Router();

  // POST /api/v1/assistant/ask (Hoi dap thong minh voi Tro ly ao CAWACO)
  router.post('/ask', async (req, res, next) => {
    try {
      const { question = '', customerCode, userId } = req.body;
      const q = question.toLowerCase().trim();

      if (!q) {
        return res.status(400).json({
          success: false,
          error: { code: 'THIEU_CAU_HOI', message: 'Vui lòng nhập câu hỏi.' },
        });
      }

      let answer = '';
      let actionType: string | null = null;
      let actionData: any = null;

      // 1. Tra cuu tien nuoc / hoa don
      if (q.includes('tiền nước') || q.includes('hóa đơn') || q.includes('bao nhiêu tiền') || q.includes('nợ cước')) {
        const code = customerCode || 'CM102938';
        const customer = await prisma.customer.findUnique({
          where: { customerCode: code },
          include: {
            invoices: {
              where: { status: 'UNPAID' },
              orderBy: { period: 'desc' },
              take: 1,
            },
          },
        });

        if (customer && customer.invoices.length > 0) {
          const inv = customer.invoices[0];
          const totalFormatted = new Intl.NumberFormat('vi-VN').format(Number(inv.totalAmount));
          answer = `Dạ, theo mã danh bộ **${customer.customerCode}** (${customer.fullName}), kỳ nước tháng **${inv.period}** của gia đình tiêu thụ **${inv.consumptionM3} m³**, tổng số tiền cần thanh toán là **${totalFormatted} VNĐ** (Hạn nộp: ${new Date(inv.dueDate).toLocaleDateString('vi-VN')}). Bạn có thể quét mã VietQR để thanh toán ngay nhé!`;
          actionType = 'NAVIGATE_INVOICE';
          actionData = { invoiceId: inv.id };
        } else {
          answer = `Dạ, mã danh bộ **${code}** hiện tại đã thanh toán đầy đủ các kỳ tiền nước, không có nợ cước tồn đọng ạ!`;
        }
      }
      // 2. Hoi ve gia nuoc
      else if (q.includes('giá nước') || q.includes('bậc thang') || q.includes('biểu giá')) {
        answer = `Biểu giá nước sinh hoạt hộ gia đình tại TP. Cà Mau hiện nay được chia theo 4 bậc lũy tiến:\n- Bậc 1 (1 - 10 m³): 6.800 đ/m³\n- Bậc 2 (11 - 20 m³): 8.200 đ/m³\n- Bậc 3 (21 - 30 m³): 10.500 đ/m³\n- Bậc 4 (> 30 m³): 13.000 đ/m³\n*(Chưa bao gồm VAT 5% và Phí bảo vệ môi trường 10%)*`;
      }
      // 3. Hoi ve dang ky lap moi
      else if (q.includes('lắp mới') || q.includes('gắn đồng hồ') || q.includes('đăng ký nước')) {
        answer = `Để đăng ký lắp mới đồng hồ nước tại Cà Mau, Quý khách có thể sử dụng chức năng **"Đăng ký lắp mới"** trực tuyến ngay trên Mini App. Quý khách chỉ cần chuẩn bị ảnh chụp:\n1. Căn cước công dân (CCCD)\n2. Giấy chứng nhận QSD đất hoặc Hợp đồng thuê nhà/Giấy phép xây dựng.\nCAWACO sẽ tiếp nhận và cử kỹ thuật viên đến khảo sát miễn phí trong 48h làm việc!`;
        actionType = 'NAVIGATE_REGISTRATION';
      }
      // 4. Hoi ve bao su co / cup nuoc
      else if (q.includes('cúp nước') || q.includes('bể ống') || q.includes('vỡ ống') || q.includes('mất nước') || q.includes('sự cố')) {
        const outages = await prisma.news.findMany({
          where: { isOutageAlert: true, isPublished: true },
          take: 1,
        });

        if (outages.length > 0) {
          const alert = outages[0];
          answer = `Khu vực hiện có thông báo bảo trì: **${alert.title}** (${alert.affectedArea || 'TP. Cà Mau'}).\nNếu bạn phát hiện sự cố rò rỉ hoặc vỡ ống đột xuất, vui lòng bấm nút **"Báo sự cố"** hoặc gọi Tổng đài trực 24/7: **0290 3836 360**.`;
        } else {
          answer = `Hiện tại mạng lưới cấp nước đang vận hành bình thường. Nếu khu vực nhà bạn bị mất nước hoặc rò rỉ, vui lòng sử dụng chức năng **"Báo sự cố"** kèm ảnh và tọa độ GPS để đội kỹ thuật đến xử lý ngay ạ!`;
        }
        actionType = 'NAVIGATE_COMPLAINT';
      }
      // 5. Hoi ve dia chi, tong dai
      else if (q.includes('địa chỉ') || q.includes('trụ sở') || q.includes('tổng đài') || q.includes('liên hệ') || q.includes('hotline')) {
        answer = `**CÔNG TY CỔ PHẦN CẤP NƯỚC CÀ MAU (CAWACO):**\n- **Trụ sở chính:** Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau.\n- **Tổng đài CSKH & Sự cố khẩn cấp (24/7):** 0290 3836 360\n- **Thời gian làm việc tại quầy:** 07:00 - 17:00 (Thứ 2 đến Thứ 6)`;
      }
      // 6. Cau hoi mac dinh
      else {
        answer = `Dạ, Trợ lý ảo CAWACO có thể hỗ trợ Quý khách các thông tin:\n1. Tra cứu hóa đơn & tiền nước theo mã danh bộ\n2. Hướng dẫn thủ tục lắp mới / sang tên đồng hồ nước\n3. Tra cứu lịch cúp nước & điểm thu hộ gần nhất\n4. Hướng dẫn tính tiền nước bậc thang theo quy định\n\nQuý khách muốn tìm hiểu nội dung nào ạ?`;
      }

      res.json({
        success: true,
        data: {
          answer,
          actionType,
          actionData,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
