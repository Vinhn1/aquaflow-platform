export * from './ports/ICustomerPort.js';
export * from './ports/IInvoicePort.js';
export * from './ports/IPaymentPort.js';
export * from './ports/IQueuePort.js';
export * from './ports/INotificationPort.js';

export type UserRole = 'CITIZEN' | 'COUNTER_STAFF' | 'FIELD_TECHNICIAN' | 'ADMIN';

export type ComplaintCategory = 
  | 'PIPE_BURST_LEAK' 
  | 'TURBID_DIRTY_WATER' 
  | 'LOW_WATER_PRESSURE' 
  | 'METER_DEFECT' 
  | 'BILLING_DISPUTE' 
  | 'OTHER';

export type ComplaintStatus = 
  | 'SUBMITTED' 
  | 'RECEIVED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'REJECTED';
