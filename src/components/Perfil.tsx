// import React, { useState, useEffect } from 'react';
// import { apiService } from '../services/api';
// import { PerfilData, PerfilFormData } from '../types';
// import './Perfil.css';

// const Perfil: React.FC = () => {
//   const [perfiles, setPerfiles] = useState<PerfilData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editingPerfil, setEditingPerfil] = useState<PerfilData | null>(null);
//   const [formData, setFormData] = useState<PerfilFormData>({
//     nombre: '',
//     email: '',
//     telefono: '',
//     direccion: '',
//     rol: ''
//   });

//   useEffect(() => {
//     loadPerfiles();
//   }, []);

//   const loadPerfiles = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await apiService.getPerfil(0, 100, '');
//       if (response.success && response.data) {
//         setPerfiles(response.data.items);
//       }
//     } catch (err) {
//       setError('Error al cargar los perfiles');
//       console.error('Error loading perfiles:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       if (editingPerfil) {
//         await apiService.updatePerfil(editingPerfil.id, formData);
//       } else {
//         await apiService.createPerfil(formData);
//       }
//       await loadPerfiles();
//       setShowForm(false);
//       setEditingPerfil(null);
//       resetForm();
//     } catch (err) {
//       setError('Error al guardar el perfil');
//       console.error('Error saving perfil:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (perfil: PerfilData) => {
//     setEditingPerfil(perfil);
//     setFormData({
//       nombre: perfil.nombre,
//       email: perfil.email,
//       telefono: perfil.telefono,
//       direccion: perfil.direccion,
//       rol: perfil.rol
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (window.confirm('¿Estás seguro de que quieres eliminar este perfil?')) {
//       try {
//         setLoading(true);
//         await apiService.deletePerfil(id);
//         await loadPerfiles();
//       } catch (err) {
//         setError('Error al eliminar el perfil');
//         console.error('Error deleting perfil:', err);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       nombre: '',
//       email: '',
//       telefono: '',
//       direccion: '',
//       rol: ''
//     });
//   };

//   const handleCancel = () => {
//     setShowForm(false);
//     setEditingPerfil(null);
//     resetForm();
//   };

//   if (loading) {
//     return (
//       <div className="perfil">
//         <div className="loading">Cargando perfiles...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="perfil">
//       <div className="perfil-header">
//         <h1>Perfil</h1>
//         <button 
//           className="btn btn-primary" 
//           onClick={() => setShowForm(true)}
//         >
//           Nuevo Perfil
//         </button>
//       </div>

//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}

//       {showForm && (
//         <div className="form-modal">
//           <div className="form-content">
//             <h2>{editingPerfil ? 'Editar Perfil' : 'Nuevo Perfil'}</h2>
//             <form onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label>Nombre:</label>
//                 <input
//                   type="text"
//                   value={formData.nombre}
//                   onChange={(e) => setFormData({...formData, nombre: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Email:</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Teléfono:</label>
//                 <input
//                   type="text"
//                   value={formData.telefono}
//                   onChange={(e) => setFormData({...formData, telefono: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Dirección:</label>
//                 <input
//                   type="text"
//                   value={formData.direccion}
//                   onChange={(e) => setFormData({...formData, direccion: e.target.value})}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Rol:</label>
//                 <select
//                   value={formData.rol}
//                   onChange={(e) => setFormData({...formData, rol: e.target.value})}
//                   required
//                 >
//                   <option value="">Seleccionar rol</option>
//                   <option value="Administrador">Administrador</option>
//                   <option value="Usuario">Usuario</option>
//                   <option value="Invitado">Invitado</option>
//                 </select>
//               </div>
//               <div className="form-actions">
//                 <button type="submit" className="btn btn-primary">
//                   {editingPerfil ? 'Actualizar' : 'Crear'}
//                 </button>
//                 <button type="button" className="btn btn-secondary" onClick={handleCancel}>
//                   Cancelar
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       <div className="perfil-list">
//         {perfiles.length === 0 ? (
//           <div className="empty-state">
//             <p>No hay perfiles registrados</p>
//           </div>
//         ) : (
//           perfiles.map((perfil) => (
//             <div key={perfil.id} className="perfil-card">
//               <div className="perfil-content">
//                 <h3>{perfil.nombre}</h3>
//                 <p><strong>Email:</strong> {perfil.email}</p>
//                 <p><strong>Teléfono:</strong> {perfil.telefono}</p>
//                 <p><strong>Dirección:</strong> {perfil.direccion}</p>
//                 <p><strong>Rol:</strong> {perfil.rol}</p>
//               </div>
//               <div className="perfil-actions">
//                 <button 
//                   className="btn btn-sm btn-secondary"
//                   onClick={() => handleEdit(perfil)}
//                 >
//                   Editar
//                 </button>
//                 <button 
//                   className="btn btn-sm btn-danger"
//                   onClick={() => handleDelete(perfil.id)}
//                 >
//                   Eliminar
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Perfil;

export {};