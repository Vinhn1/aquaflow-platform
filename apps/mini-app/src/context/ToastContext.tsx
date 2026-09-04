import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  text: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (text: string, type?: ToastType, duration?: number) => void;
  toastSuccess: (text: string, duration?: number) => void;
  toastError: (text: string, duration?: number) => void;
  toastWarning: (text: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (text: string, type: ToastType = 'info', duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, text, type, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const toastSuccess = useCallback((text: string, duration?: number) => toast(text, 'success', duration), [toast]);
  const toastError = useCallback((text: string, duration?: number) => toast(text, 'error', duration), [toast]);
  const toastWarning = useCallback((text: string, duration?: number) => toast(text, 'warning', duration), [toast]);

  return (
    <ToastContext.Provider value={{ toast, toastSuccess, toastError, toastWarning }}>
      {children}

      {/* Container Toast nổi ở trên cùng của khung Mobile */}
      <div
        style={{
          position: 'fixed',
          top: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '380px',
          zIndex: 99999,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
              backdropFilter: 'blur(10px)',
              animation: 'toast-slide-down 0.25s ease-out forwards',
              backgroundColor:
                t.type === 'success'
                  ? '#065F46'
                  : t.type === 'error'
                  ? '#991B1B'
                  : t.type === 'warning'
                  ? '#92400E'
                  : '#0369A1',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            {/* SVG Icon chuẩn không bị lỗi font */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {t.type === 'success' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              {t.type === 'error' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FECACA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              {t.type === 'warning' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {t.type === 'info' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            <div style={{ flex: 1, fontSize: '12px', fontWeight: '600', lineHeight: '1.4' }}>
              {t.text}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-slide-down {
          0% { opacity: 0; transform: translateY(-12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
