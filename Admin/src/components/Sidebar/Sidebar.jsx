import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Sidebar">
        <div className="sidebar__inner">
          <div className="sidebar-header">
            <h2>Admin</h2>
            <button className="sidebar-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <nav className="sidebar-options" role="navigation">
            <NavLink to="/admin" end className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">📊</div>
              <p>{t('nav.dashboard')}</p>
            </NavLink>

            <NavLink to="/admin/orders" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">📦</div>
              <p>{t('nav.orders')}</p>
            </NavLink>

            <NavLink to="/admin/category" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">🏷️</div>
              <p>{t('nav.categories')}</p>
            </NavLink>

            <NavLink to="/admin/products" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">🍽️</div>
              <p>{t('nav.products')}</p>
            </NavLink>

            <NavLink to="/admin/reservations" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">📅</div>
              <p>Reservations</p>
            </NavLink>

            <NavLink to="/admin/messages" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">💬</div>
              <p>Messages</p>
            </NavLink>

            <NavLink to="/admin/users" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">👥</div>
              <p>{t('nav.users')}</p>
            </NavLink>

            <NavLink to="/admin/permissions" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">🔐</div>
              <p>{t('nav.permissions')}</p>
            </NavLink>

            <NavLink to="/admin/blog" className="sidebar-option" onClick={onClose}>
              <div className="sidebar-icon">📝</div>
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
