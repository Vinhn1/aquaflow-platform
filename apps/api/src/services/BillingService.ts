import { ConsumptionHistoryDto, IInvoicePort, InvoiceDto } from '@aquaflow/types';

export class BillingService {
  constructor(private readonly invoicePort: IInvoicePort) {}

  async getInvoices(customerCode: string, status?: string): Promise<InvoiceDto[]> {
    return this.invoicePort.getInvoicesByCustomerCode(customerCode, status);
  }

  async getInvoiceDetail(invoiceId: string): Promise<InvoiceDto | null> {
    return this.invoicePort.getInvoiceById(invoiceId);
  }

  async getConsumptionHistory(customerCode: string, monthsLimit = 12): Promise<ConsumptionHistoryDto[]> {
    return this.invoicePort.getConsumptionHistory(customerCode, monthsLimit);
  }
}
