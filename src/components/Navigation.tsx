import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [adminExpanded, setAdminExpanded] = useState(true);
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useNavigation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isDashboardActive = location.pathname === '/dashboard';
  const isPropiedadesActive = location.pathname === '/propiedades';

  const handleLinkClick = () => {
    if (window.innerWidth <= 640) {
      closeMobile();
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeMobile}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
        />
      )}
      <nav className={`navigation ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="nav-header">
        <h1 className="nav-logo">Prometheus</h1>
        <button 
          className="nav-collapse-btn"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={isCollapsed ? "M6 12L10 8L6 4" : "M10 12L6 8L10 4"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="nav-container">
        <div className="nav-section">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isDashboardActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                  <path d="M3 10L10 3L17 10M3 10L10 13L17 10M3 10V17H17V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {!isCollapsed && <span>Escritorio</span>}
          </Link>
        </div>

        <div className="nav-section">
          {!isCollapsed && (
            <button 
              className="nav-section-header"
              onClick={() => setAdminExpanded(!adminExpanded)}
            >
              <span>Administración</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`nav-chevron ${adminExpanded ? 'expanded' : ''}`}
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          {adminExpanded && (
            <div className="nav-submenu">
              <Link 
                to="/propiedades" 
                className={`nav-link ${isPropiedadesActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                {isPropiedadesActive ? (
                  <div className="nav-icon-box">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                      <rect x="3" y="4" width="5" height="4" rx="0.5" stroke="#ffa500" strokeWidth="1.5" fill="none"/>
                      <rect x="3" y="9" width="5" height="4" rx="0.5" stroke="#ffa500" strokeWidth="1.5" fill="none"/>
                      <rect x="3" y="14" width="5" height="4" rx="0.5" stroke="#ffa500" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                    <path d="M3 6L10 2L17 6M3 6V16L10 20L17 16V6M3 6L10 10L17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {!isCollapsed && <span>Propiedades</span>}
              </Link>
              <Link 
                to="/inquilinos" 
                className={`nav-link ${isActive('/inquilinos') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                  <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0 20C0 15.5817 4.47715 12 10 12C15.5228 12 20 15.5817 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {!isCollapsed && <span>Inquilinos</span>}
              </Link>
              <Link 
                to="/alquileres" 
                className={`nav-link ${isActive('/alquileres') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                  <path d="M2 4H18V18H2V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 2V6M14 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {!isCollapsed && <span>Alquileres</span>}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navigation;
