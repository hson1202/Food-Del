import React from 'react';
import './SuccessPopup.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../i18n';

const SuccessPopup = ({ isOpen, onClose, trackingCode, phone, orderAmount, setCartItems, items }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Format price to avoid floating point precision issues
  const formatPrice = (price) => {
    const n = Number(price);
    if (isNaN(n) || n < 0) return '€0';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
    return formatted.replace(/\.00$/, '');
  };

  // Lấy items từ props hoặc từ localStorage (fallback)
  let lastItems = Array.isArray(items) && items.length > 0 ? items : [];
  if (lastItems.length === 0) {
    try {
      const raw = localStorage.getItem('lastOrderItems');
      if (raw) {
        lastItems = JSON.parse(raw) || [];
      }
    } catch (_) {}
  }

  const handleClose = () => {
    // Xóa cart khi đóng popup
    if (setCartItems) {
      setCartItems({});
    }
    onClose();
  };

  const handleGoHome = () => {
    handleClose();
    navigate('/');
  };

  const handleTrackOrder = () => {
    handleClose();
    navigate('/track-order');
  };

  return (
    <div className="success-popup-overlay" onClick={handleClose}>
      <div className="success-popup" onClick={(e) => e.stopPropagation()}>
        <div className="success-popup-content">
          {/* Success Icon */}
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
              <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="success-title">🎉 {t('successPopup.title')}</h2>
          <p className="success-message">{t('successPopup.message')}</p>

          {/* Delivery Time */}
          <div className="delivery-time">
            <div className="delivery-icon">🚚</div>
            <div className="delivery-text">
              <p className="delivery-title">{t('successPopup.delivery.title')}</p>
              <p className="delivery-time-text">{t('successPopup.delivery.time')}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="order-details">
            <div className="detail-item">
              <span className="detail-label">📋 {t('successPopup.trackingCode')}:</span>
              <span className="detail-value">{trackingCode}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">📱 {t('successPopup.phone')}:</span>
              <span className="detail-value">{phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">💰 {t('successPopup.amount')}:</span>
              <span className="detail-value">{formatPrice(orderAmount)}</span>
            </div>
          </div>

          {/* Items Summary */}
          {lastItems && lastItems.length > 0 && (
            <div className="order-items-summary">
              <h3>{t('successPopup.items')}</h3>
              <div className="items-list">
                {lastItems.map((it, idx) => (
                  <div key={idx} className="item-row">
                    <div className="item-main">
                      <span className="item-name">{it.name || 'Item'}</span>
                    </div>
                    <div className="item-meta">
                      <span className="item-qty">x{it.quantity || 1}</span>
                      <span className="item-price">{formatPrice((it.price || 0) * (it.quantity || 1))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="success-actions">
            <button className="btn-track" onClick={handleTrackOrder}>
              🔍 {t('successPopup.trackOrder')}
            </button>
            <button className="btn-home" onClick={handleGoHome}>
              🏠 {t('successPopup.goHome')}
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
