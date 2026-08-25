export type ServiceType = 
  | 'NEW_METER_REGISTRATION'
  | 'BILLING_PAYMENT'
  | 'CONTRACT_TRANSFER'
  | 'COMPLAINT_INSPECTION';

export type TicketStatus = 
  | 'WAITING'
  | 'CALLING'
  | 'SERVING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'MISSED';

export interface QueueTicketDto {
  id: string;
  ticketNumber: string; // e.g. "A-101"
  branchId: string;
  branchName: string;
  serviceType: ServiceType;
  userId: string;
  customerName: string;
  phone?: string;
  status: TicketStatus;
  counterId?: string;
  counterName?: string;
  positionInQueue: number;
  estimatedWaitMinutes: number;
  issuedAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface IssueTicketParams {
  branchId: string;
  serviceType: ServiceType;
  userId: string;
  customerName: string;
  phone?: string;
}

export interface IQueuePort {
  issueTicket(params: IssueTicketParams): Promise<QueueTicketDto>;
  getTicketStatus(ticketId: string): Promise<QueueTicketDto | null>;
  cancelTicket(ticketId: string, userId: string): Promise<boolean>;
  callNextTicket(branchId: string, counterId: string, serviceType?: ServiceType): Promise<QueueTicketDto | null>;
  completeTicket(ticketId: string, counterId: string): Promise<boolean>;
  getBranchQueueOverview(branchId: string): Promise<{ waitingCount: number; activeCountersCount: number }>;
}
