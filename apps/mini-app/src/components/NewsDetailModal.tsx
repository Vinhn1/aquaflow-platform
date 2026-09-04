/**
 * NewsDetailModal.tsx — Modal hiển thị chi tiết bài viết tin tức CAWACO
 */

import React from 'react';

export interface NewsItem {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  category?: string;
  isOutageAlert?: boolean;
  affectedArea?: string;
  thumbnailUrl?: string;
  thumb?: string;
  sourceUrl?: string;
  publishedAt?: string;
  date?: string;
  tag?: string;
}

interface NewsDetailModalProps {
  news: NewsItem | null;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ news, onClose }) => {
  if (!news) return null;

  const formattedDate = news.date || (news.publishedAt 
    ? new Date(news.publishedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) 
    : '28/08/2026');

  const imageSrc = news.thumbnailUrl || news.thumb;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 47, 73, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '85vh',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 32px rgba(8, 47, 73, 0.25)',
          animation: 'slideUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid #E2E8F0',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--cawaco-primary, #0369A1)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              {news.isOutageAlert ? 'Lịch cúp nước' : (news.tag || 'Tin tức & Thông báo')}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px 18px 24px' }}>
          {/* Title */}
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.35,
              margin: '0 0 10px',
            }}
          >
            {news.title}
          </h2>

          {/* Date & Source */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748B',
              marginBottom: '14px',
              paddingBottom: '12px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <span>🗓 Ngày đăng: {formattedDate}</span>
            <span style={{ color: '#0284C7', fontWeight: 600 }}>CAWACO Cà Mau</span>
          </div>

          {/* Featured Image (chi hien khi co anh) */}
          {imageSrc && (
            <div
              style={{
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '16px',
                aspectRatio: '16 / 9',
                backgroundColor: '#E0F2FE',
              }}
            >
              <img
                src={imageSrc}
                alt={news.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Outage Notice Box if alert */}
          {news.isOutageAlert && (
            <div
              style={{
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', marginBottom: '4px' }}>
                ⚠️ THÔNG BÁO TẠM NGƯNG CẤP NƯỚC
              </div>
              {news.affectedArea && (
                <div style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                  <strong>Khu vực ảnh hưởng:</strong> {news.affectedArea}
                </div>
              )}
            </div>
          )}

          {/* Summary / Excerpt */}
          {news.summary && (
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#334155',
                lineHeight: 1.55,
                marginBottom: '14px',
                fontStyle: 'italic',
              }}
            >
              {news.summary}
            </p>
          )}

          {/* Full Content HTML */}
          <div
            style={{
              fontSize: '14px',
              color: '#334155',
              lineHeight: 1.65,
            }}
            dangerouslySetInnerHTML={{
              __html: news.content || `<p>${news.summary || news.title}</p>`,
            }}
          />

          {/* Footer Action: View Original Link (Chi hien thi doi voi tin tuc dong bo tu Website ctncamau.com.vn) */}
          {news.sourceUrl && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <a
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  backgroundColor: 'var(--cawaco-primary, #0369A1)',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(3, 105, 161, 0.25)',
                }}
              >
                Xem bài viết gốc trên Website CTNCAMAU.COM.VN ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
