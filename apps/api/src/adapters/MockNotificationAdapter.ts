import { INotificationPort, NotificationResult, SendNotificationParams } from '@aquaflow/types';

export class MockNotificationAdapter implements INotificationPort {
  async sendNotification(params: SendNotificationParams): Promise<NotificationResult> {
    // Gia lap gui thong bao qua Zalo Notification Service (ZNS) hoac SMS
    const messageId = `msg-uuid-${Date.now()}`;
    return {
      success: true,
      messageId,
      sentAt: new Date().toISOString(),
    };
  }
}
