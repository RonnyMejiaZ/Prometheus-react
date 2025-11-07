import React from 'react';

interface PageHeaderProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function PageHeader({ title, buttonText, onButtonClick }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <button className="btn btn-primary" onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
}

