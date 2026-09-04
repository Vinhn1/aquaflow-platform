import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api.js';
import { useToast } from '../hooks/useToast.js';

interface FeedbackPageProps {
  user?: any;
}

interface SubmittedFeedback {
  id: string;
  ticketCode: string;
  title: string;
  content: string;
  rating?: number;
  suggestion?: string;
  createdAt: string;
  isResolved: boolean;
  replyContent?: string;
}

const RATING_LEVELS = [
  {
    value: 1,
    label: 'Rất kém',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M7.5 9 L10 10.5" strokeLinecap="round" />
        <path d="M16.5 9 L14 10.5" strokeLinecap="round" />
        <circle cx="9" cy="11.5" r="1" fill="currentColor" />
        <circle cx="15" cy="11.5" r="1" fill="currentColor" />
        <path d="M8 17 Q12 13 16 17" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 2,
    label: 'Kém',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        <path d="M8.5 16.5 Q12 13.5 15.5 16.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 3,
    label: 'Bình thường',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        <line x1="8.5" y1="15" x2="15.5" y2="15" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 4,
    label: 'Hài lòng',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        <path d="M8.5 14 Q12 17.5 15.5 14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 5,
    label: 'Rất tốt',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="9.5" r="1" fill="currentColor" />
        <circle cx="15" cy="9.5" r="1" fill="currentColor" />
        <path d="M8 13.5 Q12 19 16 13.5 Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'SEND' | 'HISTORY'>('SEND');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState<number>(4);
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<any | null>(null);

  // History State
  const [historyList, setHistoryList] = useState<SubmittedFeedback[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  const { toastError, toastWarning, toastSuccess } = useToast();

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiClient.get<any>('/api/v1/feedbacks');
      if (res?.data && Array.isArray(res.data)) {
        setHistoryList(res.data);
      } else if (Array.isArray(res)) {
        setHistoryList(res);
      } else {
        setHistoryList([]);
      }
    } catch {
      setHistoryList([]);
      toastWarning('Chưa thể tải lịch sử góp ý từ máy chủ');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toastWarning('Vui lòng nhập đầy đủ tiêu đề và nội dung góp ý.');
      return;
    }

    setSubmitting(true);
    try {
      const combinedContent = `${content.trim()}${
        suggestion.trim() ? `\n\n[Gợi ý giải pháp]: ${suggestion.trim()}` : ''
      }${satisfactionRating ? `\n[Mức độ hài lòng]: ${satisfactionRating}/5 sao` : ''}`;

      const res = await apiClient.post<any>('/api/v1/feedbacks', {
        userId: user?.id,
        fullName: user?.fullName || 'Người dân Cà Mau',
        phone: user?.phone || '0912345678',
        email: user?.email || '',
        category: 'GOP_Y',
        title: title.trim(),
        content: combinedContent,
      });

      const fbData = res?.data?.feedback || res?.feedback || res;
      setTicketResult(fbData);
      toastSuccess('Gửi góp ý thành công! Cảm ơn Quý khách.');
    } catch (err: any) {
      toastError(err?.message || 'Không thể gửi góp ý vào lúc này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHistory = historyList.filter((item) => {
    if (!searchCode.trim()) return true;
    const term = searchCode.toLowerCase();
    return (
      item.ticketCode.toLowerCase().includes(term) ||
      item.title.toLowerCase().includes(term) ||
      item.content.toLowerCase().includes(term)
    );
  });

  return (
    <div className="subpage-container" style={{ paddingBottom: '30px' }}>
      {/* Top Header Tab Switcher (Underline Tab Bar) */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          margin: '-14px -16px 6px -16px',
          padding: '0 8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('SEND')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 6px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'SEND' ? '2.5px solid #2563EB' : '2.5px solid transparent',
            color: activeTab === 'SEND' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'SEND' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Gửi góp ý
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 6px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'HISTORY' ? '2.5px solid #2563EB' : '2.5px solid transparent',
            color: activeTab === 'HISTORY' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'HISTORY' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Góp ý đã gửi
        </button>
      </div>

      {/* TAB 1: GỬI GÓP Ý */}
      {activeTab === 'SEND' && (
        <>
          {ticketResult ? (
            <div
              className="card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px 18px',
                border: '1px solid #BBF7D0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#166534', margin: 0 }}>
                Gửi Góp Ý Thành Công!
              </h3>

              <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                Mã phiếu phản hồi của bạn là:{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563EB', fontSize: '15px' }}>
                  {ticketResult.ticketCode}
                </span>
              </div>

              <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Bộ phận Chăm sóc khách hàng CAWACO sẽ ghi nhận ý kiến và cải thiện chất lượng dịch vụ trong thời gian sớm nhất.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTicketResult(null);
                    setTitle('');
                    setContent('');
                    setSuggestion('');
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Gửi thêm góp ý
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTicketResult(null);
                    setActiveTab('HISTORY');
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Xem góp ý đã gửi
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* CARD 1: Nội dung góp ý */}
              <div
                className="card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  marginBottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header Card 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                  <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                    Nội dung góp ý
                  </span>
                </div>

                {/* Tiêu đề */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.3px' }}>
                    TIÊU ĐỀ <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Đề xuất cải thiện..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Mô tả chi tiết */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.3px' }}>
                    MÔ TẢ CHI TIẾT <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mô tả chi tiết ý kiến, đề xuất của bạn..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.45,
                    }}
                  />
                </div>
              </div>

              {/* CARD 2: Đánh giá mức độ hài lòng */}
              <div
                className="card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  marginBottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* Header Card 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                    Đánh giá mức độ hài lòng
                  </span>
                </div>

                {/* 5 Emotion Faces */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4px 0' }}>
                  {RATING_LEVELS.map((item) => {
                    const isSelected = satisfactionRating === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSatisfactionRating(item.value)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '2px',
                          flex: 1,
                          outline: 'none',
                        }}
                      >
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                            border: isSelected ? '2px solid #3B82F6' : '1.5px solid #E2E8F0',
                            color: isSelected ? '#2563EB' : '#94A3B8',
                            transition: 'all 0.15s ease',
                            transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                            boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none',
                          }}
                        >
                          {item.icon}
                        </div>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#2563EB' : '#94A3B8',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CARD 3: Đề xuất cải thiện (tùy chọn) */}
              <div
                className="card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  marginBottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header Card 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                  </svg>
                  <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                    Đề xuất cải thiện (tùy chọn)
                  </span>
                </div>

                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Bạn có đề xuất gì để cải thiện dịch vụ?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: 1.45,
                  }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ paddingTop: '4px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#3B82F6',
                    backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.15s ease',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'ĐANG GỬI...' : 'GỬI GÓP Ý'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* TAB 2: GÓP Ý ĐÃ GỬI */}
      {activeTab === 'HISTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Thanh tìm kiếm phiếu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Tìm theo mã phiếu hoặc từ khóa..."
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '12.5px',
                color: '#0F172A',
              }}
            />
            {searchCode && (
              <button
                type="button"
                onClick={() => setSearchCode('')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#94A3B8',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {loadingHistory ? (
            <div className="card" style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '12px' }}>
              Đang tải danh sách góp ý...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '30px 16px', color: '#94A3B8', fontSize: '12.5px' }}>
              Chưa có phiếu góp ý nào được ghi nhận.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  marginBottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Header Card: Mã phiếu & Trạng thái */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '13px', color: '#2563EB' }}>
                      {item.ticketCode}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>• {item.createdAt}</span>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: item.isResolved ? '#DCFCE7' : '#FEF3C7',
                      color: item.isResolved ? '#166534' : '#92400E',
                    }}
                  >
                    {item.isResolved ? 'Đã phản hồi' : 'Đang xử lý'}
                  </span>
                </div>

                {/* Tiêu đề & Nội dung */}
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1.35 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                  {item.content}
                </div>

                {/* Phản hồi từ CAWACO nếu có */}
                {item.replyContent && (
                  <div
                    style={{
                      backgroundColor: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '11.5px',
                      color: '#0369A1',
                      marginTop: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#003B6F' }}>Phản hồi từ CAWACO:</span>
                    <span style={{ lineHeight: 1.45 }}>{item.replyContent}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
