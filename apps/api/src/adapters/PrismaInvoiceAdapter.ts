import { ConsumptionHistoryDto, IInvoicePort, InvoiceDto } from '@aquaflow/types';
import { prisma } from '../lib/prisma.js';
import { TariffCalculator, TariffCategory } from '../services/TariffCalculator.js';

/**
 * Adapter truy van va cap nhat hoa don tien nuoc tu co so du lieu PostgreSQL CAWACO
 * Trien khai port IInvoicePort theo kien truc Ports & Adapters
 */
export class PrismaInvoiceAdapter implements IInvoicePort {
  async getInvoicesByCustomerCode(customerCode: string, status?: string): Promise<InvoiceDto[]> {
    const code = customerCode.trim().toUpperCase();

    const customer = await prisma.customer.findUnique({
      where: { customerCode: code },
    });

    if (!customer) {
      return [];
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        customerId: customer.id,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { period: 'desc' },
    });

    return invoices.map((inv) => {
      const calc = TariffCalculator.calculate(
        inv.consumptionM3,
        (customer.tariffGroup as TariffCategory) || 'DOMESTIC_TP',
      );

      return {
        id: inv.id,
        invoiceCode: inv.invoiceCode,
        customerCode: customer.customerCode,
        period: inv.period,
        previousIndex: inv.previousIndex,
        currentIndex: inv.currentIndex,
        consumptionM3: inv.consumptionM3,
        baseAmount: Number(inv.baseAmount),
        vatRate: Number(inv.vatRate),
        vatAmount: Number(inv.vatAmount),
        environmentalFeeRate: Number(inv.environmentalFeeRate),
        environmentalFeeAmount: Number(inv.environmentalFeeAmount),
        totalAmount: Number(inv.totalAmount),
        status: inv.status as InvoiceDto['status'],
        dueDate: inv.dueDate.toISOString(),
        paidAt: inv.paidAt?.toISOString(),
        breakdown: calc.breakdown,
      };
    });
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceDto | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return null;
    }

    const calc = TariffCalculator.calculate(
      invoice.consumptionM3,
      (invoice.customer.tariffGroup as TariffCategory) || 'DOMESTIC_TP',
    );

    return {
      id: invoice.id,
      invoiceCode: invoice.invoiceCode,
      customerCode: invoice.customer.customerCode,
      period: invoice.period,
      previousIndex: invoice.previousIndex,
      currentIndex: invoice.currentIndex,
      consumptionM3: invoice.consumptionM3,
      baseAmount: Number(invoice.baseAmount),
      vatRate: Number(invoice.vatRate),
      vatAmount: Number(invoice.vatAmount),
      environmentalFeeRate: Number(invoice.environmentalFeeRate),
      environmentalFeeAmount: Number(invoice.environmentalFeeAmount),
      totalAmount: Number(invoice.totalAmount),
      status: invoice.status as InvoiceDto['status'],
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      breakdown: calc.breakdown,
    };
  }

  async getConsumptionHistory(customerCode: string, monthsLimit = 12): Promise<ConsumptionHistoryDto[]> {
    const invoices = await this.getInvoicesByCustomerCode(customerCode);
    return invoices.slice(0, monthsLimit).map((inv) => ({
      period: inv.period,
      consumptionM3: inv.consumptionM3,
      totalAmount: inv.totalAmount,
    }));
  }

  /**
   * Cap nhat trang thai hoa don sang da thanh toan (PAID) trong DB that
   */
  async markAsPaid(invoiceId: string): Promise<boolean> {
    try {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
