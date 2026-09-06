import { useState, useEffect, useCallback } from 'react';

export interface SidebarCounts {
  queueWaiting: number;
  complaintsPending: number;
  registrationsPending: number;
  activeOutages: number;
  activeStaff: number;
  meterReadingsPending: number;
}

const DEFAULT_COUNTS: SidebarCounts = {
  queueWaiting: 0,
  complaintsPending: 0,
  registrationsPending: 0,
  activeOutages: 0,
  activeStaff: 0,
  meterReadingsPending: 0,
};

export const REFRESH_SIDEBAR_COUNTS_EVENT = 'aquaflow:refresh-sidebar-counts';

export function triggerSidebarCountRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REFRESH_SIDEBAR_COUNTS_EVENT));
  }
}

export function useSidebarCounts(pollingIntervalMs = 5000) {
  const [counts, setCounts] = useState<SidebarCounts>(DEFAULT_COUNTS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/stats/sidebar-counts');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          let meterCount = json.data.meterReadingsPending !== undefined ? Number(json.data.meterReadingsPending) : NaN;
          if (isNaN(meterCount)) {
            try {
              const mRes = await fetch('/api/v1/meter-readings');
              if (mRes.ok) {
                const mJson = await mRes.json();
                if (mJson.success && Array.isArray(mJson.data)) {
                  meterCount = mJson.data.filter((r: any) => r.status === 'PENDING_REVIEW').length;
                }
              }
            } catch {
              meterCount = 0;
            }
          }

          setCounts({
            queueWaiting: Number(json.data.queueWaiting) || 0,
            complaintsPending: Number(json.data.complaintsPending) || 0,
            registrationsPending: Number(json.data.registrationsPending) || 0,
            activeOutages: Number(json.data.activeOutages) || 0,
            activeStaff: Number(json.data.activeStaff) || 0,
            meterReadingsPending: Number(meterCount) || 0,
          });
        }
      }
    } catch {
      // Giữ nguyên counts hiện tại nếu lỗi mạng nhẹ
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();

    // Polling định kỳ
    const interval = setInterval(fetchCounts, pollingIntervalMs);

    // Tự động refresh khi người dùng quay lại tab
    const handleFocus = () => {
      fetchCounts();
    };

    // Lắng nghe custom event khi có action nghiệp vụ
    const handleCustomRefresh = () => {
      fetchCounts();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener(REFRESH_SIDEBAR_COUNTS_EVENT, handleCustomRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener(REFRESH_SIDEBAR_COUNTS_EVENT, handleCustomRefresh);
    };
  }, [fetchCounts, pollingIntervalMs]);

  return { counts, loading, refetch: fetchCounts };
}
