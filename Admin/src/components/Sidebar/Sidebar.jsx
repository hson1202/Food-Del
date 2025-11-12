import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      ></div>
      
      <aside
        id="admin-sidebar"
        className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
        aria-label="Sidebar navigation"
      >
        <div className="sidebar__inner">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
            <button 
              className="sidebar-close" 
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar (ESC)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <nav className="sidebar-options" role="navigation">
            <NavLink to="/admin" end className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <p>{t('nav.dashboard')}</p>
            </NavLink>

            <NavLink to="/admin/orders" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v12z"/>
                </svg>
              </div>
              <p>{t('nav.orders')}</p>
            </NavLink>

            <NavLink to="/admin/category" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 6h-4V5h4v4zm-9 4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6H5v-4h4v4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-4v-4h4v4z"/>
                </svg>
              </div>
              <p>{t('nav.categories')}</p>
            </NavLink>

            <NavLink to="/admin/products" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p>{t('nav.products')}</p>
            </NavLink>

            <NavLink to="/admin/reservations" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <p>Reservations</p>
            </NavLink>

            <NavLink to="/admin/messages" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <p>Messages</p>
            </NavLink>

            <NavLink to="/admin/email-test" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <p>Email Test</p>
            </NavLink>

            <NavLink to="/admin/users" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 3c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm6 5H6v-.99c.2-.72 3.3-2.01 6-2.01s5.8 1.29 6 2v1z"/>
                </svg>
              </div>
              <p>{t('nav.users')}</p>
            </NavLink>

            <NavLink to="/admin/permissions" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <p>{t('nav.permissions')}</p>
            </NavLink>

            <NavLink to="/admin/blog" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
              <p>{t('nav.blog')}</p>
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <span>© {new Date().getFullYear()} Viet Bowls</span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
