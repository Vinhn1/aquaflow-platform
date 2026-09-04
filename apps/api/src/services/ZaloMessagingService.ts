export interface ZaloMessage {
  id: string;
  conversationId: string;
  sender: 'CUSTOMER' | 'OA_STAFF' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'ZNS_TEMPLATE' | 'SYSTEM_ALERT';
  templateData?: Record<string, any>;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  createdAt: string;
}

export interface ZaloConversation {
  id: string;
  customerCode: string;
  customerName: string;
  phone: string;
  zaloUserId: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'OPEN' | 'RESOLVED' | 'PENDING';
  tags: string[];
  address?: string;
}

export interface ZaloBroadcastLog {
  id: string;
  title: string;
  type: 'OUTAGE_ALERT' | 'BILLING_REMINDER' | 'MAINTENANCE' | 'GENERAL';
  targetArea: string;
  recipientCount: number;
  successCount: number;
  failedCount: number;
  sentAt: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  content: string;
  sentBy: string;
}

// In-Memory Data Store (với dữ liệu khởi tạo mẫu sinh động của CAWACO Cà Mau)
const INITIAL_CONVERSATIONS: ZaloConversation[] = [
  {
    id: 'conv-101',
    customerCode: 'CM102938',
    customerName: 'Nguyễn Văn Hùng',
    phone: '0918 234 567',
    zaloUserId: 'zalo_usr_hungnv_88',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Dạ tôi đã nhận được thông báo tiền nước tháng này, cảm ơn công ty!',
    lastMessageTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    unreadCount: 1,
    status: 'OPEN',
    tags: ['Hóa đơn', 'Khách hàng thân thiết'],
    address: 'Số 204 Quang Trung, P. Tân Thành, TP. Cà Mau',
  },
  {
    id: 'conv-102',
    customerCode: 'CM209182',
    customerName: 'Trần Thị Mai',
    phone: '0945 889 123',
    zaloUserId: 'zalo_usr_maitt_12',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Khu vực Khóm 5 Phường 8 khi nào có nước lại vậy cán bộ?',
    lastMessageTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    unreadCount: 2,
    status: 'OPEN',
    tags: ['Sự cố nước', 'Cần ưu tiên'],
    address: 'Số 45 Lý Thường Kiệt, Phường 8, TP. Cà Mau',
  },
  {
    id: 'conv-103',
    customerCode: 'CM339102',
    customerName: 'Lê Hoàng Nam',
    phone: '0978 112 334',
    zaloUserId: 'zalo_usr_namlh_55',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Cảm ơn CAWACO đã cử đội kỹ thuật đến thay đồng hồ kịp thời.',
    lastMessageTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    status: 'RESOLVED',
    tags: ['Thay đồng hồ', 'Đã xử lý'],
    address: 'Ấp Cái Cùng, Xã Long Điền Đông, Huyện Đông Hải',
  },
  {
    id: 'conv-104',
    customerCode: 'CM449012',
    customerName: 'Phạm Thu Trang',
    phone: '0913 998 776',
    zaloUserId: 'zalo_usr_trangpt_99',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Cho tôi hỏi thủ tục sang tên đồng hồ nước cần những giấy tờ gì ạ?',
    lastMessageTime: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    unreadCount: 0,
    status: 'PENDING',
    tags: ['Thủ tục sang tên'],
    address: 'Đường Phan Ngọc Hiển, Phường 5, TP. Cà Mau',
  },
];

