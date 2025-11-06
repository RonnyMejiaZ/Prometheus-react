import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Pago, PagoFormData, Alquiler } from '../types';
import './Pagos.css';

const Pagos: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [alquileres, setAlquileres] = useState<Alquiler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
  const [formData, setFormData] = useState<PagoFormData>({
    alquilerId: 0,
    monto: 0,
    fechaPago: '',
    metodoPago: '',
    estado: 'Pagado'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pagosRes, alquileresRes] = await Promise.all([
        apiService.getPagos(0, 100, ''),
        apiService.getAlquileres(0, 100, '')
      ]);

      if (pagosRes.success && pagosRes.data) {
        setPagos(pagosRes.data.items);
      }
      if (alquileresRes.success && alquileresRes.data) {
        setAlquileres(alquileresRes.data.items);
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
      if (editingPago) {
        await apiService.updatePago(editingPago.id, formData);
      } else {
        await apiService.createPago(formData);
      }
      await loadData();
      setShowForm(false);
      setEditingPago(null);
      resetForm();
    } catch (err) {
      setError('Error al guardar el pago');
      console.error('Error saving pago:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pago: Pago) => {
    setEditingPago(pago);
    setFormData({
      alquilerId: pago.alquilerId,
      monto: pago.monto,
      fechaPago: pago.fechaPago,
      metodoPago: pago.metodoPago,
      estado: pago.estado
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      try {
        setLoading(true);
        await apiService.deletePago(id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar el pago');
        console.error('Error deleting pago:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      alquilerId: 0,
      monto: 0,
      fechaPago: '',
      metodoPago: '',
      estado: 'Pagado'
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPago(null);
    resetForm();
  };

  const getAlquilerInfo = (id: number) => {
    const alquiler = alquileres.find(a => a.id === id);
    return alquiler ? `Alquiler #${alquiler.id}` : 'Alquiler no encontrado';
  };

  if (loading) {
    return (
      <div className="pagos">
        <div className="loading">Cargando pagos...</div>
      </div>
    );
  }

  return (
    <div className="pagos">
      <div className="pagos-header">
        <h1>Pagos</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Nuevo Pago
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
            <h2>{editingPago ? 'Editar Pago' : 'Nuevo Pago'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Alquiler:</label>
                <select
                  value={formData.alquilerId}
                  onChange={(e) => setFormData({...formData, alquilerId: parseInt(e.target.value)})}
                  required
                >
                  <option value={0}>Seleccionar alquiler</option>
                  {alquileres.map(alquiler => (
                    <option key={alquiler.id} value={alquiler.id}>
                      Alquiler #{alquiler.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Monto:</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Pago:</label>
                <input
                  type="date"
                  value={formData.fechaPago}
                  onChange={(e) => setFormData({...formData, fechaPago: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Método de Pago:</label>
                <select
                  value={formData.metodoPago}
                  onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
                  required
                >
                  <option value="">Seleccionar método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  required
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingPago ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="pagos-list">
        {pagos.length === 0 ? (
          <div className="empty-state">
            <p>No hay pagos registrados</p>
          </div>
        ) : (
          pagos.map((pago) => (
            <div key={pago.id} className="pago-card">
              <div className="pago-content">
                <h3>Pago #{pago.id}</h3>
                <p><strong>Alquiler:</strong> {getAlquilerInfo(pago.alquilerId)}</p>
                <p><strong>Monto:</strong> ${pago.monto.toFixed(2)}</p>
                <p><strong>Fecha de Pago:</strong> {new Date(pago.fechaPago).toLocaleDateString()}</p>
                <p><strong>Método:</strong> {pago.metodoPago}</p>
                <p><strong>Estado:</strong> {pago.estado}</p>
              </div>
              <div className="pago-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(pago)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(pago.id)}
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

export default Pagos;
