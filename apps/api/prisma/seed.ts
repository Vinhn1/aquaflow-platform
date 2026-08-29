import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[CAWACO Seed] Bat dau khoi tao du lieu mau...');

  // 1. Tao Chi nhanh tru so chinh CAWACO
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
  console.log(`[CAWACO Seed] Da tao Chi nhanh: ${branch.name}`);

  // 2. Tao Nguoi dung mau
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
  console.log(`[CAWACO Seed] Da tao Nguoi dung: ${user.fullName}`);

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
  console.log('[CAWACO Seed] Da tao thong bao cup nuoc mau');

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
