import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { apiService } from './services/api';
import './App.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Properties from './components/Properties';
import Inquilinos from './components/Inquilinos';
import Alquileres from './components/Alquileres';
import Pagos from './components/Pagos';
import Perfil from './components/Perfil';
import Navigation from './components/Navigation';
import Header from './components/Header';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = apiService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = apiService.isAuthenticated();
  const location = useLocation();
  
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navigation />
      <Header />
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

function App() {
  useEffect(() => {
    // Verificar si hay un usuario autenticado
    const user = apiService.getCurrentUser();
    if (user) {
      // El usuario ya está en localStorage, no necesitamos hacer nada más
      // ya que la autenticación se maneja con sesiones HTTP (cookies)
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Navigate to="/dashboard" replace />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/propiedades" element={
            <ProtectedRoute>
              <AppLayout>
                <Properties />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/inquilinos" element={
            <ProtectedRoute>
              <AppLayout>
                <Inquilinos />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/alquileres" element={
            <ProtectedRoute>
              <AppLayout>
                <Alquileres />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/pagos" element={
            <ProtectedRoute>
              <AppLayout>
                <Pagos />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <AppLayout>
                <Perfil />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
