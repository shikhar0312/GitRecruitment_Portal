import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = '',
}) => (
  <div className={`p-8 text-center text-on-surface-variant ${className}`}>{message}</div>
);
