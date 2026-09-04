import { Router } from 'express';
import { ZaloMessagingService } from '../services/ZaloMessagingService.js';

export function createZaloRouter(): Router {
  const router = Router();

  // GET /api/v1/zalo/conversations — Lấy danh sách hội thoại
  router.get('/conversations', (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const conversations = ZaloMessagingService.getConversations({ status, search });
      return res.json({ success: true, data: conversations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/user-conversation — Lấy hoặc tạo cuộc hội thoại cho user Mini App
  router.post('/user-conversation', (req, res) => {
    try {
      const { customerCode, fullName, phone, zaloId, avatarUrl } = req.body;
      const conversation = ZaloMessagingService.getOrCreateConversationForUser({
        customerCode,
        fullName,
        phone,
        zaloId,
        avatarUrl,
      });
      const messages = ZaloMessagingService.getMessages(conversation.id);
      return res.json({ success: true, data: { conversation, messages } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET /api/v1/zalo/conversations/:id/messages — Lấy tin nhắn của hội thoại
  router.get('/conversations/:id/messages', (req, res) => {
    try {
      const conversationId = req.params.id;
      const messages = ZaloMessagingService.getMessages(conversationId);
      return res.json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/conversations/:id/read — Đánh dấu đã đọc
  router.post('/conversations/:id/read', (req, res) => {
    try {
      const conversationId = req.params.id;
      ZaloMessagingService.markAsRead(conversationId);
      return res.json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // PATCH /api/v1/zalo/conversations/:id/status — Cập nhật trạng thái
  router.patch('/conversations/:id/status', (req, res) => {
    try {
      const conversationId = req.params.id;
      const { status } = req.body;
      if (!['OPEN', 'RESOLVED', 'PENDING'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      ZaloMessagingService.updateStatus(conversationId, status);
      return res.json({ success: true, message: 'Status updated' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/messages — Mini App gửi tin nhắn
  router.post('/messages', (req, res) => {
    try {
      const { conversationId, content, senderName, senderAvatar, type, templateData } = req.body;
      if (!conversationId || !content) {
        return res.status(400).json({ success: false, message: 'Thiếu conversationId hoặc nội dung tin nhắn' });
      }

      const message = ZaloMessagingService.postMessage({
        conversationId,
        sender: 'CUSTOMER',
        senderName: senderName || 'Khách hàng',
        senderAvatar,
        content,
        type: type || 'TEXT',
        templateData,
      });

      return res.json({ success: true, data: message });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/send — CSKH / Admin gửi tin nhắn phản hồi
  router.post('/send', (req, res) => {
    try {
      const { conversationId, content, staffName, staffAvatar, type, templateData } = req.body;
      if (!conversationId || !content) {
        return res.status(400).json({ success: false, message: 'Thiếu conversationId hoặc nội dung tin nhắn' });
      }

      const message = ZaloMessagingService.postMessage({
        conversationId,
        sender: 'OA_STAFF',
        senderName: staffName || 'CSKH CAWACO',
        senderAvatar: staffAvatar || '/brand/logo.jpg',
        content,
        type: type || 'TEXT',
        templateData,
      });

      return res.json({ success: true, data: message });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/broadcast — Gửi thông báo ZNS hàng loạt theo địa bàn
  router.post('/broadcast', (req, res) => {
    try {
      const { title, type, targetArea, content, sentBy, recipientCount } = req.body;
      if (!title || !content || !targetArea) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin tiêu đề, khu vực hoặc nội dung' });
      }

      const broadcast = ZaloMessagingService.broadcastNotification({
        title,
        type: type || 'OUTAGE_ALERT',
        targetArea,
        content,
        sentBy: sentBy || 'Ban Quản trị CAWACO',
        recipientCount: recipientCount ? Number(recipientCount) : undefined,
      });

      return res.json({ success: true, data: broadcast });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET /api/v1/zalo/broadcasts — Lấy danh sách lịch sử phát sóng
  router.get('/broadcasts', (req, res) => {
    try {
      const broadcasts = ZaloMessagingService.getBroadcasts();
      return res.json({ success: true, data: broadcasts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/webhook — Tiếp nhận webhook từ Zalo OA Platform
  router.post('/webhook', (req, res) => {
    try {
      const result = ZaloMessagingService.handleWebhookEvent(req.body);
      return res.json({ error: 0, message: 'OK', result });
    } catch (error: any) {
      return res.status(500).json({ error: -1, message: error.message });
    }
  });

  // GET /api/v1/zalo/stats — Thống kê Zalo CSKH
  router.get('/stats', (req, res) => {
    try {
      const stats = ZaloMessagingService.getStats();
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
}
