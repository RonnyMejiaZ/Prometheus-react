import React from 'react';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="page-container">
      <div className="loading">{message}</div>
    </div>
  );
}

