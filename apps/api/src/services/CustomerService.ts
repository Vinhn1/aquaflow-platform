import { CustomerDto, ICustomerPort } from '@aquaflow/types';

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
  private userMeters: UserMeterRecord[] = [
    {
      id: 'um-01',
      userId: 'usr-zalo-8891',
      customerCode: 'CM102938',
      ownerName: 'NGUYỄN VĂN AN',
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      meterSerialNumber: 'MTR-88291',
      tariffGroup: 'DOMESTIC_TP',
      label: 'Nhà riêng',
      isDefault: true,
    },
    {
      id: 'um-02',
      userId: 'usr-zalo-8891',
      customerCode: 'CM204819',
      ownerName: 'NGUYỄN THỊ MAI',
      address: 'Khóm 4, Phường 5, TP. Cà Mau',
      meterSerialNumber: 'MTR-99102',
      tariffGroup: 'DOMESTIC_TP',
      label: 'Nhà ba mẹ',
      isDefault: false,
    },
  ];

  constructor(private readonly customerPort: ICustomerPort) {}

  async findByCode(customerCode: string): Promise<CustomerDto | null> {
    return this.customerPort.findByCustomerCode(customerCode);
  }

  async getUserMeters(userId: string): Promise<UserMeterRecord[]> {
    return this.userMeters.filter((m) => m.userId === userId);
  }

  async linkMeter(userId: string, customerCode: string, label = 'Nhà riêng'): Promise<UserMeterRecord> {
    const customer = await this.customerPort.findByCustomerCode(customerCode);
    if (!customer) {
      throw new Error('MÃ_DANH_BỘ_KHÔNG_TỒN_TẠI: Không tìm thấy mã khách hàng trên hệ thống CAWACO');
    }

    const existing = this.userMeters.find((m) => m.userId === userId && m.customerCode === customer.customerCode);
    if (existing) {
      throw new Error('MÃ_DANH_BỘ_ĐÃ_LIÊN_KẾT: Mã khách hàng này đã được liên kết trong tài khoản của bạn');
    }

    const newRecord: UserMeterRecord = {
      id: `um-${Date.now()}`,
      userId,
      customerCode: customer.customerCode,
      ownerName: customer.fullName,
      address: customer.address,
      meterSerialNumber: customer.meterSerialNumber,
      tariffGroup: customer.tariffGroup,
      label,
      isDefault: this.userMeters.filter((m) => m.userId === userId).length === 0,
    };

    this.userMeters.push(newRecord);
    return newRecord;
  }

  async unlinkMeter(userId: string, meterId: string): Promise<boolean> {
    const index = this.userMeters.findIndex((m) => m.id === meterId && m.userId === userId);
    if (index !== -1) {
      this.userMeters.splice(index, 1);
      return true;
    }
    return false;
  }
}
