import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../services/api.js';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionType?: string;
}

const SUGGESTIONS = [
  'Tra cứu tiền nước tháng này',
  'Giá nước sinh hoạt tính như thế nào?',
  'Thủ tục đăng ký lắp mới đồng hồ nước',
  'Địa chỉ và số tổng đài khẩn cấp CAWACO',
  'Kiểm tra rò rỉ đường ống nước trong nhà',
];

/**
 * Hàm phân tích và chuẩn hóa định dạng Markdown (loại bỏ dấu *, định dạng in đậm, in nghiêng, danh sách)
 */
function renderFormattedMessage(rawText: string) {
  const lines = rawText.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} style={{ height: '4px' }} />;
        }

        // Kiểm tra danh sách gạch đầu dòng hoặc số thứ tự
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isNumbered = /^\d+\.\s/.test(trimmed);

        const cleanLine = isBullet
          ? trimmed.substring(2)
          : isNumbered
            ? trimmed.replace(/^\d+\.\s/, '')
            : line;

        // Phân tích các đoạn in đậm **text** và in nghiêng *text*
        const parts: React.ReactNode[] = [];
        const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(cleanLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(cleanLine.substring(lastIndex, match.index));
          }
          const matchedStr = match[0];
          if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
            const boldContent = matchedStr.slice(2, -2);
            parts.push(
              <strong
                key={`${lineIdx}-${match.index}`}
                style={{
                  color: 'var(--cawaco-deep-navy, #003B6F)',
                  fontWeight: 700,
                }}
              >
                {boldContent}
              </strong>
            );
          } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
            const italicContent = matchedStr.slice(1, -1);
            parts.push(
              <em key={`${lineIdx}-${match.index}`} style={{ color: '#64748B', fontStyle: 'italic' }}>
                {italicContent}
              </em>
            );
          }
          lastIndex = match.index + matchedStr.length;
        }

        if (lastIndex < cleanLine.length) {
          parts.push(cleanLine.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
              <span style={{ color: 'var(--cawaco-primary, #0369A1)', fontWeight: 'bold', fontSize: '14px', lineHeight: '18px' }}>
                •
              </span>
              <div style={{ flex: 1, lineHeight: '1.5' }}>{parts}</div>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+)\./);
          const num = numMatch ? numMatch[1] : '•';
          return (
            <div key={lineIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
              <span style={{ color: 'var(--cawaco-primary, #0369A1)', fontWeight: 700, minWidth: '16px', fontSize: '12px' }}>
                {num}.
              </span>
              <div style={{ flex: 1, lineHeight: '1.5' }}>{parts}</div>
            </div>
          );
        }

        return (
          <div key={lineIdx} style={{ lineHeight: '1.5' }}>
            {parts}
          </div>
        );
      })}
    </div>
  );
}

export const AssistantPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Xin chào Quý khách! Tôi là Trợ lý ảo AI của Công ty Cổ phần Cấp nước Cà Mau (CAWACO). Tôi có thể hỗ trợ tra cứu hóa đơn, hướng dẫn thủ tục cấp nước, giá nước hoặc tiếp nhận thông tin sự cố 24/7. Quý khách cần hỗ trợ gì ạ?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputText).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await apiClient.post<any>('/api/v1/assistant/ask', { question: q });
      if (res?.answer) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          actionType: res.actionType,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Lỗi phản hồi từ máy chủ.');
      }
    } catch {
      const errorBotMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Rất tiếc, hệ thống đang bận. Quý khách vui lòng thử lại hoặc gọi hotline CSKH CAWACO: **0290 3836 360** để được hỗ trợ trực tiếp.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionsScrollRef = useRef<HTMLDivElement>(null);

  const handleSuggestionsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (suggestionsScrollRef.current && e.deltaY !== 0) {
      suggestionsScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="chat-fullscreen-wrapper">
      {/* Scrollable Messages Area */}
      <div className="chat-messages-body">
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '4px',
            }}
          >
            <div className={m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
              {m.sender === 'bot' ? renderFormattedMessage(m.text) : m.text}

              {/* Nút hành động trực tiếp nếu chatbot gợi ý điều hướng */}
              {m.sender === 'bot' && m.actionType && onNavigate && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0' }}>
                  {m.actionType === 'NAVIGATE_INVOICE' && (
                    <button
                      onClick={() => onNavigate('INVOICES')}
                      style={{
                        backgroundColor: 'var(--cawaco-primary, #0369A1)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Thanh toán &amp; Xem hóa đơn ngay</span>
                      <span>&rarr;</span>
                    </button>
                  )}
                  {m.actionType === 'NAVIGATE_REGISTRATION' && (
                    <button
                      onClick={() => onNavigate('REGISTRATION')}
                      style={{
                        backgroundColor: 'var(--cawaco-primary, #0369A1)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Mở mẫu Đăng ký lắp mới</span>
                      <span>&rarr;</span>
                    </button>
                  )}
                  {m.actionType === 'NAVIGATE_COMPLAINT' && (
                    <button
                      onClick={() => onNavigate('COMPLAINTS')}
                      style={{
                        backgroundColor: '#DC2626',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Báo sự cố khẩn cấp</span>
                      <span>&rarr;</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <span className="chat-time-tag">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div className="chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontStyle: 'italic' }}>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--cawaco-primary)' }} />
              <span>Trợ lý ảo CAWACO đang xử lý...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Pills */}
      <div
        ref={suggestionsScrollRef}
        onWheel={handleSuggestionsWheel}
        className="chat-suggestions-row"
      >
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sug)}
            className="chat-sug-btn"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Fixed Bottom Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="chat-input-bar"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập câu hỏi của bạn..."
          className="chat-input-field"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="chat-btn-send"
        >
          Gửi
        </button>
      </form>
    </div>
  );
};
