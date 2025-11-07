import { useState, useEffect, useMemo } from 'react';

/**
 * Opciones de configuración para el hook useEntityManagement
 * 
 * @template T - Tipo de la entidad (ej: Property, Inquilino)
 * @template TFormData - Tipo de los datos del formulario (ej: PropertyFormData, InquilinoFormData)
 */
interface UseEntityManagementOptions<T, TFormData> {
  // Función para cargar todas las entidades desde la API
  loadEntities: () => Promise<{ success: boolean; data?: { items: T[] } }>;
  
  // Función para crear una nueva entidad
  createEntity: (data: TFormData) => Promise<any>;
  
  // Función para actualizar una entidad existente
  updateEntity: (id: number, data: TFormData) => Promise<any>;
  
  // Función para eliminar una entidad
  deleteEntity: (id: number) => Promise<any>;
  
  // Función para extraer el ID de una entidad
  getEntityId: (entity: T) => number;
  
  // Función para extraer el nombre de una entidad (usado en mensajes)
  getEntityName: (entity: T) => string;
  
  // Función que define cómo filtrar las entidades según el término de búsqueda
  filterFunction: (entity: T, searchTerm: string) => boolean;
  
  // Valores iniciales del formulario
  initialFormData: TFormData;
  
  // Mensajes de error personalizados
  loadError: string;
  saveError: string;
  deleteError: string;
}

/**
 * Hook personalizado para gestionar entidades (CRUD, búsqueda, selección)
 * 
 * Este hook centraliza toda la lógica común de gestión de entidades, permitiendo
 * que los componentes sean más simples y declarativos. Maneja:
 * - Carga de datos desde la API
 * - Operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * - Búsqueda y filtrado
 * - Selección múltiple
 * - Estado de formularios
 * - Manejo de errores y estados de carga
 * 
 * @template T - Tipo de la entidad
 * @template TFormData - Tipo de los datos del formulario
 * 
 * @example
 * const { entities, handleSubmit, handleDelete } = useEntityManagement({
 *   loadEntities: () => apiService.getProperties(),
 *   createEntity: (data) => apiService.createProperty(data),
 *   // ... más configuraciones
 * });
 */
export function useEntityManagement<T, TFormData>({
  loadEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  getEntityId,
  getEntityName,
  filterFunction,
  initialFormData,
  loadError,
  saveError,
  deleteError,
}: UseEntityManagementOptions<T, TFormData>) {
  // Estados del hook
  const [entities, setEntities] = useState<T[]>([]);              // Lista completa de entidades
  const [loading, setLoading] = useState(true);                    // Estado de carga
  const [error, setError] = useState<string | null>(null);         // Mensaje de error
  const [showForm, setShowForm] = useState(false);                 // Si el formulario está visible
  const [editingEntity, setEditingEntity] = useState<T | null>(null); // Entidad que se está editando
  const [searchTerm, setSearchTerm] = useState('');                // Término de búsqueda
  const [viewingEntity, setViewingEntity] = useState<T | null>(null); // Entidad que se está viendo
  const [formData, setFormData] = useState<TFormData>(initialFormData); // Datos del formulario

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Carga las entidades desde la API
   * Maneja el estado de carga y errores
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loadEntities();
      if (response.success && response.data) {
        setEntities(response.data.items);
      }
    } catch (err) {
      setError(loadError);
      console.error('Error loading entities:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario (crear o actualizar)
   * Determina automáticamente si es creación o edición basándose en editingEntity
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingEntity) {
        // Si hay una entidad en edición, actualizamos
        await updateEntity(getEntityId(editingEntity), formData);
      } else {
        // Si no hay entidad en edición, creamos una nueva
        await createEntity(formData);
      }
      await loadData();  // Recargar datos después de guardar
      setShowForm(false);
      setEditingEntity(null);
      resetForm();
    } catch (err) {
      setError(saveError);
      console.error('Error saving entity:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre el formulario en modo edición
   * 
   * @param entity - La entidad a editar
   * @param mapEntityToFormData - Función opcional para mapear la entidad al formato del formulario
   *                              (útil cuando la estructura de la entidad difiere del formulario)
   */
  const handleEdit = (entity: T, mapEntityToFormData?: (entity: T) => TFormData) => {
    setEditingEntity(entity);
    // Si se proporciona una función de mapeo, la usamos; si no, asumimos que son compatibles
    setFormData(mapEntityToFormData ? mapEntityToFormData(entity) : (entity as unknown as TFormData));
    setShowForm(true);
  };

  /**
   * Elimina una entidad después de confirmar con el usuario
   * 
   * @param id - ID de la entidad a eliminar
   * @param entityName - Nombre de la entidad (para el mensaje de confirmación)
   */
  const handleDelete = async (id: number, entityName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${entityName}?`)) {
      try {
        setLoading(true);
        await deleteEntity(id);
        await loadData();
      } catch (err) {
        setError(deleteError);
        console.error('Error deleting entity:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Resetea el formulario a sus valores iniciales
   */
  const resetForm = () => {
    setFormData(initialFormData);
  };

  /**
   * Cancela la edición/creación y cierra el formulario
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingEntity(null);
    resetForm();
  };

  /**
   * Abre el modal de detalles para ver una entidad
   */
  const handleView = (entity: T) => {
    setViewingEntity(entity);
  };

  /**
   * Lista filtrada de entidades basada en el término de búsqueda
   * Se recalcula automáticamente cuando cambian entities, searchTerm o filterFunction
   * useMemo optimiza el rendimiento evitando recalcular si las dependencias no cambian
   */
  const filteredEntities = useMemo(() => {
    if (!searchTerm.trim()) {
      // Si no hay búsqueda, devolver todas las entidades
      return entities;
    }
    const term = searchTerm.toLowerCase();
    // Filtrar usando la función personalizada proporcionada
    return entities.filter(entity => filterFunction(entity, term));
  }, [entities, searchTerm, filterFunction]);

  /**
   * Trunca un texto a una longitud máxima, agregando "..." si es necesario
   * Útil para mostrar texto largo en tablas sin romper el diseño
   */
  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Retornar todo lo necesario para que el componente pueda funcionar
  return {
    // Datos
    entities,              // Lista completa de entidades
    filteredEntities,      // Lista filtrada según búsqueda
    loading,               // Estado de carga
    error,                 // Mensaje de error
    
    // Estados de UI
    showForm,              // Si el formulario está visible
    editingEntity,         // Entidad en edición (null si es nueva)
    searchTerm,            // Término de búsqueda actual
    viewingEntity,         // Entidad que se está viendo
    formData,              // Datos del formulario
    
    // Setters
    setFormData,           // Actualizar datos del formulario
    setShowForm,           // Mostrar/ocultar formulario
    setSearchTerm,         // Actualizar término de búsqueda
    setViewingEntity,      // Establecer entidad a ver
    
    // Handlers
    handleSubmit,          // Enviar formulario
    handleEdit,            // Editar entidad
    handleDelete,          // Eliminar entidad
    handleCancel,          // Cancelar formulario
    handleView,            // Ver detalles
    
    // Utilidades
    truncateText,          // Función para truncar texto
    getEntityId,           // Función para obtener ID
    getEntityName,         // Función para obtener nombre
    loadData,              // Función para recargar datos
    resetForm,             // Función para resetear formulario
  };
}

