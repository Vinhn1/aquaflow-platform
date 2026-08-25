import { z } from 'zod';

export const ServiceTypeEnum = z.enum([
  'NEW_METER_REGISTRATION',
  'BILLING_PAYMENT',
  'CONTRACT_TRANSFER',
  'COMPLAINT_INSPECTION',
]);

export const BookQueueTicketSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID format'),
  serviceType: ServiceTypeEnum,
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100),
});

export const CallNextTicketSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID'),
  counterId: z.string().min(1, 'Counter ID is required'),
  counterName: z.string().min(1, 'Counter name is required'),
  serviceType: ServiceTypeEnum.optional(),
});

export const CompleteTicketSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  counterId: z.string().min(1, 'Counter ID is required'),
  notes: z.string().max(255).optional(),
});

export type BookQueueTicketInput = z.infer<typeof BookQueueTicketSchema>;
export type CallNextTicketInput = z.infer<typeof CallNextTicketSchema>;
export type CompleteTicketInput = z.infer<typeof CompleteTicketSchema>;
