import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './Reservations.css'
import config from '../../config/config'

const Reservations = ({ url }) => {
  const { t } = useTranslation()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${config.BACKEND_URL}/api/reservation`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(t('reservations.errors.failedToFetch'))
      }

      const data = await response.json()
      setReservations(data.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (id, status, adminNote = '') => {
    try {
      setUpdatingStatus(true)
      const token = localStorage.getItem('adminToken')
      
      const requestBody = { status, adminNote }
      
      const response = await fetch(`${config.BACKEND_URL}/api/reservation/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(t('reservations.errors.failedToUpdate'))
      }

      const result = await response.json()
      if (result.success) {
        setReservations(prev => 
          prev.map(res => 
            res._id === id 
              ? { 
                  ...res, 
                  status, 
                  adminNote, 
                  completedAt: status === 'completed' ? new Date() : (status === 'pending' ? null : res.completedAt),
                  completedBy: status === 'completed' ? 'Admin' : (status === 'pending' ? null : res.completedBy)
                }
              : res
          )
        )
        setShowModal(false)
        setSelectedReservation(null)
        showNotification(t('reservations.messages.statusUpdatedSuccess'), 'success')
      }
    } catch (err) {
      console.error('Error updating reservation:', err)
      showNotification(t('reservations.errors.updateError') + ': ' + err.message, 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const deleteReservation = async (id) => {
    if (!window.confirm(t('reservations.confirmations.deleteReservation'))) {
      return
    }

    try {
      setDeletingId(id)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${config.BACKEND_URL}/api/reservation/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(t('reservations.errors.failedToDelete'))
      }

      setReservations(prev => prev.filter(res => res._id !== id))
      showNotification(t('reservations.messages.deletedSuccess'), 'success')
    } catch (err) {
      console.error('Error deleting reservation:', err)
      showNotification(t('reservations.errors.deleteError') + ': ' + err.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const openModal = (reservation) => {
    setSelectedReservation(reservation)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReservation(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'
      case 'completed': return '#28a745'
      case 'cancelled': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return t('reservations.status.pending')
      case 'completed': return t('reservations.status.completed')
      case 'cancelled': return t('reservations.status.cancelled')
      default: return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'completed': return '✅'
      case 'cancelled': return '❌'
      default: return '📋'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const dayName = days[date.getDay()]
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${dayName}, ${day}/${month}/${year}`
  }

  const formatTime = (timeString) => {
    return timeString
  }

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `
    
    if (type === 'success') {
      notification.style.background = '#28a745'
    } else if (type === 'error') {
      notification.style.background = '#dc3545'
    } else {
      notification.style.background = '#007bff'
    }
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus
    const matchesSearch = 
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm)
    
    return matchesStatus && matchesSearch
  })

  // CSS animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('reservations.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>{t('reservations.errors.loadingError')}</h3>
        <p>{error}</p>
        <button onClick={fetchReservations} className="retry-btn">
          {t('reservations.actions.tryAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="reservations-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="header-content">
          <h1>{t('reservations.pageTitle')}</h1>
          <p>{t('reservations.pageDescription')}</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchReservations}>
            <span>🔄</span> {t('common.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="stats-row">
        <div className="stat-card stat-total">
          <span className="stat-icon">📋</span>
          <div className="stat-body">
            <span className="stat-number">{reservations.length}</span>
            <span className="stat-label">{t('reservations.stats.total')}</span>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <span className="stat-icon">⏳</span>
          <div className="stat-body">
            <span className="stat-number">{reservations.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">{t('reservations.stats.pending')}</span>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <span className="stat-icon">✅</span>
          <div className="stat-body">
            <span className="stat-number">{reservations.filter(r => r.status === 'completed').length}</span>
            <span className="stat-label">{t('reservations.stats.completed')}</span>
          </div>
        </div>
        <div className="stat-card stat-cancelled">
          <span className="stat-icon">❌</span>
          <div className="stat-body">
            <span className="stat-number">{reservations.filter(r => r.status === 'cancelled').length}</span>
            <span className="stat-label">{t('reservations.stats.cancelled')}</span>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('reservations.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="status-filter">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">{t('reservations.filters.allStatus')}</option>
              <option value="pending">{t('reservations.filters.pending')}</option>
              <option value="completed">{t('reservations.filters.completed')}</option>
              <option value="cancelled">{t('reservations.filters.cancelled')}</option>
            </select>
          </div>

          <div className="date-filters">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              placeholder={t('reservations.filters.startDate')}
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              placeholder={t('reservations.filters.endDate')}
            />
            <button 
              className="filter-btn"
              onClick={() => {
                if (dateRange.startDate && dateRange.endDate) {
                  console.log('Filter by date range:', dateRange)
                }
              }}
            >
              {t('reservations.filters.filterByDate')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Reservation Cards Grid ── */}
      <div className="reservations-grid">
        {filteredReservations.map((reservation) => (
          <div
            className={`reservation-card reservation-card--${reservation.status}`}
            key={reservation._id}
          >
            {/* Card Top: Status + ID */}
            <div className="card-top">
              <span className={`card-status-badge ${reservation.status}`}>
                {getStatusIcon(reservation.status)} {getStatusText(reservation.status)}
              </span>
              <span className="card-id">#{reservation._id.slice(-6).toUpperCase()}</span>
            </div>

            {/* Card Header: Customer name */}
            <div className="card-header">
              <h3 className="card-customer-name">
                {reservation.customerName}
                {reservation.note && (
                  <span className="note-indicator" title={reservation.note}>📝</span>
                )}
              </h3>
            </div>

            {/* Card Body: Key info */}
            <div className="card-body">
              <div className="card-info-row">
                <span className="card-info-icon">📅</span>
                <span className="card-info-text">{formatDate(reservation.reservationDate)}</span>
              </div>
              <div className="card-info-row">
                <span className="card-info-icon">🕐</span>
                <span className="card-info-text card-info-time">{formatTime(reservation.reservationTime)}</span>
              </div>
              <div className="card-info-row">
                <span className="card-info-icon">👥</span>
                <span className="card-info-text">
                  <strong>{reservation.numberOfPeople}</strong> {t('reservations.modal.people') || 'khách'}
                </span>
              </div>
              <div className="card-info-row">
                <span className="card-info-icon">📞</span>
                <span className="card-info-text">{reservation.phone}</span>
              </div>
              <div className="card-info-row">
                <span className="card-info-icon">✉️</span>
                <span className="card-info-text card-info-email">{reservation.email}</span>
              </div>
            </div>

            {/* Card Footer: Actions */}
            <div className="card-footer">
              <button 
                className="card-btn card-btn-view"
                onClick={() => openModal(reservation)}
              >
                {t('reservations.actions.view')}
              </button>
              <button 
                className={`card-btn card-btn-delete ${deletingId === reservation._id ? 'deleting' : ''}`}
                onClick={() => deleteReservation(reservation._id)}
                disabled={deletingId === reservation._id}
              >
                {deletingId === reservation._id ? t('reservations.actions.deleting') : t('reservations.actions.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="no-reservations">
          <div className="no-data-icon">📅</div>
          <p>{t('reservations.noReservationsFound')}</p>
          {searchTerm || filterStatus !== 'all' ? (
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="clear-filters-btn"
            >
              {t('reservations.clearFilters')}
            </button>
          ) : null}
        </div>
      )}

      {/* ── Reservation Detail Modal (Simplified Basic Version) ── */}
      {showModal && selectedReservation && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h2>{t('reservations.modal.detailTitle')}</h2>
                <div className="modal-meta">
                  <span className="booking-id-simple">#{selectedReservation._id.slice(-6).toUpperCase()}</span>
                  <span className={`modal-status-badge-simple ${selectedReservation.status}`}>
                    {getStatusText(selectedReservation.status)}
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info-grid">
                {/* Information Block */}
                <div className="info-block">
                  <h3>{t('reservations.modal.customerInfoTitle')}</h3>
                  <div className="info-row-simple">
                    <span className="info-label">{t('reservations.modal.customerName')}:</span>
                    <span className="info-value"><strong>{selectedReservation.customerName}</strong></span>
                  </div>
                  <div className="info-row-simple">
                    <span className="info-label">{t('reservations.modal.phone')}:</span>
                    <span className="info-value">{selectedReservation.phone}</span>
                  </div>
                  <div className="info-row-simple">
                    <span className="info-label">{t('reservations.modal.email')}:</span>
                    <span className="info-value">{selectedReservation.email}</span>
                  </div>
                </div>

                <div className="info-block">
                  <h3>{t('reservations.modal.reservationInfoTitle')}</h3>
                  <div className="info-row-simple">
                    <span className="info-label">{t('reservations.table.dateTime')}:</span>
                    <span className="info-value"><strong>{formatDate(selectedReservation.reservationDate)} - {formatTime(selectedReservation.reservationTime)}</strong></span>
                  </div>
                  <div className="info-row-simple">
                    <span className="info-label">{t('reservations.modal.numberOfGuests')}:</span>
                    <span className="info-value">{selectedReservation.numberOfPeople} {t('reservations.modal.people')}</span>
                  </div>
                  <div className="info-row-simple">
                    <span className="info-label">{t('reservations.modal.createdAt')}:</span>
                    <span className="info-value">{formatDate(selectedReservation.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedReservation.note && (
                <div className="notes-box-simple">
                  <strong>{t('reservations.modal.notesTitle')}:</strong> {selectedReservation.note}
                </div>
              )}

              {/* Status Management for Admin */}
              <div className="status-actions-simple">
                <h3>{t('reservations.modal.statusManagementTitle')}</h3>
                <div className="status-controls">
                  <select 
                    value={selectedReservation.status}
                    onChange={(e) => {
                      setSelectedReservation({
                        ...selectedReservation,
                        status: e.target.value
                      })
                    }}
                    className="basic-select"
                  >
                    <option value="pending">{t('reservations.modal.pending')}</option>
                    <option value="completed">{t('reservations.modal.completed')}</option>
                    <option value="cancelled">{t('reservations.modal.cancelled')}</option>
                  </select>
                  
                  <textarea
                    placeholder={t('reservations.modal.adminNotePlaceholder')}
                    value={selectedReservation.adminNote || ''}
                    onChange={(e) => {
                      setSelectedReservation({
                        ...selectedReservation,
                        adminNote: e.target.value
                      })
                    }}
                    rows="2"
                    className="basic-textarea"
                  />
                </div>
                
                <div className="modal-action-buttons">
                  <button className="modal-btn modal-btn-secondary" onClick={() => window.print()}>
                    {t('reservations.modal.printDetails')}
                  </button>
                  <button className="modal-btn modal-btn-danger" onClick={() => {
                    if (window.confirm(t('reservations.modal.confirmCancel'))) {
                      updateReservationStatus(selectedReservation._id, 'cancelled', t('reservations.modal.cancelledByAdmin'))
                    }
                  }}>
                    {t('reservations.modal.cancel')}
                  </button>
                  <button 
                    className={`btn-update-simple ${updatingStatus ? 'updating' : ''}`}
                    onClick={() => updateReservationStatus(
                      selectedReservation._id,
                      selectedReservation.status,
                      selectedReservation.adminNote
                    )}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? t('reservations.modal.updating') : t('reservations.modal.updateStatus')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservations
