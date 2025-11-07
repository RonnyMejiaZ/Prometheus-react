import React from 'react';
import { apiService } from '../services/api';
import { Property, PropertyFormData } from '../types';
import { useEntityManagement } from '../hooks/useEntityManagement';
import { PageHeader } from './shared/PageHeader';
import { LoadingState } from './shared/LoadingState';
import { ErrorMessage } from './shared/ErrorMessage';
import { EntityFormModal } from './shared/EntityFormModal';
import { EntityDetailModal } from './shared/EntityDetailModal';
import { EntityTable } from './shared/EntityTable';
import './shared-table.css';

/**
 * Componente principal para gestionar Propiedades
 * 
 * Este componente utiliza el mismo hook useEntityManagement que Inquilinos,
 * pero configurado para trabajar con Propiedades. Esto demuestra la reutilización
 * del código: la misma lógica funciona para diferentes tipos de entidades.
 * 
 * La estructura es idéntica a Inquilinos, solo cambian:
 * - Los tipos (Property vs Inquilino)
 * - Las funciones de API
 * - Los campos del formulario
 * - La función de filtrado
 */
const Properties: React.FC = () => {
  const {
    entities: properties,
    filteredEntities: filteredProperties,
    loading,
    error,
    showForm,
    editingEntity: editingProperty,
    searchTerm,
    selectedIds: selectedProperties,
    viewingEntity: viewingProperty,
    formData,
    setFormData,
    setShowForm,
    setSearchTerm,
    setViewingEntity,
    handleSubmit,
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
  } = useEntityManagement<Property, PropertyFormData>({
    // Configuración específica de Propiedades (similar a Inquilinos pero con funciones diferentes)
    loadEntities: () => apiService.getProperties(0, 100, ''),
    createEntity: (data) => apiService.createProperty(data),
    updateEntity: (id, data) => apiService.updateProperty(id, data),
    deleteEntity: (id) => apiService.deleteProperty(id),
    getEntityId: (p) => p.id,
    getEntityName: (p) => p.nombre,
    
    // Filtrado por nombre, dirección o descripción
    filterFunction: (property, term) =>
      property.nombre.toLowerCase().includes(term) ||
      property.direccion.toLowerCase().includes(term) ||
      property.descripcion.toLowerCase().includes(term),
    
    // Valores iniciales del formulario para Propiedades
    initialFormData: {
      nombre: '',
      direccion: '',
      descripcion: '',
      rentado: false,  // Campo booleano específico de Propiedades
    },
    
    // Mensajes de error personalizados
    loadError: 'Error al cargar las propiedades',
    saveError: 'Error al guardar la propiedad',
    deleteError: 'Error al eliminar la propiedad',
  });

  // Mapea Property a PropertyFormData al editar
  const handleEditProperty = (property: Property) => {
    handleEdit(property, (p) => ({
      nombre: p.nombre,
      direccion: p.direccion,
      descripcion: p.descripcion,
      rentado: p.rentado,
    }));
  };

  const handleDeleteProperty = (id: number, name: string) => {
    handleDelete(id, name);
  };

  // Estado de carga inicial
  if (loading && properties.length === 0) {
    return <LoadingState message="Cargando propiedades..." />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Propiedades"
        buttonText="Crear propiedad"
        onButtonClick={() => setShowForm(true)}
      />

      <ErrorMessage message={error} />

      {/* Formulario para crear/editar propiedades */}
      <EntityFormModal<PropertyFormData>
        show={showForm}
        isEditing={!!editingProperty}
        title="Nueva Propiedad"
        editTitle="Editar Propiedad"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        fields={[
          { key: 'nombre', label: 'Nombre', type: 'text', required: true },
          { key: 'direccion', label: 'Dirección', type: 'text', required: true },
          { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
          { key: 'rentado', label: 'Rentado', type: 'checkbox' },  // Campo checkbox específico
        ]}
      />

      {/* Modal de detalles con renderizado personalizado para el campo 'rentado' */}
      {viewingProperty && (
        <EntityDetailModal
          show={!!viewingProperty}
          entity={viewingProperty}
          title="Detalles de la Propiedad"
          fields={[
            { key: 'nombre', label: 'Nombre' },
            { key: 'direccion', label: 'Dirección' },
            { key: 'descripcion', label: 'Descripción' },
            {
              key: 'rentado',
              label: 'Rentado',
              render: (p: Property) => (
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                  {p.rentado ? (
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
          onClose={() => setViewingEntity(null)}
        />
      )}

      <EntityTable
        entities={properties}
        filteredEntities={filteredProperties}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedIds={selectedProperties}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectEntity={handleSelectEntity}
        onView={handleView}
        onEdit={handleEditProperty}
        onDelete={handleDeleteProperty}
        getEntityId={getEntityId}
        getEntityName={getEntityName}
        truncateText={truncateText}
        columns={[
          {
            key: 'nombre',
            label: 'Nombre',
            render: (p) => p.nombre,
            sortable: true,
            maxLength: 25,
          },
          {
            key: 'direccion',
            label: 'Dirección',
            render: (p) => p.direccion,
            sortable: true,
            maxLength: 25,
          },
          {
            key: 'descripcion',
            label: 'Descripción',
            render: (p) => p.descripcion,
            maxLength: 35,
          },
          {
            key: 'rentado',
            label: 'Rentado',
            render: (p: Property) => (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                {p.rentado ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#10b981" strokeWidth="2"/>
                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg  width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#ef4444" strokeWidth="2"/>
                    <path d="M9 9L15 15M15 9L9 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ),
          },
        ]}
        emptyMessage="No hay propiedades registradas"
        emptySearchMessage="No se encontraron propiedades que coincidan con la búsqueda"
        selectAllLabel="Seleccionar todas las propiedades"
      />
    </div>
  );
};

export default Properties;