const INITIAL_MESSAGES: Record<string, ZaloMessage[]> = {
  'conv-101': [
    {
      id: 'msg-101-1',
      conversationId: 'conv-101',
      sender: 'SYSTEM',
      senderName: 'Hệ thống ZNS CAWACO',
      content: 'Thông báo phát hành hóa đơn nước Kỳ 08/2026 cho Mã danh bộ CM102938. Số tiền: 260.000 VNĐ. Hạn thanh toán: 15/09/2026.',
      type: 'ZNS_TEMPLATE',
      templateData: {
        customerCode: 'CM102938',
        amount: '260.000 đ',
        period: '08/2026',
      },
      status: 'SEEN',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'msg-101-2',
      conversationId: 'conv-101',
      sender: 'CUSTOMER',
      senderName: 'Nguyễn Văn Hùng',
      content: 'Tôi muốn thanh toán chuyển khoản VietQR thì quét mã ở đâu vậy CSKH?',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-101-3',
      conversationId: 'conv-101',
      sender: 'OA_STAFF',
      senderName: 'CSKH Nguyễn Thị Kim (Quầy 02)',
      content: 'Dạ chào anh Hùng! Anh có thể nhấn vào mục "Hóa đơn" trên Mini App hoặc quét mã VietQR CAWACO với cú pháp tự động gạch nợ sau 3 giây ạ.',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-101-4',
      conversationId: 'conv-101',
      sender: 'CUSTOMER',
      senderName: 'Nguyễn Văn Hùng',
      content: 'Dạ tôi đã nhận được thông báo tiền nước tháng này, cảm ơn công ty!',
      type: 'TEXT',
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
  ],
  'conv-102': [
    {
      id: 'msg-102-1',
      conversationId: 'conv-102',
      sender: 'CUSTOMER',
      senderName: 'Trần Thị Mai',
      content: 'Alo CSKH Cấp nước Cà Mau ơi, nước nhà tôi từ sáng giờ bị yếu quá.',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-102-2',
      conversationId: 'conv-102',
      sender: 'CUSTOMER',
      senderName: 'Trần Thị Mai',
      content: 'Khu vực Khóm 5 Phường 8 khi nào có nước lại vậy cán bộ?',
      type: 'TEXT',
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
  ],
  'conv-103': [
    {
      id: 'msg-103-1',
      conversationId: 'conv-103',
      sender: 'CUSTOMER',
      senderName: 'Lê Hoàng Nam',
      content: 'Đồng hồ nước nhà tôi bị mờ mặt kính không nhìn rõ số.',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    {
      id: 'msg-103-2',
      sender: 'OA_STAFF',
      conversationId: 'conv-103',
      senderName: 'Kỹ thuật viên Trần Minh',
      content: 'Đội kỹ thuật Chi nhánh 1 đã tiếp nhận và sẽ qua thay mới miễn phí trong chiều nay ạ.',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'msg-103-3',
      conversationId: 'conv-103',
      sender: 'CUSTOMER',
      senderName: 'Lê Hoàng Nam',
      content: 'Cảm ơn CAWACO đã cử đội kỹ thuật đến thay đồng hồ kịp thời.',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
  ],
  'conv-104': [
    {
      id: 'msg-104-1',
      conversationId: 'conv-104',
      sender: 'CUSTOMER',
      senderName: 'Phạm Thu Trang',
      content: 'Cho tôi hỏi thủ tục sang tên đồng hồ nước cần những giấy tờ gì ạ?',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    },
    {
      id: 'msg-104-2',
      conversationId: 'conv-104',
      sender: 'OA_STAFF',
      senderName: 'CSKH Lê Thu Thảo',
      content: 'Dạ chị cần chuẩn bị CCCD gắn chip và Giấy chứng nhận Quyền sử dụng đất (hoặc hợp đồng mua bán nhà). Chị có thể nộp trực tiếp tại Quầy số 204 Quang Trung hoặc nộp online qua mục "Đăng ký lắp mới" trên Zalo Mini App ạ.',
      type: 'TEXT',
      status: 'SEEN',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
  ],
};

const INITIAL_BROADCASTS: ZaloBroadcastLog[] = [
  {
    id: 'bc-1',
    title: 'Cảnh báo tạm ngừng cấp nước phục vụ bảo trì tuyến ống D300',
    type: 'OUTAGE_ALERT',
    targetArea: 'Phường Tân Thành, TP. Cà Mau',
    recipientCount: 1420,
    successCount: 1412,
    failedCount: 8,
    sentAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    content: 'CAWACO xin thông báo tạm ngưng cấp nước từ 22h00 đến 04h00 ngày mai tại các tuyến đường Quang Trung, Lý Bôn để súc xả bảo trì định kỳ.',
    sentBy: 'Trần Văn Kiên (Trưởng ca vận hành)',
  },
  {
    id: 'bc-2',
    title: 'Nhắc hạn thanh toán tiền nước Kỳ 08/2026 qua VietQR',
    type: 'BILLING_REMINDER',
    targetArea: 'Toàn TP. Cà Mau',
    recipientCount: 5850,
    successCount: 5810,
    failedCount: 40,
    sentAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    content: 'Kính gửi Quý khách, hóa đơn tiền nước Kỳ 08/2026 sắp đến hạn thanh toán vào ngày 15/09. Quý khách vui lòng thanh toán trên Zalo Mini App để tránh bị gián đoạn cấp nước.',
    sentBy: 'Phòng Thu ngân CAWACO',
  },
];

export class ZaloMessagingService {
  private static conversations: ZaloConversation[] = [...INITIAL_CONVERSATIONS];
  private static messages: Record<string, ZaloMessage[]> = { ...INITIAL_MESSAGES };
  private static broadcasts: ZaloBroadcastLog[] = [...INITIAL_BROADCASTS];

  /**
   * Lấy danh sách cuộc hội thoại Zalo
   */
  public static getConversations(filter?: { status?: string; search?: string }): ZaloConversation[] {
    let result = [...this.conversations];

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((c) => c.status === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.customerCode.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      );
    }

    // Sắp xếp theo tin nhắn mới nhất
    return result.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }

  /**
   * Lấy hoặc tạo cuộc hội thoại cho người dùng Mini App
   */
  public static getOrCreateConversationForUser(user: {
    customerCode?: string;
    fullName?: string;
    phone?: string;
    zaloId?: string;
    avatarUrl?: string;
  }): ZaloConversation {
    const code = user.customerCode || 'CM102938';
    const name = user.fullName || 'Khách hàng Cà Mau';
    const phone = user.phone || '0918 234 567';
    const zaloId = user.zaloId || 'zalo_usr_current';

    let conv = this.conversations.find((c) => c.customerCode === code || c.zaloUserId === zaloId);
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        customerCode: code,
        customerName: name,
        phone: phone,
        zaloUserId: zaloId,
        avatarUrl: user.avatarUrl,
        lastMessage: 'Bắt đầu cuộc trò chuyện với CSKH CAWACO',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        status: 'OPEN',
        tags: ['Khách hàng Mini App'],
        address: 'Thành phố Cà Mau',
      };
      this.conversations.unshift(conv);
      this.messages[conv.id] = [
        {
          id: `msg-sys-${Date.now()}`,
          conversationId: conv.id,
          sender: 'SYSTEM',
          senderName: 'Zalo OA Cấp Nước Cà Mau',
          content: 'Xin kính chào Quý khách! Tổng đài Chăm sóc khách hàng CAWACO hân hạnh hỗ trợ 24/7. Quý khách vui lòng để lại tin nhắn hoặc yêu cầu hỗ trợ.',
          type: 'TEXT',
          status: 'SEEN',
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return conv;
  }

  /**
   * Lấy lịch sử tin nhắn của một cuộc hội thoại
   */
  public static getMessages(conversationId: string): ZaloMessage[] {
    return this.messages[conversationId] || [];
  }

  /**
   * Gửi tin nhắn mới (Khách hàng hoặc CSKH)
   */
  public static postMessage(params: {
    conversationId: string;
    sender: 'CUSTOMER' | 'OA_STAFF' | 'SYSTEM';
    senderName: string;
    senderAvatar?: string;
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'ZNS_TEMPLATE' | 'SYSTEM_ALERT';
    templateData?: Record<string, any>;
  }): ZaloMessage {
    const { conversationId, sender, senderName, senderAvatar, content, type = 'TEXT', templateData } = params;

    const newMessage: ZaloMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      conversationId,
      sender,
      senderName,
      senderAvatar,
      content,
      type,
      templateData,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMessage);

    // Cập nhật conversation
    const convIndex = this.conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].lastMessage = content;
      this.conversations[convIndex].lastMessageTime = newMessage.createdAt;
      if (sender === 'CUSTOMER') {
        this.conversations[convIndex].unreadCount += 1;
        this.conversations[convIndex].status = 'OPEN';
      }
    }

    return newMessage;
  }

  /**
   * Đánh dấu cuộc hội thoại đã đọc
   */
  public static markAsRead(conversationId: string): void {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 0;
    }
    const msgs = this.messages[conversationId];
    if (msgs) {
      msgs.forEach((m) => {
        m.status = 'SEEN';
      });
    }
  }

  /**
   * Cập nhật trạng thái hội thoại (OPEN / RESOLVED / PENDING)
   */
  public static updateStatus(conversationId: string, status: 'OPEN' | 'RESOLVED' | 'PENDING'): void {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.status = status;
    }
  }

  /**
   * Gửi thông báo ZNS / Broadcast hàng loạt theo khu vực
   */
  public static broadcastNotification(data: {
    title: string;
    type: 'OUTAGE_ALERT' | 'BILLING_REMINDER' | 'MAINTENANCE' | 'GENERAL';
    targetArea: string;
    content: string;
    sentBy: string;
    recipientCount?: number;
  }): ZaloBroadcastLog {
    const count = data.recipientCount || Math.floor(Math.random() * 1500) + 800;
    const success = Math.floor(count * 0.985);
    const failed = count - success;

    const newBroadcast: ZaloBroadcastLog = {
      id: `bc-${Date.now()}`,
      title: data.title,
      type: data.type,
      targetArea: data.targetArea,
      recipientCount: count,
      successCount: success,
      failedCount: failed,
      sentAt: new Date().toISOString(),
      status: 'COMPLETED',
      content: data.content,
      sentBy: data.sentBy,
    };

    this.broadcasts.unshift(newBroadcast);

    // Gửi tự động vào tất cả hội thoại
    this.conversations.forEach((conv) => {
      this.postMessage({
        conversationId: conv.id,
        sender: 'SYSTEM',
        senderName: 'Thông báo Khẩn CAWACO',
        content: `[${data.title}]: ${data.content}`,
        type: 'SYSTEM_ALERT',
      });
    });

    return newBroadcast;
  }

  /**
   * Lấy lịch sử phát tin hàng loạt
   */
  public static getBroadcasts(): ZaloBroadcastLog[] {
    return this.broadcasts;
  }

  /**
   * Xử lý sự kiện Webhook từ Zalo OA
   */
  public static handleWebhookEvent(event: any): { processed: boolean; message?: string } {
    console.log('[Zalo OA Webhook Received]:', JSON.stringify(event));
    if (event.event_name === 'user_send_text' || event.event_name === 'user_send_image') {
      const zaloUserId = event.sender?.id || 'zalo_webhook_user';
      const content = event.message?.text || 'Đã gửi một hình ảnh';

      let conv = this.conversations.find((c) => c.zaloUserId === zaloUserId);
      if (!conv) {
        conv = this.getOrCreateConversationForUser({
          zaloId: zaloUserId,
          fullName: event.sender?.name || `Khách hàng ${zaloUserId.slice(-4)}`,
        });
      }

      this.postMessage({
        conversationId: conv.id,
        sender: 'CUSTOMER',
        senderName: conv.customerName,
        content,
        type: event.event_name === 'user_send_image' ? 'IMAGE' : 'TEXT',
      });

      return { processed: true, message: 'Message logged from Zalo webhook' };
    }

    return { processed: true, message: 'Event acknowledged' };
  }

  /**
   * Lấy tổng hợp số liệu thống kê Zalo Messaging
   */
  public static getStats() {
    const totalConversations = this.conversations.length;
    const openConversations = this.conversations.filter((c) => c.status === 'OPEN').length;
    const totalUnread = this.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    const totalBroadcastRecipients = this.broadcasts.reduce((sum, b) => sum + b.recipientCount, 0);
    const totalBroadcastSuccess = this.broadcasts.reduce((sum, b) => sum + b.successCount, 0);
    const successRate = totalBroadcastRecipients > 0 ? (totalBroadcastSuccess / totalBroadcastRecipients) * 100 : 99.2;

    return {
      totalConversations,
      openConversations,
      totalUnread,
      totalBroadcasts: this.broadcasts.length,
      totalBroadcastRecipients,
      successRate: Math.round(successRate * 10) / 10,
      avgResponseTime: '1.8 phút',
      satisfactionScore: 4.85,
    };
  }
}
