import React from 'react';
import { apiService } from '../services/api';
import { Inquilino, InquilinoFormData } from '../types';
import { useEntityManagement } from '../hooks/useEntityManagement';
import { PageHeader } from './shared/PageHeader';
import { LoadingState } from './shared/LoadingState';
import { ErrorMessage } from './shared/ErrorMessage';
import { EntityFormModal } from './shared/EntityFormModal';
import { EntityDetailModal } from './shared/EntityDetailModal';
import { EntityTable } from './shared/EntityTable';
import './shared-table.css';

/**
 * Componente principal para gestionar Inquilinos
 * 
 * Este componente utiliza el hook personalizado useEntityManagement que centraliza
 * toda la lógica común de CRUD (Crear, Leer, Actualizar, Eliminar), búsqueda,
 * selección múltiple y manejo de formularios.
 * 
 * La ventaja de este enfoque es que el código es más declarativo y fácil de mantener,
 * ya que solo necesitamos configurar las funciones específicas de Inquilinos y
 * el hook se encarga del resto.
 */
const Inquilinos: React.FC = () => {
  // Hook personalizado que maneja toda la lógica de gestión de entidades
  // Recibe funciones específicas de Inquilinos y devuelve todo lo necesario para el componente
  const {
    // Estados de datos
    entities: inquilinos,                    // Lista completa de inquilinos
    filteredEntities: filteredInquilinos,    // Lista filtrada según búsqueda
    loading,                                 // Estado de carga
    error,                                   // Mensaje de error si existe
    
    // Estados de UI
    showForm,                                // Si el formulario está visible
    editingEntity: editingInquilino,         // Inquilino que se está editando (null si es nuevo)
    searchTerm,                              // Término de búsqueda actual
    selectedIds: selectedInquilinos,         // IDs de inquilinos seleccionados
    viewingEntity: viewingInquilino,         // Inquilino que se está viendo en detalle
    formData,                                // Datos del formulario actual
    
    // Funciones para actualizar estados
    setFormData,                             // Actualizar datos del formulario
    setShowForm,                             // Mostrar/ocultar formulario
    setSearchTerm,                           // Actualizar término de búsqueda
    setViewingEntity,                        // Establecer inquilino a ver
    
    // Handlers de acciones
    handleSubmit,                            // Enviar formulario (crear/actualizar)
    handleEdit,                              // Abrir formulario en modo edición
    handleDelete,                            // Eliminar inquilino
    handleCancel,                            // Cancelar formulario
    handleView,                              // Ver detalles de inquilino
    handleSelectAll,                         // Seleccionar/deseleccionar todos
    handleSelectEntity,                      // Seleccionar/deseleccionar un inquilino
    
    // Utilidades
    truncateText,                            // Función para truncar texto largo
    isAllSelected,                           // Si todos están seleccionados
    isIndeterminate,                         // Estado intermedio del checkbox (algunos seleccionados)
    getEntityId,                             // Función para obtener ID de una entidad
    getEntityName,                           // Función para obtener nombre de una entidad
  } = useEntityManagement<Inquilino, InquilinoFormData>({
    // Configuración específica de Inquilinos:
    
    // Función para cargar todos los inquilinos desde la API
    loadEntities: () => apiService.getInquilinos(0, 100, ''),
    
    // Función para crear un nuevo inquilino
    createEntity: (data) => apiService.createInquilino(data),
    
    // Función para actualizar un inquilino existente
    updateEntity: (id, data) => apiService.updateInquilino(id, data),
    
    // Función para eliminar un inquilino
    deleteEntity: (id) => apiService.deleteInquilino(id),
    
    // Función para extraer el ID de un inquilino
    getEntityId: (i) => i.id,
    
    // Función para extraer el nombre de un inquilino (usado en mensajes)
    getEntityName: (i) => i.nombre,
    
    // Función de filtrado: define qué campos se buscan cuando el usuario escribe
    filterFunction: (inquilino, term) =>
      inquilino.nombre.toLowerCase().includes(term) ||
      inquilino.email.toLowerCase().includes(term) ||
      inquilino.telefono.toLowerCase().includes(term) ||
      inquilino.documento?.toLowerCase().includes(term) ||
      false,
    
    // Valores iniciales del formulario cuando se crea un nuevo inquilino
    initialFormData: {
      nombre: '',
      email: '',
      telefono: '',
      documento: '',
    },
    
    // Mensajes de error personalizados para Inquilinos
    loadError: 'Error al cargar los inquilinos',
    saveError: 'Error al guardar el inquilino',
    deleteError: 'Error al eliminar el inquilino',
  });

  // Wrapper para handleEdit que mapea los datos del inquilino al formato del formulario
  // Esto es necesario porque la estructura de Inquilino puede diferir de InquilinoFormData
  const handleEditInquilino = (inquilino: Inquilino) => {
    handleEdit(inquilino, (i) => ({
      nombre: i.nombre,
      email: i.email,
      telefono: i.telefono,
      documento: i.documento || '',  // Asegura que documento sea string, no undefined
    }));
  };

  // Wrapper para handleDelete que simplemente pasa los parámetros
  // Se mantiene por consistencia y por si necesitamos lógica adicional en el futuro
  const handleDeleteInquilino = (id: number, name: string) => {
    handleDelete(id, name);
  };

  // Mostrar estado de carga solo cuando se está cargando por primera vez
  // (no cuando se está guardando o eliminando, para no bloquear la UI)
  if (loading && inquilinos.length === 0) {
    return <LoadingState message="Cargando inquilinos..." />;
  }

  // Renderizado principal del componente
  return (
    <div className="page-container">
      {/* Encabezado de la página con título y botón para crear nuevo inquilino */}
      <PageHeader
        title="Inquilinos"
        buttonText="Nuevo Inquilino"
        onButtonClick={() => setShowForm(true)}  // Al hacer clic, muestra el formulario
      />

      {/* Muestra mensaje de error si existe */}
      <ErrorMessage message={error} />

      {/* Modal de formulario para crear/editar inquilinos
          Se muestra cuando showForm es true */}
      <EntityFormModal<InquilinoFormData>
        show={showForm}
        isEditing={!!editingInquilino}  // true si estamos editando, false si es nuevo
        title="Nuevo Inquilino"
        editTitle="Editar Inquilino"
        formData={formData}
        onFormDataChange={setFormData}  // Actualiza formData cuando el usuario escribe
        onSubmit={handleSubmit}          // Se ejecuta al enviar el formulario
        onCancel={handleCancel}          // Se ejecuta al cancelar
        fields={[
          // Configuración de los campos del formulario
          { key: 'nombre', label: 'Nombre', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'telefono', label: 'Teléfono', type: 'text', required: true },
          { key: 'documento', label: 'Documento', type: 'text' },  // Opcional
        ]}
      />

      {/* Modal de detalles: se muestra cuando viewingInquilino tiene un valor
          Permite ver la información completa de un inquilino sin editarla */}
      {viewingInquilino && (
        <EntityDetailModal
          show={!!viewingInquilino}
          entity={viewingInquilino}
          title="Detalles del Inquilino"
          fields={[
            // Define qué campos mostrar y cómo etiquetarlos
            { key: 'nombre', label: 'Nombre' },
            { key: 'email', label: 'Email' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'documento', label: 'Documento' },
          ]}
          onClose={() => setViewingEntity(null)}  // Cierra el modal
        />
      )}

      {/* Tabla principal que muestra la lista de inquilinos
          Incluye búsqueda, selección múltiple, y acciones (ver/editar/eliminar) */}
      <EntityTable
        entities={inquilinos}                    // Lista completa
        filteredEntities={filteredInquilinos}    // Lista filtrada (lo que se muestra)
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}           // Actualiza búsqueda cuando el usuario escribe
        selectedIds={selectedInquilinos}         // IDs de inquilinos seleccionados
        isAllSelected={isAllSelected}            // Estado del checkbox "seleccionar todos"
        isIndeterminate={isIndeterminate}        // Estado intermedio del checkbox
        onSelectAll={handleSelectAll}            // Handler para seleccionar/deseleccionar todos
        onSelectEntity={handleSelectEntity}      // Handler para seleccionar un inquilino
        onView={handleView}                      // Abre modal de detalles
        onEdit={handleEditInquilino}             // Abre formulario en modo edición
        onDelete={handleDeleteInquilino}         // Elimina el inquilino
        getEntityId={getEntityId}                // Función para obtener ID
        getEntityName={getEntityName}            // Función para obtener nombre
        truncateText={truncateText}              // Función para truncar texto largo
        columns={[
          // Configuración de columnas de la tabla
          {
            key: 'nombre',
            label: 'Nombre',
            render: (i) => i.nombre,             // Cómo renderizar esta columna
            sortable: true,                      // Permite ordenar por esta columna
            maxLength: 25,                       // Trunca texto a 25 caracteres
          },
          {
            key: 'email',
            label: 'Email',
            render: (i) => i.email,
            sortable: true,
            maxLength: 25,
          },
          {
            key: 'telefono',
            label: 'Teléfono',
            render: (i) => i.telefono,
            maxLength: 35,
          },
          {
            key: 'documento',
            label: 'Documento',
            render: (i) => i.documento,
            maxLength: 35,
          },
        ]}
        emptyMessage="No hay inquilinos registrados"  // Mensaje cuando no hay datos
        emptySearchMessage="No se encontraron inquilinos que coincidan con la búsqueda"  // Mensaje cuando búsqueda no encuentra resultados
        selectAllLabel="Seleccionar todos los inquilinos"  // Label accesible para el checkbox
      />
    </div>
  );
};

export default Inquilinos;
