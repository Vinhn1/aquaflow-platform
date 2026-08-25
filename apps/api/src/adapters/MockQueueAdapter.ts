import { IQueuePort, IssueTicketParams, QueueTicketDto, ServiceType } from '@aquaflow/types';

export class MockQueueAdapter implements IQueuePort {
  private tickets: QueueTicketDto[] = [];
  private sequenceCounter = 100;

  async issueTicket(params: IssueTicketParams): Promise<QueueTicketDto> {
    this.sequenceCounter += 1;
    const prefix = params.serviceType === 'NEW_METER_REGISTRATION' ? 'A' :
                   params.serviceType === 'BILLING_PAYMENT' ? 'B' :
                   params.serviceType === 'CONTRACT_TRANSFER' ? 'C' : 'D';
    
    const ticketNumber = `${prefix}-${this.sequenceCounter}`;
    const waitingCount = this.tickets.filter((t) => t.branchId === params.branchId && t.status === 'WAITING').length;

    const newTicket: QueueTicketDto = {
      id: `ticket-uuid-${Date.now()}`,
      ticketNumber,
      branchId: params.branchId,
      branchName: 'Trụ sở chính - 204 Quang Trung, P. Tân Thành, TP. Cà Mau',
      serviceType: params.serviceType,
      userId: params.userId,
      customerName: params.customerName,
      status: 'WAITING',
      positionInQueue: waitingCount + 1,
      estimatedWaitMinutes: (waitingCount + 1) * 5,
      issuedAt: new Date().toISOString(),
    };

    this.tickets.push(newTicket);
    return newTicket;
  }

  async getTicketStatus(ticketId: string): Promise<QueueTicketDto | null> {
    return this.tickets.find((t) => t.id === ticketId) || null;
  }

  async cancelTicket(ticketId: string, userId: string): Promise<boolean> {
    const ticket = this.tickets.find((t) => t.id === ticketId && t.userId === userId);
    if (ticket && ticket.status === 'WAITING') {
      ticket.status = 'CANCELLED';
      return true;
    }
    return false;
  }

  async callNextTicket(branchId: string, counterId: string, serviceType?: ServiceType): Promise<QueueTicketDto | null> {
    const nextTicket = this.tickets.find((t) => {
      const matchBranch = t.branchId === branchId;
      const matchStatus = t.status === 'WAITING';
      const matchService = serviceType ? t.serviceType === serviceType : true;
      return matchBranch && matchStatus && matchService;
    });

    if (nextTicket) {
      nextTicket.status = 'SERVING';
      nextTicket.counterId = counterId;
      nextTicket.counterName = `Quầy số ${counterId}`;
      nextTicket.calledAt = new Date().toISOString();
      return nextTicket;
    }
    return null;
  }

  async completeTicket(ticketId: string, counterId: string): Promise<boolean> {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (ticket && ticket.status === 'SERVING') {
      ticket.status = 'COMPLETED';
      ticket.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  async getBranchQueueOverview(branchId: string): Promise<{ waitingCount: number; activeCountersCount: number }> {
    const waitingCount = this.tickets.filter((t) => t.branchId === branchId && t.status === 'WAITING').length;
    return {
      waitingCount,
      activeCountersCount: 4,
    };
  }
}
