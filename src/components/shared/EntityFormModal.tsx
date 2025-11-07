import React from 'react';
import { ToggleSwitch } from './ToggleSwitch';

interface EntityFormModalProps<T = Record<string, any>> {
  show: boolean;
  isEditing: boolean;
  title: string;
  editTitle: string;
  formData: T;
  onFormDataChange: (data: T) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'checkbox';
    required?: boolean;
    placeholder?: string;
  }>;
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function EntityFormModal<T = Record<string, any>>({
  show,
  isEditing,
  title,
  editTitle,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  fields,
}: EntityFormModalProps<T>) {
  if (!show) return null;

  const handleFieldChange = (key: string, value: any) => {
    onFormDataChange({ ...formData, [key]: value } as T);
  };

  return (
    <div className="form-modal" onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="form-content" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        border: '1px solid #333',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        maxWidth: '900px',
        width: '95%'
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
            {isEditing ? editTitle : title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
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
        
        <form onSubmit={onSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {fields.map((field) => (
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
                {field.type === 'checkbox' ? (
                  <ToggleSwitch
                    checked={(formData as Record<string, any>)[field.key] || false}
                    onChange={(checked) => handleFieldChange(field.key, checked)}
                    label={field.label}
                  />
                ) : (
                  <>
                    <label style={{ 
                      fontSize: '11px', 
                      fontWeight: 600,
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '4px'
                    }}>
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={(formData as Record<string, any>)[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        style={{
                          padding: '12px',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #2d2d2d',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: '100px',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={(formData as Record<string, any>)[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        style={{
                          padding: '12px',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #2d2d2d',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
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
              onClick={onCancel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#2d2d2d',
                border: '1px solid #3d3d3d',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3d3d3d';
                e.currentTarget.style.borderColor = '#4d4d4d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d2d2d';
                e.currentTarget.style.borderColor = '#3d3d3d';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#ff6600',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e55a00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6600';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

