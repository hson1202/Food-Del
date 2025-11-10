import React, { useState, useEffect } from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../../i18n'

const Navbar = ({ setIsAuthenticated, onMenuToggle, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return (
    <div className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-left">
          <button 
            className={`hamburger-menu ${isSidebarOpen ? 'active' : ''}`}
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            aria-expanded={isSidebarOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="navbar-logo">
            <h1>Viet Bowls</h1>
          </div>
        </div>
        <div className="navbar-right">
          <LanguageSwitcher />
          <div className="profile-section">
            <img className='profile' src={assets.profile_image} alt="" />
            <button onClick={handleLogout} className="logout-btn">
              🚪 {t('nav.logout')}
            </button>
          </div>
        </div>
    </div>
  )
}

export default Navbar