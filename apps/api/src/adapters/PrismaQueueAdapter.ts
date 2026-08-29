import { IQueuePort, IssueTicketParams, QueueTicketDto, ServiceType, TicketStatus } from '@aquaflow/types';
import { prisma } from '../lib/prisma.js';

/**
 * Adapter quan ly hang doi boc so truc tuyen va quay giao dich CAWACO
 * Trien khai port IQueuePort luu tru tren co so du lieu PostgreSQL
 */
export class PrismaQueueAdapter implements IQueuePort {
  async issueTicket(params: IssueTicketParams): Promise<QueueTicketDto> {
    // 1. Kiem tra chi nhanh
    const branch = await prisma.branch.findUnique({
      where: { id: params.branchId },
    });

    const branchName = branch ? branch.name : 'Trụ sở chính CAWACO 204 Quang Trung';

    // 2. Tinh so luong nguoi dang cho de tinh so thu tu va uoc tinh thoi gian
    const waitingCount = await prisma.queueTicket.count({
      where: {
        branchId: params.branchId,
        status: 'WAITING',
      },
    });

    // 3. Tinh prefix theo loai dich vu
    const prefix =
      params.serviceType === 'NEW_METER_REGISTRATION'
        ? 'A'
        : params.serviceType === 'BILLING_PAYMENT'
          ? 'B'
          : params.serviceType === 'CONTRACT_TRANSFER'
            ? 'C'
            : 'D';

    // 4. Lay so luong ve trong ngay de sinh ma tu dong tang
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countToday = await prisma.queueTicket.count({
      where: {
        branchId: params.branchId,
        issuedAt: { gte: today },
      },
    });

    const sequenceNumber = 101 + countToday;
    const ticketNumber = `${prefix}-${sequenceNumber}`;
    const positionInQueue = waitingCount + 1;
    const estimatedWaitMinutes = positionInQueue * 5;

    // 5. Luu ve moi vao co so du lieu that
    const ticket = await prisma.queueTicket.create({
      data: {
        ticketNumber,
        branchId: params.branchId,
        serviceType: params.serviceType,
        userId: params.userId,
        customerName: params.customerName,
        status: 'WAITING',
        positionInQueue,
        estimatedWaitMinutes,
      },
    });

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      branchId: ticket.branchId,
      branchName,
      serviceType: ticket.serviceType as ServiceType,
      userId: ticket.userId,
      customerName: ticket.customerName,
      status: ticket.status as TicketStatus,
      positionInQueue: ticket.positionInQueue,
      estimatedWaitMinutes: ticket.estimatedWaitMinutes,
      issuedAt: ticket.issuedAt.toISOString(),
    };
  }

  async getTicketStatus(ticketId: string): Promise<QueueTicketDto | null> {
    const ticket = await prisma.queueTicket.findUnique({
      where: { id: ticketId },
      include: { branch: true },
    });

    if (!ticket) {
      return null;
    }

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      branchId: ticket.branchId,
      branchName: ticket.branch.name,
      serviceType: ticket.serviceType as ServiceType,
      userId: ticket.userId,
      customerName: ticket.customerName,
      status: ticket.status as TicketStatus,
      counterId: ticket.counterId ?? undefined,
      counterName: ticket.counterName ?? undefined,
      positionInQueue: ticket.positionInQueue,
      estimatedWaitMinutes: ticket.estimatedWaitMinutes,
      issuedAt: ticket.issuedAt.toISOString(),
      calledAt: ticket.calledAt?.toISOString(),
      completedAt: ticket.completedAt?.toISOString(),
    };
  }

  async cancelTicket(ticketId: string, userId: string): Promise<boolean> {
    const ticket = await prisma.queueTicket.findFirst({
      where: { id: ticketId, userId, status: 'WAITING' },
    });

    if (!ticket) {
      return false;
    }

    await prisma.queueTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return true;
  }

  async callNextTicket(branchId: string, counterId: string, serviceType?: ServiceType): Promise<QueueTicketDto | null> {
    const nextTicket = await prisma.queueTicket.findFirst({
      where: {
        branchId,
        status: 'WAITING',
        ...(serviceType ? { serviceType } : {}),
      },
      include: { branch: true },
      orderBy: { issuedAt: 'asc' },
    });

    if (!nextTicket) {
      return null;
    }

    const updated = await prisma.queueTicket.update({
      where: { id: nextTicket.id },
      data: {
        status: 'SERVING',
        counterId,
        counterName: `Quầy số ${counterId}`,
        calledAt: new Date(),
      },
      include: { branch: true },
    });

    return {
      id: updated.id,
      ticketNumber: updated.ticketNumber,
      branchId: updated.branchId,
      branchName: updated.branch.name,
      serviceType: updated.serviceType as ServiceType,
      userId: updated.userId,
      customerName: updated.customerName,
      status: updated.status as TicketStatus,
      counterId: updated.counterId ?? undefined,
      counterName: updated.counterName ?? undefined,
      positionInQueue: 0,
      estimatedWaitMinutes: 0,
      issuedAt: updated.issuedAt.toISOString(),
      calledAt: updated.calledAt?.toISOString(),
    };
  }

  async completeTicket(ticketId: string, counterId: string): Promise<boolean> {
    const ticket = await prisma.queueTicket.findFirst({
      where: { id: ticketId, status: 'SERVING' },
    });

    if (!ticket) {
      return false;
    }

    await prisma.queueTicket.update({
      where: { id: ticketId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return true;
  }

  async getBranchQueueOverview(branchId: string): Promise<{ waitingCount: number; activeCountersCount: number }> {
    const waitingCount = await prisma.queueTicket.count({
      where: {
        branchId,
        status: 'WAITING',
      },
    });

    return {
      waitingCount,
      activeCountersCount: 4,
    };
  }
}
