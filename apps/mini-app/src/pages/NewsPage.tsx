import React, { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiClient } from '../services/api.js';
import { Skeleton } from '../components/states/Skeleton.js';
import { EmptyState } from '../components/states/EmptyState.js';
import { ErrorAlert } from '../components/states/ErrorAlert.js';
import { NewsDetailModal, NewsItem } from '../components/NewsDetailModal.js';

export const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);

  const {
    data: newsList,
    status,
    error,
    refetch,
  } = useApi(() => apiClient.get<NewsItem[]>('/api/v1/news'), []);

  const categories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'MAINTENANCE_OUTAGE', label: 'Lịch cúp nước' },
    { id: 'TARIFF_POLICY', label: 'Biểu giá nước' },
    { id: 'COMMUNITY', label: 'Tin hoạt động' },
    { id: 'ANNOUNCEMENT', label: 'Thông báo' },
  ];

  const filteredNews = newsList?.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '7px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === cat.id ? 'var(--cawaco-primary, #0369A1)' : '#FFFFFF',
              color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--color-text-body, #334155)',
              boxShadow: selectedCategory === cat.id ? '0 2px 8px rgba(3, 105, 161, 0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: selectedCategory === cat.id ? 'var(--cawaco-primary, #0369A1)' : '#E2E8F0',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Danh sách tin tức */}
      {status === 'loading' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ padding: '14px' }}>
            <Skeleton height="20px" width="70%" />
            <div style={{ margin: '8px 0' }}>
              <Skeleton height="14px" count={2} />
            </div>
            <Skeleton height="12px" width="40%" />
          </div>
          <div className="card" style={{ padding: '14px' }}>
            <Skeleton height="20px" width="50%" />
            <div style={{ margin: '8px 0' }}>
              <Skeleton height="14px" count={2} />
            </div>
            <Skeleton height="12px" width="35%" />
          </div>
        </div>
      ) : error ? (
        <ErrorAlert message={error} onRetry={refetch} />
      ) : !filteredNews || filteredNews.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <EmptyState title="Chưa có tin tức mới" description="Hiện chưa có bài viết nào trong danh mục này." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNews.map((item) => {
            const formattedDate = item.publishedAt 
              ? new Date(item.publishedAt).toLocaleDateString('vi-VN')
              : (item.date || '28/08/2026');
            const imgUrl = item.thumbnailUrl || item.thumb;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  boxShadow: '0 2px 8px rgba(3, 105, 161, 0.06)',
                  border: '1px solid var(--color-border-subtle, #E2E8F0)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  transition: 'background-color 0.15s',
                }}
                onClick={() => setActiveNews(item)}
              >
                {/* Thumbnail ben trai (chi hien khi co anh) */}
                {imgUrl && (
                  <div
                    style={{
                      width: '84px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#E0F2FE',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Noi dung ben phai */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: item.isOutageAlert ? '#FEF2F2' : '#E0F2FE',
                        color: item.isOutageAlert ? '#DC2626' : '#0369A1',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.isOutageAlert ? 'Lịch cúp nước' : (item.category === 'TARIFF_POLICY' ? 'Biểu giá' : 'Tin tức')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                      {formattedDate}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--color-text-main, #0F172A)',
                      lineHeight: 1.35,
                      marginBottom: '4px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Chi tiết tin tức */}
      <NewsDetailModal
        news={activeNews}
        onClose={() => setActiveNews(null)}
      />
    </div>
  );
};

