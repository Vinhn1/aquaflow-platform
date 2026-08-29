import React, { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiClient } from '../services/api.js';
import { Skeleton } from '../components/states/Skeleton.js';
import { EmptyState } from '../components/states/EmptyState.js';
import { ErrorAlert } from '../components/states/ErrorAlert.js';

export const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeNews, setActiveNews] = useState<any | null>(null);

  const {
    data: newsList,
    status,
    error,
    refetch,
  } = useApi(() => apiClient.get<any[]>('/api/v1/news'), []);

  const categories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'OUTAGE_NOTICE', label: 'Lịch cúp nước' },
    { id: 'POLICY_UPDATE', label: 'Biểu giá nước' },
    { id: 'COMMUNITY', label: 'Tin hoạt động' },
  ];

  const filteredNews = newsList?.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div style={{ paddingBottom: '30px' }}>
      <div className="section-title">Tin tức & Thông báo cấp nước</div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === cat.id ? 'var(--color-primary)' : '#E2E8F0',
              color: selectedCategory === cat.id ? '#FFF' : 'var(--color-text-main)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Danh sach tin */}
      {status === 'loading' ? (
        <div className="card">
          <Skeleton height="20px" width="60%" />
          <div style={{ margin: '8px 0' }}>
            <Skeleton height="14px" count={2} />
          </div>
          <Skeleton height="12px" width="40%" />
        </div>
      ) : error ? (
        <ErrorAlert message={error} onRetry={refetch} />
      ) : !filteredNews || filteredNews.length === 0 ? (
        <div className="card">
          <EmptyState title="Không có thông báo nào" description="Hiện chưa có bài viết mới trong mục này." />
        </div>
      ) : (
        filteredNews.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{ marginBottom: '12px', cursor: 'pointer' }}
            onClick={() => setActiveNews(item)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: item.category === 'OUTAGE_NOTICE' ? '#FEF2F2' : '#F0FDF4',
                  color: item.category === 'OUTAGE_NOTICE' ? '#DC2626' : '#16A34A',
                  textTransform: 'uppercase',
                }}
              >
                {item.category === 'OUTAGE_NOTICE' ? 'Tạm ngưng cấp nước' : 'Thông báo'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {new Date(item.publishedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>

            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)', lineHeight: 1.4, marginBottom: '6px' }}>
              {item.title}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {item.summary}
            </div>

            {item.affectedAreas && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  backgroundColor: '#FFFBEB',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#B45309',
                }}
              >
                <strong>Khu vực ảnh hưởng:</strong> {item.affectedAreas}
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal Chi tiet tin tuc */}
      {activeNews && (
        <div className="modal-overlay" onClick={() => setActiveNews(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                {activeNews.title}
              </div>
              <button
                onClick={() => setActiveNews(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', marginLeft: '8px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Ngày đăng: {new Date(activeNews.publishedAt).toLocaleDateString('vi-VN')} | Nguồn: Công ty CP Cấp Nước Cà Mau
            </div>

            {activeNews.affectedAreas && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#FFFBEB',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#92400E',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}
              >
                <div><strong>Khu vực tạm ngưng cấp nước:</strong> {activeNews.affectedAreas}</div>
                {activeNews.outageStartTime && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Thời gian dự kiến:</strong> {new Date(activeNews.outageStartTime).toLocaleTimeString('vi-VN')} - {new Date(activeNews.outageEndTime).toLocaleTimeString('vi-VN')}
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'var(--color-text-main)',
                whiteSpace: 'pre-wrap',
                marginBottom: '20px',
              }}
            >
              {activeNews.content}
            </div>

            <button className="btn btn-secondary" onClick={() => setActiveNews(null)} style={{ width: '100%' }}>
              Đóng thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
