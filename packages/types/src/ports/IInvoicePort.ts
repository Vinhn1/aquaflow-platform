export interface InvoiceLineItemDto {
  tierNumber: number;
  fromM3: number;
  toM3: number;
  volumeM3: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceDto {
  id: string;
  invoiceCode: string;
  customerCode: string;
  period: string; // e.g. "2026-08"
  previousIndex: number;
  currentIndex: number;
  consumptionM3: number;
  baseAmount: number;
  vatRate: number; // 0.05 (5%)
  vatAmount: number;
  environmentalFeeRate: number; // 0.10 (10%)
  environmentalFeeAmount: number;
  totalAmount: number;
  status: 'UNPAID' | 'PROCESSING' | 'PAID' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
  breakdown: InvoiceLineItemDto[];
}

export interface ConsumptionHistoryDto {
  period: string;
  consumptionM3: number;
  totalAmount: number;
}

export interface IInvoicePort {
  getInvoicesByCustomerCode(customerCode: string, status?: string): Promise<InvoiceDto[]>;
  getInvoiceById(invoiceId: string): Promise<InvoiceDto | null>;
  getConsumptionHistory(customerCode: string, monthsLimit?: number): Promise<ConsumptionHistoryDto[]>;
}
