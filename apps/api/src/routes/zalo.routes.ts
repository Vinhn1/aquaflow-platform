import { Router } from 'express';
import { ZaloMessagingService } from '../services/ZaloMessagingService.js';
import { zaloOAClient } from '../services/ZaloOAClient.js';

export function createZaloRouter(): Router {
  const router = Router();

  // GET /api/v1/zalo/health — Kiểm tra trạng thái cấu hình Zalo OA
  router.get('/health', (req, res) => {
    return res.json({
      success: true,
      data: zaloOAClient.getStatus(),
    });
  });

  // GET /api/v1/zalo/auth/url — Lấy URL cấp quyền Zalo OA
  router.get('/auth/url', (req, res) => {
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host');
    const baseUrl = process.env.API_BASE_URL || `${proto}://${host}`;
    const redirectUri = process.env.ZALO_OA_REDIRECT_URI || (req.query.redirectUri as string) || `${baseUrl}/api/v1/zalo/auth/callback`;
    const authUrl = zaloOAClient.getAuthorizationUrl(redirectUri);
    return res.json({ success: true, data: { authUrl, redirectUri } });
  });

  // POST /api/v1/zalo/tokens — Cập nhật Access Token thủ công từ trang quản trị
  router.post('/tokens', (req, res) => {
    try {
      const { accessToken, refreshToken, expiresIn } = req.body;
      if (!accessToken) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Access Token' });
      }
      zaloOAClient.updateTokens(accessToken, refreshToken, expiresIn);
      return res.json({
        success: true,
        message: 'Đã cập nhật Token Zalo OA thành công',
        data: zaloOAClient.getStatus(),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET /api/v1/zalo/auth/callback — Callback khi Admin chấp thuận cấp quyền trên Zalo
  router.get('/auth/callback', async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).send('<h3>Lỗi: Không tìm thấy Authorization Code từ Zalo OA.</h3>');
      }

      const result = await zaloOAClient.exchangeCode(code);
      return res.send(`
        <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #16A34A;">Kết nối Zalo OA Thành Công!</h2>
          <p>AquaFlow CAWACO đã nhận được Access Token và Refresh Token từ Zalo Official Account.</p>
          <p>Hiệu lực token: <strong>${result.expiresIn} giây</strong></p>
          <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #0284C7; color: #fff; text-decoration: none; border-radius: 6px;">Quay lại Trang Quản Trị CSKH</a>
        </div>
      `);
    } catch (error: any) {
      return res.status(500).send(`<h3>Lỗi kích hoạt Token: ${error.message}</h3>`);
    }
  });

  // POST /api/v1/zalo/sync — Đồng bộ hội thoại & tin nhắn từ Zalo OA
  router.post('/sync', async (req, res) => {
    try {
      const result = await ZaloMessagingService.syncWithZaloOA();
      if (result.error) {
        return res.status(400).json({ success: false, message: result.error, data: result });
      }
      return res.json({ success: true, message: `Đã đồng bộ ${result.synced} hội thoại từ Zalo OA`, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET /api/v1/zalo/webhook — Hỗ trợ kiểm tra/xác thực webhook từ Zalo Portal
  router.get('/webhook', (req, res) => {
    return res.json({ error: 0, message: 'Webhook endpoint active' });
  });

  // POST /api/v1/zalo/webhook — Tiếp nhận Webhook tin nhắn gửi từ Zalo OA
  router.post('/webhook', async (req, res) => {
    try {
      await ZaloMessagingService.handleWebhook(req.body);
      return res.json({ error: 0, message: 'Success' });
    } catch (error: any) {
      return res.json({ error: 0, message: 'Processed with error' });
    }
  });

  // GET /api/v1/zalo/conversations — Lấy danh sách hội thoại
  router.get('/conversations', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const conversations = await ZaloMessagingService.getConversations({ status, search });
      return res.json({ success: true, data: conversations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/user-conversation — Lấy hoặc tạo cuộc hội thoại cho user Mini App
  router.post('/user-conversation', async (req, res) => {
    try {
      const { customerCode, fullName, phone, zaloId, avatarUrl } = req.body;
      const conversation = await ZaloMessagingService.getOrCreateConversationForUser({
        customerCode,
        fullName,
        phone,
        zaloId,
        avatarUrl,
      });
      const messages = await ZaloMessagingService.getMessages(conversation.id);
      return res.json({ success: true, data: { conversation, messages } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET /api/v1/zalo/conversations/:id/messages — Lấy tin nhắn của hội thoại
  router.get('/conversations/:id/messages', async (req, res) => {
    try {
      const conversationId = req.params.id;
      const messages = await ZaloMessagingService.getMessages(conversationId);
      return res.json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/conversations/:id/read — Đánh dấu đã đọc
  router.post('/conversations/:id/read', async (req, res) => {
    try {
      const conversationId = req.params.id;
      await ZaloMessagingService.markAsRead(conversationId);
      return res.json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // PATCH /api/v1/zalo/conversations/:id/status — Cập nhật trạng thái
  router.patch('/conversations/:id/status', async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { status } = req.body;
      if (!['OPEN', 'RESOLVED', 'PENDING'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      await ZaloMessagingService.updateStatus(conversationId, status);
      return res.json({ success: true, message: 'Status updated' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST /api/v1/zalo/messages — Mini App gửi tin nhắn
  router.post('/messages', async (req, res) => {
    try {
      const { conversationId, content, senderName, senderAvatar, type, templateData } = req.body;
      if (!conversationId || !content) {
        return res.status(400).json({ success: false, message: 'Thiếu conversationId hoặc nội dung tin nhắn' });
      }

      const message = await ZaloMessagingService.postMessage({
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

  // POST /api/v1/zalo/send — CSKH / Admin gửi tin nhắn phản hồi (sẽ gọi Zalo OA API thật nếu có cấu hình)
  router.post('/send', async (req, res) => {
    try {
      const { conversationId, content, staffName, staffAvatar, type, templateData } = req.body;
      if (!conversationId || !content) {
        return res.status(400).json({ success: false, message: 'Thiếu conversationId hoặc nội dung tin nhắn' });
      }

      const message = await ZaloMessagingService.postMessage({
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
  router.post('/broadcast', async (req, res) => {
    try {
      const { title, type, targetArea, content, sentBy, recipientCount } = req.body;
      if (!title || !content || !targetArea) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin tiêu đề, khu vực hoặc nội dung' });
      }

      const broadcast = await ZaloMessagingService.broadcastNotification({
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
  router.get('/broadcasts', async (req, res) => {
    try {
      const broadcasts = await ZaloMessagingService.getBroadcasts();
      return res.json({ success: true, data: broadcasts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });



  // GET /api/v1/zalo/stats — Thống kê Zalo CSKH
  router.get('/stats', async (req, res) => {
    try {
      const stats = await ZaloMessagingService.getStats();
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
}
