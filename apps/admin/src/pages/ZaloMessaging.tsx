import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { toast } from 'sonner';

interface ZaloMessage {
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

interface ZaloConversation {
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

interface ZaloBroadcastLog {
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

const CANNED_RESPONSES = [
  'Kính chào Quý khách! Tổng đài CSKH CAWACO xin được hỗ trợ Quý khách.',
  'Dạ hóa đơn tiền nước của Quý khách đã được cập nhật, Quý khách có thể thanh toán qua VietQR ngay trên Mini App ạ.',
  'Đội kỹ thuật Chi nhánh Cà Mau đã tiếp nhận và đang trên đường kiểm tra xử lý sự cố tại địa chỉ của Quý khách.',
  'Dạ thủ tục lắp mới hoặc sang tên đồng hồ chỉ cần CCCD và Giấy tờ nhà đất, nộp online được ngay trên app ạ.',
  'Cảm ơn Quý khách đã liên hệ Cấp Nước Cà Mau (CAWACO). Chúc Quý khách một ngày tốt lành!',
];

const WARDS_CAMAU = [
  'Toàn TP. Cà Mau',
  'Phường Tân Thành',
  'Phường 1',
  'Phường 2',
  'Phường 4',
  'Phường 5',
  'Phường 6',
  'Phường 7',
  'Phường 8',
  'Phường 9',
  'Phường Tân Xuyên',
  'Xã Lý Văn Lâm',
  'Xã Định Bình',
  'Xã Hòa Tân',
  'Xã Hòa Thành',
  'Xã Tắc Vân',
  'Xã An Xuyên',
];

export const ZaloMessaging: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'CHAT' | 'BROADCAST' | 'STATS'>('CHAT');

  // Chat state
  const [conversations, setConversations] = useState<ZaloConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ZaloMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConv, setLoadingConv] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Broadcast state
  const [broadcasts, setBroadcasts] = useState<ZaloBroadcastLog[]>([]);
  const [bcTitle, setBcTitle] = useState('');
  const [bcType, setBcType] = useState<'OUTAGE_ALERT' | 'BILLING_REMINDER' | 'MAINTENANCE' | 'GENERAL'>('OUTAGE_ALERT');
  const [bcArea, setBcArea] = useState(WARDS_CAMAU[0]);
  const [bcContent, setBcContent] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Stats state
  const [stats, setStats] = useState<any>(null);

  // Manual token modal state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [manualAccessToken, setManualAccessToken] = useState('');
  const [manualRefreshToken, setManualRefreshToken] = useState('');
  const [serverRedirectUri, setServerRedirectUri] = useState('');
  const [savingToken, setSavingToken] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent && conversations.length === 0) setLoadingConv(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);

