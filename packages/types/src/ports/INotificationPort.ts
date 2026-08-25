export interface SendNotificationParams {
  recipientId: string; // Zalo User ID or Phone Number
  channel: 'ZNS' | 'ZALO_MINI_APP' | 'SMS';
  templateId: string;
  templateData: Record<string, string | number>;
  title: string;
  body: string;
}

export interface NotificationResult {
  success: boolean;
  messageId: string;
  sentAt: string;
  errorMessage?: string;
}

export interface INotificationPort {
  sendNotification(params: SendNotificationParams): Promise<NotificationResult>;
}
