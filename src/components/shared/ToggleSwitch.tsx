import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  label?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export function ToggleSwitch({ checked, label, disabled = false, onChange }: ToggleSwitchProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      justifyContent: 'flex-start'
    }}>
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '48px',
          height: '24px',
          borderRadius: '12px',
          backgroundColor: checked ? '#ff6600' : '#4d4d4d',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '26px' : '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            transition: 'left 0.2s ease',
          }}
        />
      </div>
      {label && (
        <span style={{ 
          color: '#ffffff', 
          fontSize: '14px',
          fontWeight: 500
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

