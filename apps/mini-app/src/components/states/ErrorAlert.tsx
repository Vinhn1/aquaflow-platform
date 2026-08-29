import React from 'react';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại.',
  onRetry,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-danger-subtle, #FDECEC)',
        border: '1px solid var(--color-danger, #D9383A)',
        borderRadius: 'var(--radius-md, 12px)',
        padding: '16px',
        margin: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ color: 'var(--color-danger, #D9383A)', marginBottom: '8px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div
        style={{
          fontSize: '13px',
          color: '#991B1B',
          lineHeight: 1.5,
          marginBottom: onRetry ? '12px' : '0',
        }}
      >
        {message}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: 'var(--color-danger, #D9383A)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm, 8px)',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Thử lại
        </button>
      )}
    </div>
  );
};
