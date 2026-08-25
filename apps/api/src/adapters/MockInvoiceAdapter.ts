import { ConsumptionHistoryDto, IInvoicePort, InvoiceDto } from '@aquaflow/types';
import { TariffCalculator } from '../services/TariffCalculator.js';

export class MockInvoiceAdapter implements IInvoicePort {
  private invoices: InvoiceDto[] = [];

  constructor() {
    // Khoi tao cac hoa don mau cho khach hang CM102938
    const calcAug = TariffCalculator.calculate(25, 'DOMESTIC_TP');
    const calcJul = TariffCalculator.calculate(22, 'DOMESTIC_TP');

    this.invoices = [
      {
        id: 'inv-uuid-082026',
        invoiceCode: 'INV-2026-08-001',
        customerCode: 'CM102938',
        period: '2026-08',
        previousIndex: 120,
        currentIndex: 145,
        consumptionM3: calcAug.consumptionM3,
        baseAmount: calcAug.baseAmount,
        vatRate: calcAug.vatRate,
        vatAmount: calcAug.vatAmount,
        environmentalFeeRate: calcAug.environmentalFeeRate,
        environmentalFeeAmount: calcAug.environmentalFeeAmount,
        totalAmount: calcAug.totalAmount,
        status: 'UNPAID',
        dueDate: '2026-09-05T00:00:00.000Z',
        breakdown: calcAug.breakdown,
      },
      {
        id: 'inv-uuid-072026',
        invoiceCode: 'INV-2026-07-001',
        customerCode: 'CM102938',
        period: '2026-07',
        previousIndex: 98,
        currentIndex: 120,
        consumptionM3: calcJul.consumptionM3,
        baseAmount: calcJul.baseAmount,
        vatRate: calcJul.vatRate,
        vatAmount: calcJul.vatAmount,
        environmentalFeeRate: calcJul.environmentalFeeRate,
        environmentalFeeAmount: calcJul.environmentalFeeAmount,
        totalAmount: calcJul.totalAmount,
        status: 'PAID',
        dueDate: '2026-08-05T00:00:00.000Z',
        paidAt: '2026-08-02T14:30:00.000Z',
        breakdown: calcJul.breakdown,
      },
    ];
  }

  async getInvoicesByCustomerCode(customerCode: string, status?: string): Promise<InvoiceDto[]> {
    const code = customerCode.trim().toUpperCase();
    return this.invoices.filter((inv) => {
      const matchCode = inv.customerCode === code;
      const matchStatus = status ? inv.status === status : true;
      return matchCode && matchStatus;
    });
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceDto | null> {
    return this.invoices.find((inv) => inv.id === invoiceId) || null;
  }

  async getConsumptionHistory(customerCode: string, monthsLimit = 12): Promise<ConsumptionHistoryDto[]> {
    const invoices = await this.getInvoicesByCustomerCode(customerCode);
    return invoices.slice(0, monthsLimit).map((inv) => ({
      period: inv.period,
      consumptionM3: inv.consumptionM3,
      totalAmount: inv.totalAmount,
    }));
  }

  // Helper method for simulated settlement
  public markAsPaid(invoiceId: string): boolean {
    const invoice = this.invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      invoice.status = 'PAID';
      invoice.paidAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}
