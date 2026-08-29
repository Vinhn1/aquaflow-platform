import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm, 8px)',
  className = '',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`skeleton-shimmer ${className}`}
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: '#E2E8F0',
            marginBottom: count > 1 && idx < count - 1 ? '8px' : '0',
          }}
        />
      ))}
    </>
  );
};
