export interface MockUser {
  id: string;
  zaloId: string;
  fullName: string;
  phone: string;
  avatarText: string;
}

export interface MockLinkedMeter {
  id: string;
  customerCode: string; // Ma danh bo
  ownerName: string;
  address: string;
  label: string;
  isDefault: boolean;
  meterSerialNumber: string;
}

export interface MockInvoice {
  id: string;
  invoiceCode: string;
  customerCode: string;
  period: string;
  previousIndex: number;
  currentIndex: number;
  consumptionM3: number;
  baseAmount: number;
  vatAmount: number;
  environmentalFeeAmount: number;
  totalAmount: number;
  status: 'UNPAID' | 'PAID';
  dueDate: string;
}

export interface MockNews {
  id: string;
  title: string;
  summary: string;
  category: 'ALL' | 'OUTAGE' | 'SAFETY' | 'TARIFF';
  isOutageAlert: boolean;
  affectedArea?: string;
  outageTime?: string;
  publishedAt: string;
}

export interface MockBranch {
  id: string;
  code: string;
  name: string;
  address: string;
  type: 'HEADQUARTERS' | 'BRANCH' | 'PAYMENT_POINT';
  phone: string;
  workingHours: string;
  distanceKm: number;
  lat: number;
  lng: number;
}

export interface MockQueueTicket {
  ticketNumber: string;
  branchName: string;
  serviceName: string;
  status: 'WAITING' | 'SERVING' | 'COMPLETED';
  positionInQueue: number;
  estimatedWaitMinutes: number;
  issuedAt: string;
}