      const res = await fetch(`/api/v1/zalo/conversations?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setConversations((prev) => {
            if (prev.length === json.data.length) {
              const isSame = prev.every((c, idx) => {
                const n = json.data[idx];
                return (
                  c.id === n.id &&
                  c.lastMessage === n.lastMessage &&
                  c.lastMessageTime === n.lastMessageTime &&
                  c.unreadCount === n.unreadCount &&
                  c.customerName === n.customerName &&
                  c.avatarUrl === n.avatarUrl
                );
              });
              if (isSame) return prev;
            }
            return json.data;
          });
          if (!selectedConvId && json.data.length > 0) {
            setSelectedConvId(json.data[0].id);
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      if (!silent) setLoadingConv(false);
    }
  };

  // Load messages for selected conversation
  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/v1/zalo/conversations/${convId}/messages`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMessages((prev) => {
            if (prev.length === json.data.length && prev[prev.length - 1]?.id === json.data[json.data.length - 1]?.id) {
              return prev;
            }
            return json.data;
          });
        }
      }
      // Chỉ đánh dấu đã đọc nếu thực sự đang có tin chưa đọc
      setConversations((prev) => {
        const target = prev.find((c) => c.id === convId);
        if (!target || target.unreadCount === 0) return prev;
        fetch(`/api/v1/zalo/conversations/${convId}/read`, { method: 'POST' });
        return prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c));
      });
    } catch {
      // Ignore
    }
  };

  // Load broadcasts
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/v1/zalo/broadcasts');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setBroadcasts(json.data);
      }
    } catch {
      // Ignore
    }
  };

  // Load stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/zalo/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.data) setStats(json.data);
      }
    } catch {
      // Ignore
    }
  };

  // Đồng bộ hội thoại từ Zalo OA
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSyncZalo = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/v1/zalo/sync', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Đã đồng bộ tin nhắn từ Zalo OA');
        await fetchConversations(true);
        if (selectedConvId) {
          await fetchMessages(selectedConvId);
        }
        await fetchStats();
      } else {
        toast.error(json.message || 'Không thể đồng bộ từ Zalo OA');
        await fetchStats();
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ khi đồng bộ Zalo');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenTokenModal = async () => {
    setShowTokenModal(true);
    try {
      const res = await fetch('/api/v1/zalo/auth/url');
      const json = await res.json();
      if (json.data?.redirectUri) {
        setServerRedirectUri(json.data.redirectUri);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAccessToken.trim()) {
      toast.error('Vui lòng dán mã Access Token');
      return;
    }
    setSavingToken(true);
    try {
      const res = await fetch('/api/v1/zalo/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: manualAccessToken.trim(),
          refreshToken: manualRefreshToken.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Đã lưu và kích hoạt kết nối Zalo OA thành công');
        setShowTokenModal(false);
        setManualAccessToken('');
        setManualRefreshToken('');
        await fetchStats();
        await handleSyncZalo();
      } else {
        toast.error(json.message || 'Lưu token thất bại');
      }
    } catch {
      toast.error('Không thể kết nối máy chủ');
    } finally {
      setSavingToken(false);
    }
  };

  useEffect(() => {
    // Tự động đồng bộ một lần khi mở trang
    fetch('/api/v1/zalo/sync', { method: 'POST' })
      .then(() => fetchConversations(true))
      .catch(() => fetchConversations(true));

    fetchBroadcasts();
    fetchStats();
  }, []);

  // Tự động cập nhật thời gian thực mỗi 2.5 giây
  useEffect(() => {
    let tick = 0;
    const timer = setInterval(() => {
      fetchConversations(true);
      if (selectedConvId) {
        fetchMessages(selectedConvId);
      }
      tick++;
      if (tick % 4 === 0) {
        fetchStats();
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [selectedConvId]);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  // Cuộn tin nhắn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedConvId]);

  // Gửi tin nhắn từ Admin/CSKH
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedConvId || sendingMsg) return;

    setInputText('');
    setSendingMsg(true);

    try {
      const res = await fetch('/api/v1/zalo/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          content: text,
          staffName: user?.fullName ? `CSKH ${user.fullName}` : 'CSKH Cấp Nước Cà Mau',
          staffAvatar: user?.avatarUrl || '/brand/logo.jpg',
          type: 'TEXT',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMessages((prev) => [...prev, json.data]);
          toast.success('Đã gửi tin nhắn đến khách hàng Zalo');
          fetchConversations();
        }
      }
    } catch {
      toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại!');
    } finally {
      setSendingMsg(false);
    }
  };

  // Phát lệnh gửi thông báo
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcContent.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung! Bạn có thể bấm chọn Mẫu Soạn Nhanh ở trên.');
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/v1/zalo/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bcTitle.trim(),
          type: bcType,
          targetArea: bcArea,
          content: bcContent.trim(),
          sentBy: user?.fullName ? `CSKH ${user.fullName}` : 'Ban Quản trị CAWACO',
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        toast.success(`Đã phát lệnh gửi thông báo Zalo thành công tới ${json.data?.recipientCount || 0} khách hàng!`);
        setBcTitle('');
        setBcContent('');
        await fetchBroadcasts();
        await fetchStats();
        // Chuyển sang tab Lịch sử phát sóng để người dùng thấy ngay kết quả
        setActiveTab('STATS');
      } else {
        toast.error(json.message || 'Gửi thông báo thất bại. Vui lòng thử lại!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi phát lệnh thông báo');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Top Action & Sub-Nav Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Quản Trị Tin Nhắn Zalo</h1>
            {stats?.zaloOAStatus?.hasAccessToken ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Zalo OA Đang Hoạt Động
                </span>
                <button
                  onClick={handleSyncZalo}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer disabled:opacity-50"
                  title="Kéo tin nhắn mới nhất từ Zalo OA về hệ thống"
                >
                  <svg className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ tin Zalo'}
                </button>
                <button
                  onClick={handleOpenTokenModal}
                  className="text-xs text-slate-500 hover:text-blue-600 underline ml-1 cursor-pointer font-medium"
                  title="Cập nhật cấu hình hoặc kiểm tra Callback URL Zalo OA"
                >
                  Cấu hình Token
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/api/v1/zalo/auth/url"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await fetch('/api/v1/zalo/auth/url');
                      const json = await res.json();
                      if (json.data?.redirectUri) {
                        setServerRedirectUri(json.data.redirectUri);
                      }
                      if (json.data?.authUrl) {
                        window.open(json.data.authUrl, '_blank');
                      }
                    } catch {
                      toast.error('Không thể lấy liên kết cấp quyền Zalo OA');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer transition"
                  title="Nhấn để mở trang xác thực cấp quyền Zalo"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Zalo OA Cần Cấp Quyền Lại · Nhấn Cấp Quyền
                </a>
                <button
                  onClick={handleOpenTokenModal}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer transition"
                  title="Nhập Access Token thủ công nếu liên kết OAuth gặp lỗi redirect_uri"
                >
                  Nhập Token Thủ Công
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trung tâm tiếp nhận hội thoại hai chiều, phản hồi trực tiếp và gửi thông báo tự động
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'CHAT'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hộp Thư Trực Tuyến
          </button>
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'BROADCAST'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gửi Thông Báo
          </button>
          <button
            onClick={() => setActiveTab('STATS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'STATS'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Báo Cáo &amp; Lịch Sử
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CHAT */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Cột trái: Danh sách hội thoại */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
            {/* Search */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm khách hàng, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* List Conversations */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingConv && conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Đang tải hội thoại...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Không tìm thấy hội thoại nào</div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.id === selectedConvId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                        isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            conv.avatarUrl ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={conv.customerName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-slate-800 truncate">{conv.customerName}</span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(conv.lastMessageTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {(conv.customerCode || conv.phone) && (
                          <div className="flex items-center gap-1.5 mb-1">
                            {conv.customerCode && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-semibold">
                                {conv.customerCode}
                              </span>
                            )}
                            {conv.phone && <span className="text-[10px] text-slate-400">{conv.phone}</span>}
                          </div>
                        )}

                        <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Cột phải: Khung Chat Chi Tiết */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedConversation.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={selectedConversation.customerName}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{selectedConversation.customerName}</span>
                      {selectedConversation.customerCode && (
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {selectedConversation.customerCode}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {[selectedConversation.phone, selectedConversation.address || 'TP. Cà Mau'].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Trực tuyến</span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
                {messages.map((msg) => {
                  const isStaff = msg.sender === 'OA_STAFF';
                  const isSystem = msg.sender === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="bg-slate-200/80 border border-slate-300/80 text-slate-700 text-xs px-4 py-2 rounded-xl text-center max-w-lg shadow-sm">
                          <div className="font-bold text-blue-800 mb-0.5">{msg.senderName}</div>
                          <div>{msg.content}</div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[11px] text-slate-500 mb-1 px-1 font-semibold">
                        {isStaff ? 'Nhân viên CSKH' : msg.senderName}
                      </span>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isStaff
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Canned responses & Input */}
              <div className="bg-white border-t border-slate-200 p-4 space-y-2.5 flex-shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                  {CANNED_RESPONSES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(tmpl)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 rounded-lg whitespace-nowrap text-[11px] transition"
                    >
                      {tmpl.length > 35 ? tmpl.slice(0, 35) + '...' : tmpl}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Nhập phản hồi cho khách hàng qua Zalo OA..."
                    className="flex-1 px-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || sendingMsg}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Gửi Zalo</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Chọn một cuộc hội thoại từ danh sách bên trái để xem và trả lời
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GỬI THÔNG BÁO HÀNG LOẠT */}
      {activeTab === 'BROADCAST' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Form Soạn Tin */}
            <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800">Soạn Thông Báo Zalo Hàng Loạt</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phát thông báo cúp nước khẩn cấp, bảo trì hoặc nhắc hạn thanh toán theo địa bàn
                </p>
                {/* Mau soan nhanh */}
                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-semibold text-slate-500">Mẫu nhanh:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBcType('OUTAGE_ALERT');
                      setBcTitle('Tạm ngưng cấp nước súc xả tuyến ống D300');
                      setBcContent('CAWACO trân trọng thông báo: Tạm ngưng cấp nước từ 22h00 đến 04h00 ngày mai để súc xả và bảo dưỡng mạng lưới đường ống. Kính mong Quý khách chủ động trữ nước sinh hoạt.');
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition"
                  >
                    Mẫu Cúp Nước
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBcType('MAINTENANCE');
                      setBcTitle('Bảo dưỡng định kỳ tổ máy bơm tăng áp');
                      setBcContent('CAWACO tiến hành bảo trì tổ máy bơm tăng áp, áp lực nước có thể yếu cục bộ từ 13h30 đến 16h30. Kính mong Quý khách hàng thông cảm cho sự bất tiện này.');
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition"
                  >
                    Mẫu Bảo Trì
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBcType('BILLING_REMINDER');
                      setBcTitle('Thông báo nhắc hạn thanh toán hóa đơn tiền nước');
                      setBcContent('Hóa đơn tiền nước kỳ này của Quý khách đã được phát hành. Kính mời Quý khách mở Mini App Cấp Nước Cà Mau để tra cứu chỉ số và thanh toán trực tuyến qua mã QR.');
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition"
                  >
                    Mẫu Tiền Nước
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại thông báo</label>
                  <select
                    value={bcType}
                    onChange={(e) => setBcType(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="OUTAGE_ALERT">Cảnh Báo Cúp Nước Khẩn Cấp</option>
                    <option value="MAINTENANCE">Thông Báo Bảo Trì Tuyến Ống</option>
                    <option value="BILLING_REMINDER">Nhắc Hạn Thanh Toán Tiền Nước</option>
                    <option value="GENERAL">Tin Tức &amp; Thông Báo Chung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phạm vi khu vực gửi tin</label>
                  <select
                    value={bcArea}
                    onChange={(e) => setBcArea(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {WARDS_CAMAU.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề thông báo</label>
                  <input
                    type="text"
                    value={bcTitle}
                    onChange={(e) => setBcTitle(e.target.value)}
                    placeholder="Ví dụ: Tạm ngưng cấp nước súc xả tuyến ống D300..."
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết</label>
                  <textarea
                    rows={4}
                    value={bcContent}
                    onChange={(e) => setBcContent(e.target.value)}
                    placeholder="Mô tả cụ thể thời gian, phạm vi tuyến đường bị ảnh hưởng và khuyến cáo người dân trữ nước..."
                    className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2 text-xs text-sky-800">
                  <svg className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                  </svg>
                  <div>
                    Ước tính có khoảng <strong>1.450 thuê bao</strong> tại khu vực <strong>{bcArea}</strong> sẽ nhận được tin nhắn Zalo này ngay tức thì.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span>{isBroadcasting ? 'Đang gửi thông báo...' : 'Phát Lệnh Gửi Thông Báo'}</span>
                </button>
              </form>
            </div>

            {/* Preview Màn hình Zalo Người Dân */}
            <div className="md:col-span-2 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Xem Trước Mẫu Tin Zalo</div>
              <div className="bg-slate-800 p-3 rounded-3xl shadow-xl max-w-xs mx-auto border-4 border-slate-700">
                <div className="bg-slate-100 rounded-2xl overflow-hidden p-3 min-h-[380px] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <img src="/brand/logo.jpg" alt="Logo" className="w-6 h-6 rounded-full" />
                      <div className="text-[11px] font-bold text-slate-800">Cấp Nước Cà Mau</div>
                      <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold ml-auto">Chính Thức</span>
                    </div>

                    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-bold text-red-600 uppercase">
                        {bcType === 'OUTAGE_ALERT' ? 'Cảnh Báo Cúp Nước' : 'Thông Báo Cấp Nước Cà Mau'}
                      </div>
                      <div className="text-xs font-bold text-slate-800">{bcTitle || 'Tiêu đề thông báo mẫu'}</div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">
                        {bcContent || 'Nội dung thông báo sẽ hiển thị chi tiết tại đây trên điện thoại của người dân.'}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        Khu vực: <strong>{bcArea}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-400">Tin nhắn Cấp Nước Cà Mau</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BÁO CÁO & LỊCH SỬ GỬI TIN */}
      {activeTab === 'STATS' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tổng Số Hội Thoại</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{stats?.totalConversations ?? 0}</div>
              <div className="text-xs text-slate-500 mt-1">{stats?.totalConversations ?? 0} cuộc trao đổi</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Thuê Bao Nhận Thông Báo</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                {(stats?.totalBroadcastRecipients ?? 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">{stats?.totalBroadcasts ?? 0} đợt phát sóng</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tỷ Lệ Gửi Tin Thành Công</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.successRate || 99.2}%</div>
              <div className="text-xs text-slate-500 mt-1">Bảo mật hệ thống Zalo</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Thời Gian Phản Hồi Trung Bình</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.avgResponseTime || '1.8 phút'}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Mức độ hài lòng: {stats?.satisfactionScore || 4.85} trên 5.0</div>
            </div>
          </div>

          {/* Lịch Sử Phát Sóng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 font-bold text-sm text-slate-800">
              Lịch Sử Phát Sóng Tin Nhắn Zalo Hàng Loạt
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-6 py-3">Thời gian</th>
                    <th className="px-6 py-3">Tiêu đề thông báo</th>
                    <th className="px-6 py-3">Địa bàn áp dụng</th>
                    <th className="px-6 py-3">Số lượng gửi</th>
                    <th className="px-6 py-3">Thành công</th>
                    <th className="px-6 py-3">Người phát lệnh</th>
                    <th className="px-6 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {broadcasts.map((bc) => (
                    <tr key={bc.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(bc.sentAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">{bc.title}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                          {bc.targetArea}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-blue-700">{bc.recipientCount}</td>
                      <td className="px-6 py-3.5 font-mono text-emerald-600 font-bold">
                        {bc.successCount} - đạt {Math.round((bc.successCount / bc.recipientCount) * 1000) / 10}%
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{bc.sentBy}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                          Hoàn tất
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Modal Cấu hình / Nhập Token Zalo OA */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Cấu Hình Kết Nối Zalo Official Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">Quản lý mã truy cập và xử lý cấu hình redirect_uri</p>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Hướng dẫn sửa lỗi -14003 */}
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                <span>Cách khắc phục lỗi -14003 (Invalid redirect uri):</span>
              </div>
              <p>Zalo yêu cầu URL Callback phải được khai báo trong ứng dụng. Hãy sao chép URL sau và dán vào mục <strong>Zalo for Developers &gt; Ứng dụng &gt; Official Account &gt; Callback URL</strong>:</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={serverRedirectUri || 'https://api.websiteproject.id.vn/api/v1/zalo/auth/callback'}
                  className="flex-1 bg-white border border-amber-300 px-2.5 py-1.5 rounded text-[11px] font-mono select-all text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(serverRedirectUri || 'https://api.websiteproject.id.vn/api/v1/zalo/auth/callback');
                    toast.success('Đã sao chép Callback URL');
                  }}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer transition"
                >
                  Sao chép
                </button>
              </div>
            </div>

            {/* Form nhập Access Token thủ công */}
            <form onSubmit={handleSaveTokens} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Access Token Mới (Bắt buộc)
                </label>
                <textarea
                  rows={3}
                  value={manualAccessToken}
                  onChange={(e) => setManualAccessToken(e.target.value)}
                  placeholder="Dán Access Token được cấp từ công cụ Zalo Developer hoặc Postman vào đây..."
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Refresh Token (Tùy chọn - để máy chủ tự động làm mới hàng ngày)
                </label>
                <input
                  type="text"
                  value={manualRefreshToken}
                  onChange={(e) => setManualRefreshToken(e.target.value)}
                  placeholder="Dán Refresh Token (nếu có)..."
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingToken}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {savingToken ? 'Đang lưu...' : 'Lưu và Kích Hoạt Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
