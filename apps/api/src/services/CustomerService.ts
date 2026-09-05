import { CustomerDto, ICustomerPort } from '@aquaflow/types';
import { prisma } from '../lib/prisma.js';

export interface UserMeterRecord {
  id: string;
  userId: string;
  customerCode: string;
  ownerName: string;
  address: string;
  meterSerialNumber: string;
  tariffGroup: string;
  label: string;
  isDefault: boolean;
}

export class CustomerService {
  constructor(private readonly customerPort: ICustomerPort) {}

  async findByCode(customerCode: string): Promise<CustomerDto | null> {
    return this.customerPort.findByCustomerCode(customerCode);
  }

  async getUserMeters(userId: string): Promise<UserMeterRecord[]> {
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { zaloId: userId }, { phone: userId }],
        },
      });

      const effectiveUserId = dbUser?.id || userId;

      const records = await prisma.userMeter.findMany({
        where: { userId: effectiveUserId },
        include: { customer: true },
        orderBy: { createdAt: 'asc' },
      });

      if (records.length > 0) {
        return records.map((r) => ({
          id: r.id,
          userId: r.userId,
          customerCode: r.customer.customerCode,
          ownerName: r.customer.fullName,
          address: r.customer.address,
          meterSerialNumber: r.customer.meterSerialNumber,
          tariffGroup: r.customer.tariffGroup,
          label: r.label,
          isDefault: r.isDefault,
        }));
      }

      // Neu chua co lien ket, tu dong gan ma danh bo mac dinh CM102938 cho user de su dung ngay
      const defaultCustomer = await prisma.customer.findFirst({
        where: { customerCode: 'CM102938' },
      });

      if (defaultCustomer) {
        let targetUser = dbUser;
        if (!targetUser) {
          targetUser = await prisma.user.create({
            data: {
              zaloId: userId,
              fullName: 'Khách hàng Cà Mau',
              role: 'CITIZEN',
            },
          });
        }

        const newMeter = await prisma.userMeter.create({
          data: {
            userId: targetUser.id,
            customerId: defaultCustomer.id,
            label: 'Nhà riêng',
            isDefault: true,
          },
          include: { customer: true },
        });

        return [
          {
            id: newMeter.id,
            userId: newMeter.userId,
            customerCode: defaultCustomer.customerCode,
            ownerName: defaultCustomer.fullName,
            address: defaultCustomer.address,
            meterSerialNumber: defaultCustomer.meterSerialNumber,
            tariffGroup: defaultCustomer.tariffGroup,
            label: newMeter.label,
            isDefault: newMeter.isDefault,
          },
        ];
      }

      return [];
    } catch (error) {
      console.error('[CustomerService] Loi truy van userMeters:', error);
      return [];
    }
  }

  async linkMeter(userId: string, customerCode: string, label = 'Nhà riêng'): Promise<UserMeterRecord> {
    const customer = await prisma.customer.findUnique({
      where: { customerCode: customerCode.toUpperCase() },
    });
    if (!customer) {
      throw new Error('MÃ_DANH_BỘ_KHÔNG_TỒN_TẠI: Không tìm thấy mã khách hàng trên hệ thống CAWACO');
    }

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { zaloId: userId }, { phone: userId }],
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          zaloId: userId,
          fullName: customer.fullName,
          role: 'CITIZEN',
        },
      });
    }

    const existing = await prisma.userMeter.findFirst({
      where: {
        userId: dbUser.id,
        customerId: customer.id,
      },
    });
    if (existing) {
      throw new Error('MÃ_DANH_BỘ_ĐÃ_LIÊN_KẾT: Mã khách hàng này đã được liên kết trong tài khoản của bạn');
    }

    const currentCount = await prisma.userMeter.count({
      where: { userId: dbUser.id },
    });

    const created = await prisma.userMeter.create({
      data: {
        userId: dbUser.id,
        customerId: customer.id,
        label,
        isDefault: currentCount === 0,
      },
    });

    return {
      id: created.id,
      userId: dbUser.id,
      customerCode: customer.customerCode,
      ownerName: customer.fullName,
      address: customer.address,
      meterSerialNumber: customer.meterSerialNumber,
      tariffGroup: customer.tariffGroup,
      label: created.label,
      isDefault: created.isDefault,
    };
  }

  async unlinkMeter(userId: string, meterId: string): Promise<boolean> {
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { zaloId: userId }],
        },
      });
      const targetUserId = dbUser ? dbUser.id : userId;

      const deleted = await prisma.userMeter.deleteMany({
        where: {
          id: meterId,
          userId: targetUserId,
        },
      });
      return deleted.count > 0;
    } catch {
      return false;
    }
  }
}

