import React, { useState, useRef } from 'react';

interface FileUploadProps {
  label?: string;
  description?: string;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  value?: File | null;
  onChange?: (file: File | null) => void;
  collapsible?: boolean;
}

export function FileUpload({
  label = 'Contrato',
  description = 'El documento del contrato es opcional.',
  acceptedTypes = ['.pdf', '.docx', '.jpg', '.png'],
  maxSize = 5,
  value,
  onChange,
  collapsible = true,
}: FileUploadProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Tipo de archivo no permitido. Solo se aceptan: ${acceptedTypes.join(', ')}`);
      return false;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onChange?.(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div style={{
      marginBottom: '24px',
      gridColumn: '1 / -1'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '4px'
          }}>
            {label}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            {description}
          </p>
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {isExpanded && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!value ? handleBrowseClick : undefined}
          style={{
            padding: '32px',
            backgroundColor: '#0f0f0f',
            border: `2px dashed ${isDragging ? '#ff6600' : '#2d2d2d'}`,
            borderRadius: '10px',
            textAlign: 'center',
            cursor: !value ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (!value) {
              e.currentTarget.style.borderColor = '#ff6600';
              e.currentTarget.style.backgroundColor = '#1a1a1a';
            }
          }}
          onMouseLeave={(e) => {
            if (!value) {
              e.currentTarget.style.borderColor = '#2d2d2d';
              e.currentTarget.style.backgroundColor = '#0f0f0f';
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {!value ? (
            <>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: '#ffffff'
              }}>
                Arrastra y suelta tus archivos o{' '}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                  style={{
                    color: '#ff6600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Examina
                </span>
              </p>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#9ca3af',
                textAlign: 'right'
              }}>
                Solo {acceptedTypes.join(', ')} o imágenes ({acceptedTypes.filter(t => t === '.jpg' || t === '.png').join(', ')}), hasta {maxSize}MB
              </p>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#ff6600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="#ff6600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H9H8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#ffffff',
                    fontWeight: 500
                  }}>
                    {value.name}
                  </p>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    {formatFileSize(value.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #3d3d3d',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3d3d3d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d2d2d';
                }}
              >
                Cambiar archivo
              </button>
            </div>
          )}

          {error && (
            <p style={{
              margin: '12px 0 0 0',
              fontSize: '12px',
              color: '#ef4444',
              textAlign: 'center'
            }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

