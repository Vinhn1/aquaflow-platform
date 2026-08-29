import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--cawaco-primary-subtle, #EBF5FB)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--cawaco-primary, #127AB5)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>

      <div
        style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--color-text-main, #0F172A)',
          marginBottom: '6px',
        }}
      >
        {title}
      </div>

      {description && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-muted, #64748B)',
            maxWidth: '280px',
            lineHeight: 1.5,
            marginBottom: actionText ? '16px' : '0',
          }}
        >
          {description}
        </div>
      )}

      {actionText && onAction && (
        <button
          className="btn btn-primary"
          onClick={onAction}
          style={{ width: 'auto', padding: '8px 18px', fontSize: '13px' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
