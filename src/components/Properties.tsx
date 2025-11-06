import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Property, PropertyFormData } from '../types';
import './Properties.css';

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    nombre: '',
    direccion: '',
    descripcion: '',
    rentado: false
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProperties(0, 100, '');
      if (response.success && response.data) {
        setProperties(response.data.items);
      }
    } catch (err) {
      setError('Error al cargar las propiedades');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingProperty) {
        await apiService.updateProperty(editingProperty.id, formData);
      } else {
        await apiService.createProperty(formData);
      }
      await loadProperties();
      setShowForm(false);
      setEditingProperty(null);
      resetForm();
    } catch (err) {
      setError('Error al guardar la propiedad');
      console.error('Error saving property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      nombre: property.nombre,
      direccion: property.direccion,
      descripcion: property.descripcion,
      rentado: property.rentado
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        setLoading(true);
        await apiService.deleteProperty(id);
        await loadProperties();
      } catch (err) {
        setError('Error al eliminar la propiedad');
        console.error('Error deleting property:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      descripcion: '',
      rentado: false
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProperty(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="properties">
        <div className="loading">Cargando propiedades...</div>
      </div>
    );
  }

  return (
    <div className="properties">
      <div className="properties-header">
        <h1>Propiedades</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Nueva Propiedad
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dirección:</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.rentado}
                    onChange={(e) => setFormData({...formData, rentado: e.target.checked})}
                  />
                  Rentado
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingProperty ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="properties-list">
        {properties.length === 0 ? (
          <div className="empty-state">
            <p>No hay propiedades registradas</p>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-content">
                <h3>{property.nombre}</h3>
                <p><strong>Dirección:</strong> {property.direccion}</p>
                <p><strong>Descripción:</strong> {property.descripcion}</p>
                <p><strong>Estado:</strong> {property.rentado ? 'Rentado' : 'Disponible'}</p>
              </div>
              <div className="property-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(property)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(property.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Properties;
