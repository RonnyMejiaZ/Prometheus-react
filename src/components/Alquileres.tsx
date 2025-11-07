import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Alquiler, AlquilerFormData, Property, Inquilino } from '../types';
import { useEntityManagement } from '../hooks/useEntityManagement';
import { PageHeader } from './shared/PageHeader';
import { LoadingState } from './shared/LoadingState';
import { ErrorMessage } from './shared/ErrorMessage';
import { EntityDetailModal } from './shared/EntityDetailModal';
import { EntityTable } from './shared/EntityTable';
import { ToggleSwitch } from './shared/ToggleSwitch';
import { FileUpload } from './shared/FileUpload';
import './shared-table.css';

/**
 * Componente principal para gestionar Alquileres
 * 
 * Este componente utiliza el hook useEntityManagement para la gestión de alquileres,
 * pero también necesita cargar propiedades e inquilinos para los selects del formulario.
 */
const Alquileres: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [contratoFile, setContratoFile] = useState<File | null>(null);

  const {
    entities: alquileres,
    filteredEntities: filteredAlquileres,
    loading,
    error,
    showForm,
    editingEntity: editingAlquiler,
    searchTerm,
    selectedIds: selectedAlquileres,
    viewingEntity: viewingAlquiler,
    formData,
    setShowForm,
    setSearchTerm,
    setViewingEntity,
    setFormData,
    handleEdit,
    handleDelete,
    handleCancel,
    handleView,
    handleSelectAll,
    handleSelectEntity,
    truncateText,
    isAllSelected,
    isIndeterminate,
    getEntityId,
    getEntityName,
    loadData,
  } = useEntityManagement<Alquiler, AlquilerFormData>({
    loadEntities: () => apiService.getAlquileres(0, 100, ''),
    createEntity: (data) => apiService.createAlquiler(data, null),
    updateEntity: (id, data) => apiService.updateAlquiler(id, data, null),
    deleteEntity: (id) => apiService.deleteAlquiler(id),
    getEntityId: (a) => a.id,
    getEntityName: (a) => {
      if (a.nombre && a.nombre.trim() !== '') {
        return a.nombre;
      }
      const property = properties.find(p => p.id === a.propiedadId);
      const inquilino = inquilinos.find(i => i.id === a.inquilinoId);
      return `${property?.nombre || 'N/A'} - ${inquilino?.nombre || 'N/A'}`;
    },
    filterFunction: (alquiler, term) => {
      const property = properties.find(p => p.id === alquiler.propiedadId);
      const inquilino = inquilinos.find(i => i.id === alquiler.inquilinoId);
      return (
        (alquiler.nombre && alquiler.nombre.toLowerCase().includes(term)) ||
        property?.nombre.toLowerCase().includes(term) ||
        inquilino?.nombre.toLowerCase().includes(term) ||
        alquiler.fechaInicio.toLowerCase().includes(term) ||
        alquiler.fechaFin.toLowerCase().includes(term) ||
        alquiler.meses.toString().includes(term) ||
        alquiler.montoMensual.toString().includes(term) ||
        alquiler.personas.toString().includes(term) ||
        alquiler.activo.toString().includes(term) ||
        false
      );
    },
    initialFormData: {
      nombre: '',
      propiedadId: 0,
      inquilinoId: 0,
      fechaInicio: '',
      fechaFin: '',
      meses: 0,
      montoMensual: 0,
      personas: 0,
      activo: true,
    },
    loadError: 'Error al cargar los alquileres',
    saveError: 'Error al guardar el alquiler',
    deleteError: 'Error al eliminar el alquiler',
  });

  useEffect(() => {
    const loadPropertiesAndInquilinos = async () => {
      try {
        const [propertiesRes, inquilinosRes] = await Promise.all([
          apiService.getProperties(0, 100, ''),
          apiService.getInquilinos(0, 100, ''),
        ]);

        if (propertiesRes.success && propertiesRes.data) {
          setProperties(propertiesRes.data.items);
        }
        if (inquilinosRes.success && inquilinosRes.data) {
          setInquilinos(inquilinosRes.data.items);
        }
      } catch (err) {
        console.error('Error loading properties and inquilinos:', err);
      }
    };

    loadPropertiesAndInquilinos();
  }, []);

  const handleEditAlquiler = (alquiler: Alquiler) => {
    handleEdit(alquiler, (a) => ({
      nombre: a.nombre,
      propiedadId: a.propiedadId,
      inquilinoId: a.inquilinoId,
      fechaInicio: a.fechaInicio,
      fechaFin: a.fechaFin,
      meses: a.meses,
      montoMensual: a.montoMensual,
      personas: a.personas,
      activo: a.activo,
    }));
    setContratoFile(null);
  };

  const handleCancelWithReset = () => {
    handleCancel();
    setContratoFile(null);
  };

  const handleSubmitWithFile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const alquilerData = {
        nombre: formData.nombre,
        propiedadId: formData.propiedadId,
        inquilinoId: formData.inquilinoId,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        meses: formData.meses,
        montoMensual: formData.montoMensual,
        personas: formData.personas,
        activo: formData.activo,
      };

      if (editingAlquiler) {
        await apiService.updateAlquiler(getEntityId(editingAlquiler), alquilerData, contratoFile);
      } else {
        await apiService.createAlquiler(alquilerData, contratoFile);
      }
      
      await loadData();
      setShowForm(false);
      setContratoFile(null);
      setFormData({
        nombre: '',
        propiedadId: 0,
        inquilinoId: 0,
        fechaInicio: '',
        fechaFin: '',
        meses: 0,
        montoMensual: 0,
        personas: 0,
        activo: true,
      });
    } catch (err) {
      console.error('Error saving alquiler:', err);
      alert('Error al guardar el alquiler. Por favor, intenta nuevamente.');
    }
  };

  const handleDeleteAlquiler = (id: number, name: string) => {
    handleDelete(id, name);
  };

  const getPropertyName = (id: number) => {
    const property = properties.find(p => p.id === id);
    return property ? property.nombre : 'Propiedad no encontrada';
  };

  const getInquilinoName = (id: number) => {
    const inquilino = inquilinos.find(i => i.id === id);
    return inquilino ? inquilino.nombre : 'Inquilino no encontrado';
  };

  if (loading && alquileres.length === 0) {
    return <LoadingState message="Cargando alquileres..." />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Alquileres"
        buttonText="Nuevo Alquiler"
        onButtonClick={() => setShowForm(true)}
      />

      <ErrorMessage message={error} />

      {showForm && (
        <div className="form-modal" onClick={(e) => {
          if (e.target === e.currentTarget) handleCancelWithReset();
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
                {editingAlquiler ? 'Editar Alquiler' : 'Nuevo Alquiler'}
              </h2>
              <button
                type="button"
                onClick={handleCancelWithReset}
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitWithFile}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
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
                </div>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Propiedad
                  </label>
                  <select
                    value={formData.propiedadId}
                    onChange={(e) => setFormData({ ...formData, propiedadId: parseInt(e.target.value) })}
                    required
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
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={0} style={{ backgroundColor: '#1a1a1a' }}>Seleccionar propiedad</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id} style={{ backgroundColor: '#1a1a1a' }}>
                        {property.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Inquilino
                  </label>
                  <select
                    value={formData.inquilinoId}
                    onChange={(e) => setFormData({ ...formData, inquilinoId: parseInt(e.target.value) })}
                    required
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
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={0} style={{ backgroundColor: '#1a1a1a' }}>Seleccionar inquilino</option>
                    {inquilinos.map(inquilino => (
                      <option key={inquilino.id} value={inquilino.id} style={{ backgroundColor: '#1a1a1a' }}>
                        {inquilino.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    required
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
                </div>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    required
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
                </div>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Monto Mensual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.montoMensual}
                    onChange={(e) => setFormData({ ...formData, montoMensual: parseFloat(e.target.value) || 0 })}
                    required
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
                </div>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Meses
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.meses}
                    onChange={(e) => setFormData({ ...formData, meses: parseInt(e.target.value) || 0 })}
                    required
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
                </div>
                <div style={{
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
                }}>
                  <label style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    Número de Personas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.personas}
                    onChange={(e) => setFormData({ ...formData, personas: parseInt(e.target.value) || 0 })}
                    required
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
                </div>
                <div style={{
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
                }}>
                  <ToggleSwitch
                    checked={formData.activo}
                    onChange={(checked) => setFormData({ ...formData, activo: checked })}
                    label="Activo"
                  />
                </div>
              </div>
              
              <FileUpload
                label="Contrato"
                description="El documento del contrato es opcional."
                acceptedTypes={['.pdf', '.docx', '.jpg', '.png']}
                maxSize={5}
                value={contratoFile}
                onChange={setContratoFile}
              />

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
                  onClick={handleCancelWithReset}
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
                  {editingAlquiler ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingAlquiler && (
        <EntityDetailModal
          show={!!viewingAlquiler}
          entity={viewingAlquiler}
          title="Detalles del Alquiler"
          fields={[
            {
              key: 'nombre',
              label: 'Nombre',
            },
            {
              key: 'propiedadId',
              label: 'Propiedad',
              render: (value: number) => getPropertyName(value),
            },
            {
              key: 'inquilinoId',
              label: 'Inquilino',
              render: (value: number) => getInquilinoName(value),
            },
            {
              key: 'fechaInicio',
              label: 'Fecha de Inicio',
              render: (value: string) => new Date(value).toLocaleDateString(),
            },
            {
              key: 'fechaFin',
              label: 'Fecha de Fin',
              render: (value: string) => new Date(value).toLocaleDateString(),
            },
            {
              key: 'montoMensual',
              label: 'Monto Mensual',
              render: (value: number) => `$${value.toFixed(2)}`,
            },
            {
              key: 'meses',
              label: 'Meses Totales',
              render: (value: number) => `${value} ${value === 1 ? 'mes' : 'meses'}`,
            },
            {
              key: 'personas',
              label: 'Número de Personas',
              render: (value: number) => `${value} ${value === 1 ? 'persona' : 'personas'}`,
            },
            {
              key: 'activo',
              label: 'Estado',
              render: (value: boolean) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {value ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#10b981" strokeWidth="2"/>
                      <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#ef4444" strokeWidth="2"/>
                      <path d="M9 9L15 15M15 9L9 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              ),
            },
            {
              key: 'contrato',
              label: 'Contrato',
              render: (value: string | undefined) => {
                if (!value || value.trim() === '') {
                  return (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      No hay contrato adjunto
                    </span>
                  );
                }
                
                const fileUrl = `http://localhost:8080/prometheus_web_war_exploded/${value}`;
                const fileName = value.split(/[/\\]/).pop() || 'contrato';
                
                return (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#ff6600',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ff8533';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#ff6600';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V15C5 15.5304 5.21071 16.0391 5.58579 16.4142C5.96086 16.7893 6.46957 17 7 17H13C13.5304 17 14.0391 16.7893 14.4142 16.4142C14.7893 16.0391 15 15.5304 15 15V5C15 4.46957 14.7893 3.96086 14.4142 3.58579C14.0391 3.21071 13.5304 3 13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 3V7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 11H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{fileName}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                );
              },
            },
          ]}
          onClose={() => setViewingEntity(null)}
        />
      )}

      <EntityTable
        entities={alquileres}
        filteredEntities={filteredAlquileres}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedIds={selectedAlquileres}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectEntity={handleSelectEntity}
        onView={handleView}
        onEdit={handleEditAlquiler}
        onDelete={handleDeleteAlquiler}
        getEntityId={getEntityId}
        getEntityName={getEntityName}
        truncateText={truncateText}
        customActions={(alquiler) => (
          <button
            className="actions-menu-item btn-view"
            onClick={() => navigate(`/alquileres/${alquiler.id}/pagos`)}
            aria-label={`Gestionar pagos de ${getEntityName(alquiler)}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1.33333V14.6667M3.33333 4H12.6667C13.0203 4 13.3594 4.14048 13.6095 4.39052C13.8595 4.64057 14 4.97971 14 5.33333V10.6667C14 11.0203 13.8595 11.3594 13.6095 11.6095C13.3594 11.8595 13.0203 12 12.6667 12H3.33333C2.97971 12 2.64057 11.8595 2.39052 11.6095C2.14048 11.3594 2 11.0203 2 10.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M6 7.33333H10M6 9.33333H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Pagos</span>
          </button>
        )}
        columns={[
          {
            key: 'nombre',
            label: 'Nombre',
            render: (a) => a.nombre || '-',
            sortable: true,
            maxLength: 30,
          },
          {
            key: 'propiedad',
            label: 'Propiedad',
            render: (a) => getPropertyName(a.propiedadId),
            sortable: true,
            maxLength: 25,
          },
          {
            key: 'inquilino',
            label: 'Inquilino',
            render: (a) => getInquilinoName(a.inquilinoId),
            sortable: true,
            maxLength: 25,
          },
          {
            key: 'fechaInicio',
            label: 'Fecha Inicio',
            render: (a) => new Date(a.fechaInicio).toLocaleDateString(),
            maxLength: 15,
          },
          {
            key: 'fechaFin',
            label: 'Fecha Fin',
            render: (a) => new Date(a.fechaFin).toLocaleDateString(),
            maxLength: 15,
          },
            {
              key: 'montoMensual',
              label: 'Monto Mensual',
              render: (a) => `$${a.montoMensual.toFixed(2)}`,
              maxLength: 15,
            },
            {
              key: 'meses',
              label: 'Meses',
              render: (a) => `${a.meses} ${a.meses === 1 ? 'mes' : 'meses'}`,
              maxLength: 10,
            },
            {
              key: 'personas',
              label: 'Personas',
              render: (a) => `${a.personas} ${a.personas === 1 ? 'persona' : 'personas'}`,
              maxLength: 10,
            },
            {
              key: 'activo',
              label: 'Estado',
            render: (a) => (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                {a.activo ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#10b981" strokeWidth="2"/>
                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#ef4444" strokeWidth="2"/>
                    <path d="M9 9L15 15M15 9L9 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ),
          },
        ]}
        emptyMessage="No hay alquileres registrados"
        emptySearchMessage="No se encontraron alquileres que coincidan con la búsqueda"
        selectAllLabel="Seleccionar todos los alquileres"
      />
    </div>
  );
};

export default Alquileres;
