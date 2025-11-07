import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Pago, Alquiler, Property, Inquilino } from '../types';
import { useEntityManagement } from '../hooks/useEntityManagement';
import { PageHeader } from './shared/PageHeader';
import { LoadingState } from './shared/LoadingState';
import { ErrorMessage } from './shared/ErrorMessage';
import { EntityDetailModal } from './shared/EntityDetailModal';
import { EntityTable } from './shared/EntityTable';
import { ToggleSwitch } from './shared/ToggleSwitch';
import './shared-table.css';

/**
 * Tipo para los datos del formulario de Pago
 * Nota: El tipo PagoFormData en types/index.ts no coincide con Pago,
 * así que usamos un tipo local basado en Pago
 */
type PagoFormData = Omit<Pago, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Componente principal para gestionar Pagos
 * 
 * Este componente utiliza el hook useEntityManagement para la gestión de pagos,
 * pero también necesita cargar alquileres para el select del formulario.
 * Ahora los pagos están dentro del contexto de un alquiler específico.
 */
const Pagos: React.FC = () => {
  const { alquilerId } = useParams<{ alquilerId: string }>();
  const navigate = useNavigate();
  const [alquiler, setAlquiler] = useState<Alquiler | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [inquilino, setInquilino] = useState<Inquilino | null>(null);

  const {
    entities: pagos,
    loading,
    error,
    showForm,
    editingEntity: editingPago,
    searchTerm,
    selectedIds: selectedPagos,
    viewingEntity: viewingPago,
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
    handleSubmit,
  } = useEntityManagement<Pago, PagoFormData>({
    loadEntities: () => apiService.getPagos(0, 100, ''),
    createEntity: (data) => apiService.createPago(data as any),
    updateEntity: (id, data) => apiService.updatePago(id, data as any),
    deleteEntity: (id) => apiService.deletePago(id),
    getEntityId: (p) => p.id,
    getEntityName: (p) => `Pago #${p.id}`,
    filterFunction: (pago, term) => false,
    initialFormData: {
      alquilerId: alquilerId ? parseInt(alquilerId) : 0,
      fechaPago: '',
      montoMensual: alquiler?.montoMensual || 0,
      pagoRenta: true,
      pagoAgua: false,
      pagoEnergia: false,
      pagoGas: false,
    },
    loadError: 'Error al cargar los pagos',
    saveError: 'Error al guardar el pago',
    deleteError: 'Error al eliminar el pago',
  });

  // Filtrar pagos por alquilerId
  const pagosFiltrados = useMemo(() => {
    if (!alquilerId) return pagos;
    const id = parseInt(alquilerId);
    return pagos.filter(p => p.alquilerId === id);
  }, [pagos, alquilerId]);

  useEffect(() => {
    if (!alquilerId) {
      navigate('/alquileres');
      return;
    }

    const loadAlquilerData = async () => {
      try {
        const id = parseInt(alquilerId);
        
        // Cargar alquiler
        const alquilerRes = await apiService.getAlquiler(id);
        if (alquilerRes.success && alquilerRes.data) {
          setAlquiler(alquilerRes.data);
          
          // Cargar propiedad e inquilino
          const [propertyRes, inquilinoRes] = await Promise.all([
            apiService.getProperty(alquilerRes.data.propiedadId),
            apiService.getInquilino(alquilerRes.data.inquilinoId),
          ]);
          
          if (propertyRes.success && propertyRes.data) {
            setProperty(propertyRes.data);
          }
          if (inquilinoRes.success && inquilinoRes.data) {
            setInquilino(inquilinoRes.data);
          }
        }
      } catch (err) {
        console.error('Error loading alquiler data:', err);
      }
    };

    loadAlquilerData();
  }, [alquilerId, navigate]);

  const handleEditPago = (pago: Pago) => {
    handleEdit(pago, (p) => ({
      alquilerId: p.alquilerId,
      fechaPago: p.fechaPago,
      montoMensual: p.montoMensual,
      pagoRenta: p.pagoRenta,
      pagoAgua: p.pagoAgua,
      pagoEnergia: p.pagoEnergia,
      pagoGas: p.pagoGas,
    }));
  };

  const handleDeletePago = (id: number, name: string) => {
    handleDelete(id, name);
  };

  // Actualizar formData cuando cambie el alquiler
  useEffect(() => {
    if (alquiler && !editingPago) {
      setFormData({
        alquilerId: alquiler.id,
        fechaPago: '',
        montoMensual: alquiler.montoMensual,
        pagoRenta: true,
        pagoAgua: false,
        pagoEnergia: false,
        pagoGas: false,
      });
    }
  }, [alquiler, editingPago, setFormData]);

  if (loading && pagos.length === 0) {
    return <LoadingState message="Cargando pagos..." />;
  }

  const alquilerName = alquiler 
    ? (property && inquilino 
        ? `${property.nombre} - ${inquilino.nombre}`
        : `Alquiler #${alquiler.id}`)
    : (alquilerId ? `Alquiler #${alquilerId}` : 'Alquiler');

  return (
    <div className="page-container">
      <PageHeader
        title={`Gestionar pagos de ${alquilerName}`}
        buttonText="Crear pago"
        onButtonClick={() => setShowForm(true)}
      />

      <ErrorMessage message={error} />

      {showForm && (
        <div className="form-modal" onClick={(e) => {
          if (e.target === e.currentTarget) handleCancel();
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
                {editingPago ? 'Editar Pago' : 'Nuevo Pago'}
              </h2>
              <button
                type="button"
                onClick={handleCancel}
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
            <form onSubmit={handleSubmit}>
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
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    value={formData.fechaPago}
                    onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
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
                  <ToggleSwitch
                    checked={formData.pagoRenta}
                    onChange={(checked) => setFormData({ ...formData, pagoRenta: checked })}
                    label="Pago de Renta"
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
                    checked={formData.pagoAgua}
                    onChange={(checked) => setFormData({ ...formData, pagoAgua: checked })}
                    label="Pago de Agua"
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
                    checked={formData.pagoEnergia}
                    onChange={(checked) => setFormData({ ...formData, pagoEnergia: checked })}
                    label="Pago de Energía"
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
                    checked={formData.pagoGas}
                    onChange={(checked) => setFormData({ ...formData, pagoGas: checked })}
                    label="Pago de Gas"
                  />
                </div>
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
                  onClick={handleCancel}
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
                  {editingPago ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPago && (
        <EntityDetailModal
          show={!!viewingPago}
          entity={viewingPago}
          title="Detalles del Pago"
          fields={[
            {
              key: 'fechaPago',
              label: 'Fecha de Pago',
              render: (value: string) => new Date(value).toLocaleDateString(),
            },
            {
              key: 'montoMensual',
              label: 'Monto Mensual',
              render: (value: number) => `$${value.toFixed(2)}`,
            },
            {
              key: 'pagoRenta',
              label: 'Pago de Renta',
              render: (value: boolean) => (value ? 'Sí' : 'No'),
            },
            {
              key: 'pagoAgua',
              label: 'Pago de Agua',
              render: (value: boolean) => (value ? 'Sí' : 'No'),
            },
            {
              key: 'pagoEnergia',
              label: 'Pago de Energía',
              render: (value: boolean) => (value ? 'Sí' : 'No'),
            },
            {
              key: 'pagoGas',
              label: 'Pago de Gas',
              render: (value: boolean) => (value ? 'Sí' : 'No'),
            },
          ]}
          onClose={() => setViewingEntity(null)}
        />
      )}

      <EntityTable
        entities={pagosFiltrados}
        filteredEntities={pagosFiltrados}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedIds={selectedPagos}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectEntity={handleSelectEntity}
        onView={handleView}
        onEdit={handleEditPago}
        onDelete={handleDeletePago}
        getEntityId={getEntityId}
        getEntityName={getEntityName}
        truncateText={truncateText}
        columns={[
          {
            key: 'fechaPago',
            label: 'Fecha de Pago',
            render: (p) => new Date(p.fechaPago).toLocaleDateString(),
            sortable: true,
            maxLength: 15,
          },
          {
            key: 'montoMensual',
            label: 'Monto Mensual',
            render: (p) => `$${p.montoMensual.toFixed(2)}`,
            sortable: true,
            maxLength: 15,
          },
          {
            key: 'pagoRenta',
            label: 'Pago de Renta',
            render: (p) => (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                {p.pagoRenta ? (
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
            key: 'pagoAgua',
            label: 'Pago de Agua',
            render: (p) => (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {p.pagoAgua ? (
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
            key: 'pagoEnergia',
            label: 'Pago de Energía',
            render: (p) => (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {p.pagoEnergia ? (
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
            key: 'pagoGas',
            label: 'Pago de Gas',
            render: (p) => (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {p.pagoGas ? (
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
        emptyMessage="No hay pagos registrados"
        emptySearchMessage="No se encontraron pagos que coincidan con la búsqueda"
        selectAllLabel="Seleccionar todos los pagos"
        showSearch={false}
      />
    </div>
  );
};

export default Pagos;
