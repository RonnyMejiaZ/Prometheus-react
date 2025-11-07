import React from 'react';

interface EntityDetailModalProps {
  show: boolean;
  entity: any;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
  }>;
  onClose: () => void;
}

// Icono SVG de cerrar
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function EntityDetailModal({
  show,
  entity,
  title,
  fields,
  onClose,
}: EntityDetailModalProps) {
  if (!show || !entity) return null;

  return (
    <div className="form-modal" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="form-content view-content" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        border: '1px solid #333',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '2px solid #ff6600'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.5px'
          }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2d2d2d';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {fields.map((field) => {
            const value = entity[field.key];
            return (
              <div 
                key={field.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '20px',
                  backgroundColor: '#0f0f0f',
                  borderRadius: '10px',
                  border: '1px solid #2d2d2d',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                }}
              >
                <strong style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px'
                }}>
                  {field.label}
                </strong>
                <span style={{ 
                  fontSize: '16px', 
                  color: '#ffffff',
                  fontWeight: 500,
                  wordBreak: 'break-word',
                  lineHeight: '1.5'
                }}>
                  {field.render ? field.render(value) : value || '-'}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="form-actions" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #2d2d2d'
        }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

