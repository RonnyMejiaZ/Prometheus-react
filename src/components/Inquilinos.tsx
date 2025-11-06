import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Inquilino, InquilinoFormData } from '../types';
import './Inquilinos.css';

const Inquilinos: React.FC = () => {
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInquilino, setEditingInquilino] = useState<Inquilino | null>(null);
  const [formData, setFormData] = useState<InquilinoFormData>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    documento: ''
  });

  useEffect(() => {
    loadInquilinos();
  }, []);

  const loadInquilinos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getInquilinos(0, 100, '');
      if (response.success && response.data) {
        setInquilinos(response.data.items);
      }
    } catch (err) {
      setError('Error al cargar los inquilinos');
      console.error('Error loading inquilinos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingInquilino) {
        await apiService.updateInquilino(editingInquilino.id, formData);
      } else {
        await apiService.createInquilino(formData);
      }
      await loadInquilinos();
      setShowForm(false);
      setEditingInquilino(null);
      resetForm();
    } catch (err) {
      setError('Error al guardar el inquilino');
      console.error('Error saving inquilino:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (inquilino: Inquilino) => {
    setEditingInquilino(inquilino);
    setFormData({
      nombre: inquilino.nombre,
      email: inquilino.email,
      telefono: inquilino.telefono,
      direccion: inquilino.direccion,
      documento: inquilino.documento || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este inquilino?')) {
      try {
        setLoading(true);
        await apiService.deleteInquilino(id);
        await loadInquilinos();
      } catch (err) {
        setError('Error al eliminar el inquilino');
        console.error('Error deleting inquilino:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      documento: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInquilino(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="inquilinos">
        <div className="loading">Cargando inquilinos...</div>
      </div>
    );
  }

  return (
    <div className="inquilinos">
      <div className="inquilinos-header">
        <h1>Inquilinos</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Nuevo Inquilino
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
            <h2>{editingInquilino ? 'Editar Inquilino' : 'Nuevo Inquilino'}</h2>
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
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
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
                <label>Documento:</label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => setFormData({...formData, documento: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingInquilino ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="inquilinos-list">
        {inquilinos.length === 0 ? (
          <div className="empty-state">
            <p>No hay inquilinos registrados</p>
          </div>
        ) : (
          inquilinos.map((inquilino) => (
            <div key={inquilino.id} className="inquilino-card">
              <div className="inquilino-content">
                <h3>{inquilino.nombre}</h3>
                <p><strong>Email:</strong> {inquilino.email}</p>
                <p><strong>Teléfono:</strong> {inquilino.telefono}</p>
                <p><strong>Dirección:</strong> {inquilino.direccion}</p>
                {inquilino.documento && (
                  <p><strong>Documento:</strong> {inquilino.documento}</p>
                )}
              </div>
              <div className="inquilino-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(inquilino)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(inquilino.id)}
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

export default Inquilinos;
