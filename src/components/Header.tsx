import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isCollapsed, toggleMobile } = useNavigation();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className={`app-header ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="header-left">
        <button 
          className="header-menu-button mobile-only" 
          onClick={toggleMobile} 
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="header-back-button desktop-only" onClick={handleBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L3 12L9 6M3 12H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
