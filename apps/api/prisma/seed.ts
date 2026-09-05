import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[CAWACO Seed] Bat dau khoi tao du lieu mau...');

  // 1. Tao Cac Chi nhanh CAWACO
  const branch = await prisma.branch.upsert({
    where: { code: 'CM-HQ-01' },
    update: {},
    create: {
      code: 'CM-HQ-01',
      name: 'Trụ sở chính & Phòng Giao dịch Khách hàng CAWACO',
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      latitude: 9.1768,
      longitude: 105.1502,
      phone: '0290 3836 360',
      isActive: true,
    },
  });

  await prisma.branch.upsert({
    where: { code: 'CM-PGD-01' },
    update: {},
    create: {
      code: 'CM-PGD-01',
      name: 'Phòng Giao dịch Khách hàng Phường 5',
      address: 'Số 45, đường Trần Hưng Đạo, Phường 5, TP. Cà Mau',
      latitude: 9.1825,
      longitude: 105.1558,
      phone: '0290 3831 222',
      isActive: true,
    },
  });

  await prisma.branch.upsert({
    where: { code: 'CM-PGD-02' },
    update: {},
    create: {
      code: 'CM-PGD-02',
      name: 'Chi nhánh Cấp nước Huyện Cái Nước',
      address: 'Thị trấn Cái Nước, Huyện Cái Nước, Tỉnh Cà Mau',
      latitude: 9.0123,
      longitude: 105.0234,
      phone: '0290 3888 999',
      isActive: true,
    },
  });
  console.log(`[CAWACO Seed] Da tao 3 Chi nhanh giao dich CAWACO`);

  // 2. Tao Nguoi dung cong dan mau
  const user = await prisma.user.upsert({
    where: { phone: '0918234567' },
    update: {},
    create: {
      phone: '0918234567',
      zaloId: 'zalo_user_cawaco_01',
      fullName: 'Nguyễn Văn An',
      role: 'CITIZEN',
    },
  });
  console.log(`[CAWACO Seed] Da tao Nguoi dung cong dan: ${user.fullName}`);

  // Helper hash password
  const defaultPasswordHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'; // hash for '123456'

  // 2b. Tao Cac Tai Khoan Can Bo Nhan Vien CAWACO (Staff Accounts)
  await prisma.user.upsert({
    where: { employeeCode: 'CW-ADMIN' },
    update: {},
    create: {
      employeeCode: 'CW-ADMIN',
      email: 'admin@cawaco.com.vn',
      phone: '02903836360',
      fullName: 'Quản Trị Viên Hệ Thống',
      passwordHash: defaultPasswordHash,
      role: 'SUPER_ADMIN',
      branchId: branch.id,
      isActive: true,
    },
  });
  console.log(`[CAWACO Seed] Da khoi tao tai khoan quan tri chinh CW-ADMIN`);

  // 3. Tao Khach hang (Ma danh bo CM102938)
  const customer1 = await prisma.customer.upsert({
    where: { customerCode: 'CM102938' },
    update: {},
    create: {
      customerCode: 'CM102938',
      fullName: 'NGUYỄN VĂN AN',
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      phone: '0918234567',
      meterSerialNumber: 'MTR-88291',
      tariffGroup: 'DOMESTIC_TP',
      branchId: branch.id,
      isActive: true,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { customerCode: 'CM204819' },
    update: {},
    create: {
      customerCode: 'CM204819',
      fullName: 'NGUYỄN THỊ MAI',
      address: 'Khóm 4, Phường 5, TP. Cà Mau',
      phone: '0919876543',
      meterSerialNumber: 'MTR-99102',
      tariffGroup: 'DOMESTIC_TP',
      branchId: branch.id,
      isActive: true,
    },
  });
  console.log('[CAWACO Seed] Da tao 2 Ma danh bo: CM102938 va CM204819');

  // 4. Lien ket Ma danh bo voi Nguoi dung
  await prisma.userMeter.upsert({
    where: {
      userId_customerId: {
        userId: user.id,
        customerId: customer1.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      customerId: customer1.id,
      label: 'Nhà riêng',
      isDefault: true,
    },
  });

  await prisma.userMeter.upsert({
    where: {
      userId_customerId: {
        userId: user.id,
        customerId: customer2.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      customerId: customer2.id,
      label: 'Nhà ba mẹ',
      isDefault: false,
    },
  });
  console.log('[CAWACO Seed] Da lien ket ma danh bo cho nguoi dung');

  // 5. Tao Hoa don tien nuoc
  await prisma.invoice.upsert({
    where: { invoiceCode: 'INV-2026-08-001' },
    update: {},
    create: {
      invoiceCode: 'INV-2026-08-001',
      customerId: customer1.id,
      period: '2026-08',
      previousIndex: 120,
      currentIndex: 145,
      consumptionM3: 25,
      baseAmount: 195000,
      vatRate: 0.05,
      vatAmount: 9750,
      environmentalFeeRate: 0.10,
      environmentalFeeAmount: 19500,
      totalAmount: 224250,
      status: 'UNPAID',
      dueDate: new Date('2026-09-05T00:00:00.000Z'),
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceCode: 'INV-2026-07-001' },
    update: {},
    create: {
      invoiceCode: 'INV-2026-07-001',
      customerId: customer1.id,
      period: '2026-07',
      previousIndex: 98,
      currentIndex: 120,
      consumptionM3: 22,
      baseAmount: 166200,
      vatRate: 0.05,
      vatAmount: 8310,
      environmentalFeeRate: 0.10,
      environmentalFeeAmount: 16620,
      totalAmount: 191130,
      status: 'PAID',
      dueDate: new Date('2026-08-05T00:00:00.000Z'),
      paidAt: new Date('2026-08-02T10:30:00.000Z'),
    },
  });
  console.log('[CAWACO Seed] Da tao 2 ky hoa don');

  // 6. Tao Tin tuc & Canh bao cup nuoc
  await prisma.news.upsert({
    where: { slug: 'thong-bao-tam-ngung-cap-nuoc-tuyen-quang-trung' },
    update: {},
    create: {
      title: 'Thông báo tạm ngưng cấp nước phục vụ đấu nối mạng lưới tuyến đường Quang Trung',
      slug: 'thong-bao-tam-ngung-cap-nuoc-tuyen-quang-trung',
      summary: 'Công ty Cổ phần Cấp nước Cà Mau trân trọng thông báo tạm ngưng cung cấp nước sạch để thi công đấu nối tuyến ống D300.',
      content: 'Chi tiết thời gian thi công đấu nối mạng lưới cấp nước...',
      category: 'MAINTENANCE_OUTAGE',
      isOutageAlert: true,
      affectedArea: 'Khu vực Phường Tân Thành và một phần Phường 5, TP. Cà Mau',
      outageStartTime: new Date('2026-08-28T22:00:00.000Z'),
      outageEndTime: new Date('2026-08-29T04:00:00.000Z'),
      isPublished: true,
    },
  });

  await prisma.news.upsert({
    where: { slug: 'huong-dan-thanh-toan-tien-nuoc-qua-vietqr' },
    update: {},
    create: {
      title: 'Hướng dẫn thanh toán tiền nước trực tuyến qua VietQR và Zalo Mini App',
      slug: 'huong-dan-thanh-toan-tien-nuoc-qua-vietqr',
      summary: 'Khách hàng có thể dễ dàng thanh toán tiền nước mọi lúc mọi nơi thông qua quét mã VietQR tự động gạch nợ.',
      content: 'Hướng dẫn các bước thanh toán tiền nước...',
      category: 'ANNOUNCEMENT',
      isOutageAlert: false,
      isPublished: true,
    },
  });

  await prisma.news.upsert({
    where: { slug: 'khuyen-cao-su-dung-nuoc-tiet-kiem-mua-kho' },
    update: {},
    create: {
      title: 'Khuyến cáo sử dụng nước tiết kiệm và an toàn trong mùa khô',
      slug: 'khuyen-cao-su-dung-nuoc-tiet-kiem-mua-kho',
      summary: 'Các biện pháp sử dụng nước sinh hoạt hiệu quả, phòng chống hạn hán và xâm nhập mặn.',
      content: 'Nội dung tuyên truyền tiết kiệm nước...',
      category: 'WATER_SAFETY',
      isOutageAlert: false,
      isPublished: true,
    },
  });
  console.log('[CAWACO Seed] Da tao 3 thong bao tin tuc mau');

  // 7. Tao Danh sach Dai ly Thu ho Tien nuoc tai Ca Mau
  const agentsData = [
    {
      name: 'Bưu điện Trung tâm TP. Cà Mau - VNPost',
      agentType: 'VNPOST',
      district: 'TP_CA_MAU',
      address: 'Số 02, đường Lưu Tấn Tài, Phường 5, TP. Cà Mau',
      latitude: 9.1795,
      longitude: 105.1524,
      phone: '0290 3831 018',
      openingHours: '07:00 - 18:00 (Thứ 2 - Thứ 7)',
    },
    {
      name: 'Bưu cục Giao dịch Phường 7 - VNPost',
      agentType: 'VNPOST',
      district: 'TP_CA_MAU',
      address: 'Số 148, đường Nguyễn Tất Thành, Phường 7, TP. Cà Mau',
      latitude: 9.1672,
      longitude: 105.1435,
      phone: '0290 3824 555',
      openingHours: '07:30 - 17:30',
    },
    {
      name: 'Cửa hàng Viettel Post Trần Hưng Đạo',
      agentType: 'VIETTEL_POST',
      district: 'TP_CA_MAU',
      address: 'Số 88, đường Trần Hưng Đạo, Phường 5, TP. Cà Mau',
      latitude: 9.1812,
      longitude: 105.1543,
      phone: '1900 8095',
      openingHours: '07:30 - 20:00 (Cả Chủ Nhật)',
    },
    {
      name: 'Điểm thu hộ Payoo FPT Shop Quang Trung',
      agentType: 'PAYOO',
      district: 'TP_CA_MAU',
      address: 'Số 122, đường Quang Trung, Phường Tân Thành, TP. Cà Mau',
      latitude: 9.1751,
      longitude: 105.1488,
      phone: '1800 6601',
      openingHours: '08:00 - 21:30',
    },
    {
      name: 'Ngân hàng Agribank Chi nhánh Tỉnh Cà Mau',
      agentType: 'BANK',
      district: 'TP_CA_MAU',
      address: 'Số 06, đường An Dương Vương, Phường 7, TP. Cà Mau',
      latitude: 9.1715,
      longitude: 105.1491,
      phone: '0290 3838 522',
      openingHours: '07:30 - 16:30 (Thứ 2 - Thứ 6)',
    },
    {
      name: 'Bưu cục Huyện Thới Bình - VNPost',
      agentType: 'VNPOST',
      district: 'THOI_BINH',
      address: 'Khóm 1, Thị trấn Thới Bình, Huyện Thới Bình, Tỉnh Cà Mau',
      latitude: 9.3512,
      longitude: 105.1321,
      phone: '0290 3861 234',
      openingHours: '07:30 - 17:00',
    },
    {
      name: 'Bưu điện Huyện Cái Nước - VNPost',
      agentType: 'VNPOST',
      district: 'CAI_NUOC',
      address: 'Khóm 2, Thị trấn Cái Nước, Huyện Cái Nước, Tỉnh Cà Mau',
      latitude: 9.0145,
      longitude: 105.0210,
      phone: '0290 3883 111',
      openingHours: '07:30 - 17:00',
    },
    {
      name: 'Cửa hàng Viettel Post Trần Văn Thời',
      agentType: 'VIETTEL_POST',
      district: 'TRAN_VAN_THOI',
      address: 'Khóm 7, Thị trấn Trần Văn Thời, Huyện Trần Văn Thời, Tỉnh Cà Mau',
      latitude: 9.1120,
      longitude: 104.9820,
      phone: '1900 8095',
      openingHours: '07:30 - 18:00',
    }
  ];

  for (const ag of agentsData) {
    const existing = await prisma.paymentAgent.findFirst({ where: { name: ag.name } });
    if (!existing) {
      await prisma.paymentAgent.create({ data: ag });
    }
  }
  console.log(`[CAWACO Seed] Da tao ${agentsData.length} Dai ly thu ho tien nuoc tai Ca Mau`);

  // 8. Tao Danh sach Ha tang Mang luoi Cap nuoc GIS
  const networkNodesData = [
    {
      code: 'PLANT-CM-01',
      name: 'Nhà máy Xử lý Nước ngầm Cà Mau 1',
      nodeType: 'PLANT',
      latitude: 9.1830,
      longitude: 105.1460,
      status: 'NORMAL',
      capacityM3: 25000,
      description: 'Nhà máy cấp nước trung tâm công suất 25.000 m³/ngày đêm, nguồn nước ngầm tầng sâu.',
    },
    {
      code: 'PLANT-CM-02',
      name: 'Nhà máy Xử lý Nước mặt Cà Mau 2 (Hồ Khánh An)',
      nodeType: 'PLANT',
      latitude: 9.2150,
      longitude: 105.0920,
      status: 'NORMAL',
      capacityM3: 40000,
      description: 'Nhà máy khai thác nguồn nước mặt thô Hồ Khánh An - sông Ông Đốc.',
    },
    {
      code: 'BOOSTER-LVL',
      name: 'Trạm Bơm Tăng Áp Lý Văn Lâm',
      nodeType: 'BOOSTER',
      latitude: 9.1550,
      longitude: 105.1380,
      status: 'NORMAL',
      capacityM3: 15000,
      description: 'Trạm điều áp và phân phối nước khu vực phía Nam thành phố và tuyến Quốc lộ 1A.',
    },
    {
      code: 'BOOSTER-TACTHU',
      name: 'Trạm Tăng Áp & Điều Tiết Tắc Thủ',
      nodeType: 'BOOSTER',
      latitude: 9.1720,
      longitude: 105.0850,
      status: 'NORMAL',
      capacityM3: 12000,
      description: 'Trạm tăng áp phục vụ tuyến đường hành lang ven biển và huyện U Minh.',
    },
    {
      code: 'HYDRANT-QT-01',
      name: 'Trụ Cứu Hỏa Giao lộ Quang Trung - Phan Ngọc Hiển',
      nodeType: 'HYDRANT',
      latitude: 9.1772,
      longitude: 105.1510,
      status: 'NORMAL',
      description: 'Trụ cứu hỏa đô thị D100 chuẩn PCCC tỉnh Cà Mau.',
    },
    {
      code: 'MAINT-D300-QT',
      name: 'Điểm Thi Công Đấu Nối Ống D300 Quang Trung',
      nodeType: 'MAINTENANCE',
      latitude: 9.1765,
      longitude: 105.1495,
      status: 'MAINTENANCE',
      description: 'Khu vực thi công cải tạo tuyến ống cấp nước chính phục vụ mở rộng đô thị.',
    }
  ];

  for (const node of networkNodesData) {
    await prisma.waterNetworkNode.upsert({
      where: { code: node.code },
      update: {},
      create: node,
    });
  }
  console.log(`[CAWACO Seed] Da tao ${networkNodesData.length} nut ha tang GIS mang luoi nuoc`);

  // 9. Tao Ho so Dang ky lap moi mau
  await prisma.waterRegistration.upsert({
    where: { registrationCode: 'REG-2026-001' },
    update: {},
    create: {
      registrationCode: 'REG-2026-001',
      userId: user.id,
      fullName: 'Nguyễn Văn An',
      phone: '0918234567',
      idCardNumber: '096088001234',
      district: 'TP. Cà Mau',
      ward: 'Phường Tân Thành',
      streetAddress: 'Số 204, đường Quang Trung, Khóm 26',
      purpose: 'DOMESTIC_TP',
      attachedDocs: ['/uploads/cccd_front.jpg', '/uploads/giay_nha_dat.jpg'],
      status: 'SURVEYING',
      estimatedCost: 1850000,
      adminNote: 'Đã phân công kỹ thuật viên khảo sát thực tế vị trí đồng hồ ngày 29/08/2026.',
    },
  });

  // 10. Tao Khao sat y kien CSAT mau
  await prisma.customerSurvey.create({
    data: {
      userId: user.id,
      customerCode: 'CM102938',
      waterQualityScore: 5,
      serviceScore: 5,
      supportScore: 4,
      comment: 'Chất lượng nước sạch rất trong và áp lực nước sinh hoạt mạnh, nhân viên giao dịch tận tình.',
    },
  });

  // 11. Tao Gop y mau
  await prisma.customerFeedback.upsert({
    where: { ticketCode: 'FB-2026-001' },
    update: {},
    create: {
      ticketCode: 'FB-2026-001',
      userId: user.id,
      fullName: 'Nguyễn Văn An',
      phone: '0918234567',
      email: 'an.nguyen@gmail.com',
      title: 'Đề xuất nâng cấp tiện ích thông báo cúp nước qua Zalo Mini App',
      content: 'Rất hoan nghênh CAWACO đã triển khai ứng dụng Zalo Mini App, mong công ty gửi thông báo trước 24h khi có kế hoạch súc xả đường ống định kỳ.',
      category: 'GOP_Y',
      replyContent: 'CAWACO chân thành cảm ơn ý kiến đóng góp quý báu của Quý khách. Công ty đã cấu hình gửi tin nhắn Zalo ZNS tự động trước 24h.',
      isResolved: true,
      resolvedAt: new Date(),
    },
  });

  console.log('[CAWACO Seed] Hoan tat khoi tao du lieu seed thanh cong.');
}

main()
  .catch((e) => {
    console.error('[CAWACO Seed] Loi khi seed du lieu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
