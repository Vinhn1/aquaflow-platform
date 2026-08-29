import { useState, useEffect, useCallback } from 'react';

export type ApiStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface UseApiResult<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook quan ly goi du lieu API voi day du cac trang thai loading, empty, error
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: any[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ApiStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const result = await fetcher();
      if (Array.isArray(result) && result.length === 0) {
        setStatus('empty');
      } else if (!result) {
        setStatus('empty');
      } else {
        setStatus('success');
      }
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setStatus('error');
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    status,
    error,
    refetch: execute,
  };
}
