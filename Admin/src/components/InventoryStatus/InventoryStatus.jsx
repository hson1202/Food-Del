import React from 'react';
import './InventoryStatus.css';
import { useTranslation } from 'react-i18next';

const InventoryStatus = ({ quantity, threshold = 5 }) => {
  const { t } = useTranslation();

  const getStatusClass = () => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= threshold) return 'low-stock';
    return 'in-stock';
  };

  const getStatusIcon = () => {
    if (quantity === 0) return '🚫';
    if (quantity <= threshold) return '⚠️';
    return '✅';
  };

  const getStatusText = () => {
    if (quantity === 0) return t('inv.outOfStock');
    if (quantity <= threshold) return t('inv.lowStock');
    return t('inv.inStock');
  };

  const getProgressBarColor = () => {
    if (quantity === 0) return '#dc2626';
    if (quantity <= threshold) return '#f59e0b';
    return '#10b981';
  };

  const getProgressPercentage = () => {
    // Calculate percentage based on a reasonable maximum stock level
    const maxStock = Math.max(quantity, 20); // Use 20 as base or actual quantity if higher
    return Math.min((quantity / maxStock) * 100, 100);
  };

  return (
    <div className={`inventory-status ${getStatusClass()}`}>
      <div className="inventory-header">
        <span className="inventory-icon">{getStatusIcon()}</span>
        <span className="inventory-text">{getStatusText()}</span>
      </div>
      
      <div className="inventory-details">
        <div className="quantity-display">
          <span className="quantity-number">{quantity}</span>
          <span className="quantity-label">{t('inv.units')}</span>
        </div>
        
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{
              width: `${getProgressPercentage()}%`,
              backgroundColor: getProgressBarColor()
            }}
          />
        </div>
      </div>
      
      {quantity <= threshold && quantity > 0 && (
        <div className="stock-warning">
          {t('inv.onlyLeft', { quantity })}
        </div>
      )}
      
      {quantity === 0 && (
        <div className="stock-warning critical">
          {t('inv.restockNeeded')}
        </div>
      )}
    </div>
  );
};

export default InventoryStatus;

