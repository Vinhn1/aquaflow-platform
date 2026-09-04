import React, { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { apiClient } from '../services/api.js';

interface PaymentAgent {
  id: string;
  name: string;
  agentType: string;
  district: string;
  address: string;
  phone?: string;
  openingHours: string;
}

const DISTRICT_NAMES: Record<string, string> = {
  ALL: 'Tất cả khu vực',
  TP_CA_MAU: 'TP. Cà Mau',
  THOI_BINH: 'Huyện Thới Bình',
  CAI_NUOC: 'Huyện Cái Nước',
  TRAN_VAN_THOI: 'Huyện Trần Văn Thời',
  DAM_DOI: 'Huyện Đầm Dơi',
  NAM_CAN: 'Huyện Năm Căn',
  NGOC_HIEN: 'Huyện Ngọc Hiển',
  U_MINH: 'Huyện U Minh',
  PHU_TAN: 'Huyện Phú Tân',
};

const AGENT_TAG_CLASSES: Record<string, { label: string; className: string }> = {
  VNPOST: { label: 'Bưu Điện VNPost', className: 'agent-tag agent-tag-vnpost' },
  VIETTEL_POST: { label: 'Viettel Post', className: 'agent-tag agent-tag-viettel' },
  PAYOO: { label: 'Điểm Thu Payoo', className: 'agent-tag agent-tag-payoo' },
  BANK: { label: 'Ngân Hàng', className: 'agent-tag agent-tag-bank' },
  STORE: { label: 'Cửa Hàng Tiện Lợi', className: 'agent-tag agent-tag-payoo' },
};

export const AgentsPage: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [search, setSearch] = useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { data: agents, status } = useApi(
    () =>
      apiClient.get<PaymentAgent[]>(
        `/api/v1/agents?district=${selectedDistrict}&search=${encodeURIComponent(search)}`
      ),
    [selectedDistrict, search]
  );

  // Cho phep dung cuon chuot de luot ngang tren may tinh
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="subpage-container">
      {/* Search & Filter Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="search-bar-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên bưu cục, cửa hàng, đường..."
            className="search-bar-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="search-bar-clear">✕</button>
          )}
        </div>

        {/* District Filter Pills with horizontal scroll */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="filter-pills-scroll"
        >
          {Object.entries(DISTRICT_NAMES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedDistrict(key)}
              className={`filter-pill ${selectedDistrict === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Agents List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-main)' }}>
          Danh sách điểm thu hộ ủy quyền
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
          {agents ? `${agents.length} điểm` : 'Đang tải...'}
        </span>
      </div>

      {/* Agents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {status === 'loading' ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '12px' }}>
            Đang tải danh sách đại lý thu hộ...
          </div>
        ) : agents && agents.length > 0 ? (
          agents.map((agent) => {
            const badge = AGENT_TAG_CLASSES[agent.agentType] || {
              label: agent.agentType,
              className: 'agent-tag agent-tag-payoo',
            };

            return (
              <div key={agent.id} className="agent-item-card">
                <div className="agent-card-header">
                  <div className="agent-title-text">{agent.name}</div>
                  <span className={badge.className}>{badge.label}</span>
                </div>

                <div className="agent-info-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{agent.address}</span>
                </div>

                <div className="agent-footer-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{agent.openingHours}</span>
                  </span>

                  {agent.phone && (
                    <a href={`tel:${agent.phone.replace(/\s+/g, '')}`} className="agent-phone-link">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{agent.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '12px' }}>
            Không tìm thấy điểm thu hộ nào trong khu vực này.
          </div>
        )}
      </div>
    </div>
  );
};
