import { IQueuePort, IssueTicketParams, QueueTicketDto, ServiceType } from '@aquaflow/types';

export class QueueEngine {
  constructor(private readonly queuePort: IQueuePort) {}

  async bookTicket(params: IssueTicketParams): Promise<QueueTicketDto> {
    return this.queuePort.issueTicket(params);
  }

  async getTicket(ticketId: string): Promise<QueueTicketDto | null> {
    return this.queuePort.getTicketStatus(ticketId);
  }

  async cancelTicket(ticketId: string, userId: string): Promise<boolean> {
    return this.queuePort.cancelTicket(ticketId, userId);
  }

  async callNext(branchId: string, counterId: string, serviceType?: ServiceType): Promise<QueueTicketDto | null> {
    return this.queuePort.callNextTicket(branchId, counterId, serviceType);
  }

  async complete(ticketId: string, counterId: string): Promise<boolean> {
    return this.queuePort.completeTicket(ticketId, counterId);
  }

  async getOverview(branchId: string): Promise<{ waitingCount: number; activeCountersCount: number }> {
    return this.queuePort.getBranchQueueOverview(branchId);
  }
}
