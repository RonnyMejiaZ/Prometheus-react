import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Alquiler, AlquilerFormData, Property, Inquilino } from '../types';
import './Alquileres.css';

const Alquileres: React.FC = () => {
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAlquiler, setEditingAlquiler] = useState<Alquiler | null>(null);
  const [formData, setFormData] = useState<AlquilerFormData>({
    propiedadId: 0,
    inquilinoId: 0,
    fechaInicio: '',
    fechaFin: '',
    montoMensual: 0,
    activo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [alquileresRes, propertiesRes, inquilinosRes] = await Promise.all([
        apiService.getAlquileres(0, 100, ''),
        apiService.getProperties(0, 100, ''),
        apiService.getInquilinos(0, 100, '')
      ]);

      if (alquileresRes.success && alquileresRes.data) {
        setAlquileres(alquileresRes.data.items);
      }
      if (propertiesRes.success && propertiesRes.data) {
        setProperties(propertiesRes.data.items);
      }
      if (inquilinosRes.success && inquilinosRes.data) {
        setInquilinos(inquilinosRes.data.items);
      }
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingAlquiler) {
        await apiService.updateAlquiler(editingAlquiler.id, formData);
      } else {
        await apiService.createAlquiler(formData);
      }
      await loadData();
      setShowForm(false);
      setEditingAlquiler(null);
      resetForm();
    } catch (err) {
      setError('Error al guardar el alquiler');
      console.error('Error saving alquiler:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alquiler: Alquiler) => {
    setEditingAlquiler(alquiler);
    setFormData({
      propiedadId: alquiler.propiedadId,
      inquilinoId: alquiler.inquilinoId,
      fechaInicio: alquiler.fechaInicio,
      fechaFin: alquiler.fechaFin,
      montoMensual: alquiler.montoMensual,
      activo: alquiler.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este alquiler?')) {
      try {
        setLoading(true);
        await apiService.deleteAlquiler(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar el alquiler');
        console.error('Error deleting alquiler:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      propiedadId: 0,
      inquilinoId: 0,
      fechaInicio: '',
      fechaFin: '',
      montoMensual: 0,
      activo: true
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAlquiler(null);
    resetForm();
  };

  const getPropertyName = (id: number) => {
    const property = properties.find(p => p.id === id);
    return property ? property.nombre : 'Propiedad no encontrada';
  };

  const getInquilinoName = (id: number) => {
    const inquilino = inquilinos.find(i => i.id === id);
    return inquilino ? inquilino.nombre : 'Inquilino no encontrado';
  };

  if (loading) {
    return (
      <div className="alquileres">
        <div className="loading">Cargando alquileres...</div>
      </div>
    );
  }

  return (
    <div className="alquileres">
      <div className="alquileres-header">
        <h1>Alquileres</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Nuevo Alquiler
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
            <h2>{editingAlquiler ? 'Editar Alquiler' : 'Nuevo Alquiler'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Propiedad:</label>
                <select
                  value={formData.propiedadId}
                  onChange={(e) => setFormData({...formData, propiedadId: parseInt(e.target.value)})}
                  required
                >
                  <option value={0}>Seleccionar propiedad</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Inquilino:</label>
                <select
                  value={formData.inquilinoId}
                  onChange={(e) => setFormData({...formData, inquilinoId: parseInt(e.target.value)})}
                  required
                >
                  <option value={0}>Seleccionar inquilino</option>
                  {inquilinos.map(inquilino => (
                    <option key={inquilino.id} value={inquilino.id}>
                      {inquilino.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Inicio:</label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin:</label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Monto Mensual:</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.montoMensual}
                  onChange={(e) => setFormData({...formData, montoMensual: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  Activo
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingAlquiler ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="alquileres-list">
        {alquileres.length === 0 ? (
          <div className="empty-state">
            <p>No hay alquileres registrados</p>
          </div>
        ) : (
          alquileres.map((alquiler) => (
            <div key={alquiler.id} className="alquiler-card">
              <div className="alquiler-content">
                <h3>Alquiler #{alquiler.id}</h3>
                <p><strong>Propiedad:</strong> {getPropertyName(alquiler.propiedadId)}</p>
                <p><strong>Inquilino:</strong> {getInquilinoName(alquiler.inquilinoId)}</p>
                <p><strong>Fecha Inicio:</strong> {new Date(alquiler.fechaInicio).toLocaleDateString()}</p>
                <p><strong>Fecha Fin:</strong> {new Date(alquiler.fechaFin).toLocaleDateString()}</p>
                <p><strong>Monto Mensual:</strong> ${alquiler.montoMensual.toFixed(2)}</p>
                <p><strong>Estado:</strong> {alquiler.activo ? 'Activo' : 'Inactivo'}</p>
              </div>
              <div className="alquiler-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(alquiler)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(alquiler.id)}
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

export default Alquileres;
