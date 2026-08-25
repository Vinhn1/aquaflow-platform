import { CustomerDto, ICustomerPort, VerifyMeterBindingParams } from '@aquaflow/types';

export class MockCustomerAdapter implements ICustomerPort {
  private customers: Map<string, CustomerDto> = new Map([
    [
      'CM102938',
      {
        id: 'cust-uuid-01',
        customerCode: 'CM102938',
        fullName: 'NGUYỄN VĂN AN',
        address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
        phone: '0918234567',
        meterSerialNumber: 'MTR-88291',
        tariffGroup: 'DOMESTIC_TP',
        branchId: 'b1',
        isActive: true,
      },
    ],
    [
      'CM204819',
      {
        id: 'cust-uuid-02',
        customerCode: 'CM204819',
        fullName: 'NGUYỄN THỊ MAI',
        address: 'Khóm 4, Phường 5, TP. Cà Mau',
        phone: '0919876543',
        meterSerialNumber: 'MTR-99102',
        tariffGroup: 'DOMESTIC_TP',
        branchId: 'b1',
        isActive: true,
      },
    ],
    [
      'CM309182',
      {
        id: 'cust-uuid-03',
        customerCode: 'CM309182',
        fullName: 'TRẦN VĂN HÙNG',
        address: 'Thị trấn Trần Văn Thời, Huyện Trần Văn Thời, Tỉnh Cà Mau',
        phone: '0945112233',
        meterSerialNumber: 'MTR-33441',
        tariffGroup: 'DOMESTIC_DISTRICT',
        branchId: 'b3',
        isActive: true,
      },
    ],
  ]);

  async findByCustomerCode(customerCode: string): Promise<CustomerDto | null> {
    const code = customerCode.trim().toUpperCase();
    return this.customers.get(code) || null;
  }

  async verifyMeterOwnership(params: VerifyMeterBindingParams): Promise<boolean> {
    const customer = await this.findByCustomerCode(params.customerCode);
    if (!customer) return false;
    if (params.meterSerialNumber && customer.meterSerialNumber !== params.meterSerialNumber.trim().toUpperCase()) {
      return false;
    }
    return true;
  }
}
