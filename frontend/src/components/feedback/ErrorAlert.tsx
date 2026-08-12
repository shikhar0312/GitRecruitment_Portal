import React from 'react';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`p-3 bg-error-container text-on-error-container rounded-md text-sm ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
};
