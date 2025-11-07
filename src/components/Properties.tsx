import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';
import { Property, PropertyFormData } from '../types';
import './Properties.css';

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
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

  const handleView = (property: Property) => {
    setViewingProperty(property);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProperties(filteredProperties.map(p => p.id));
    } else {
      setSelectedProperties([]);
    }
  };

  const handleSelectProperty = (id: number) => {
    setSelectedProperties(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) {
      return properties;
    }
    const term = searchTerm.toLowerCase();
    return properties.filter(property =>
      property.nombre.toLowerCase().includes(term) ||
      property.direccion.toLowerCase().includes(term) ||
      property.descripcion.toLowerCase().includes(term)
    );
  }, [properties, searchTerm]);

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isAllSelected = filteredProperties.length > 0 && selectedProperties.length === filteredProperties.length;
  const isIndeterminate = selectedProperties.length > 0 && selectedProperties.length < filteredProperties.length;

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
          Crear propiedad
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

      {viewingProperty && (
        <div className="form-modal">
          <div className="form-content view-content">
            <h2>Detalles de la Propiedad</h2>
            <div className="property-details">
              <div className="detail-row">
                <strong>Nombre:</strong>
                <span>{viewingProperty.nombre}</span>
              </div>
              <div className="detail-row">
                <strong>Dirección:</strong>
                <span>{viewingProperty.direccion}</span>
              </div>
              <div className="detail-row">
                <strong>Descripción:</strong>
                <span>{viewingProperty.descripcion}</span>
              </div>
              <div className="detail-row">
                <strong>Estado:</strong>
                <span>{viewingProperty.rentado ? 'Rentado' : 'Disponible'}</span>
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setViewingProperty(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="properties-table-container">
        <div className="table-controls">
          <div className="search-container">
            <span className="search-icon-emoji">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter-button" aria-label="Filtros">
            <span className="filter-icon">⋮</span>
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="empty-state">
            <p>No hay propiedades registradas</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron propiedades que coincidan con la búsqueda</p>
          </div>
        ) : (
          <table className="properties-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    aria-label="Seleccionar todas las propiedades"
                  />
                </th>
                <th className="sortable">
                  Nombre
                  <span className="sort-icon">⬇️</span>
                </th>
                <th className="sortable">
                  Dirección
                  <span className="sort-icon">⬇️</span>
                </th>
                <th>Descripción</th>
                <th className="actions-column">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handleSelectProperty(property.id)}
                      aria-label={`Seleccionar ${property.nombre}`}
                    />
                  </td>
                  <td>{truncateText(property.nombre, 25)}</td>
                  <td>{truncateText(property.direccion, 25)}</td>
                  <td>{truncateText(property.descripcion, 35)}</td>
                  <td className="actions-column">
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleView(property)}
                        aria-label={`Ver ${property.nombre}`}
                        title="Ver"
                      >
                        <span className="action-icon">👁️</span>
                        <span>Ver</span>
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(property)}
                        aria-label={`Editar ${property.nombre}`}
                        title="Editar"
                      >
                        <span className="action-icon">✏️</span>
                        <span>Editar</span>
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(property.id)}
                        aria-label={`Borrar ${property.nombre}`}
                        title="Borrar"
                      >
                        <span className="action-icon">🗑️</span>
                        <span>Borrar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Properties;
