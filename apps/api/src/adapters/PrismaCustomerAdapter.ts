import { CustomerDto, ICustomerPort, VerifyMeterBindingParams } from '@aquaflow/types';
import { prisma } from '../lib/prisma.js';

/**
 * Adapter truy van thong tin khach hang tu co so du lieu PostgreSQL CAWACO
 * Trien khai port ICustomerPort theo kien truc Ports & Adapters
 */
export class PrismaCustomerAdapter implements ICustomerPort {
  async findByCustomerCode(customerCode: string): Promise<CustomerDto | null> {
    const code = customerCode.trim().toUpperCase();
    const customer = await prisma.customer.findUnique({
      where: { customerCode: code },
    });

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      customerCode: customer.customerCode,
      fullName: customer.fullName,
      address: customer.address,
      phone: customer.phone ?? undefined,
      meterSerialNumber: customer.meterSerialNumber,
      tariffGroup: customer.tariffGroup as CustomerDto['tariffGroup'],
      branchId: customer.branchId,
      isActive: customer.isActive,
    };
  }

  async verifyMeterOwnership(params: VerifyMeterBindingParams): Promise<boolean> {
    const customer = await this.findByCustomerCode(params.customerCode);
    if (!customer) {
      return false;
    }

    if (
      params.meterSerialNumber &&
      customer.meterSerialNumber.toUpperCase() !== params.meterSerialNumber.trim().toUpperCase()
    ) {
      return false;
    }

    return true;
  }
}
