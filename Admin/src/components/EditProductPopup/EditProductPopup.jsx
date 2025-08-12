import React from 'react';
import './EditProductPopup.css';

const EditProductPopup = ({ 
  isOpen, 
  product, 
  editForm, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  categories,
  onImageChange,
  url
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="edit-product-popup-overlay">
      <div className="edit-product-popup">
        <div className="edit-product-popup-header">
          <div className="header-content">
          
            <h2>Edit Product</h2>
            <p className="header-subtitle">Update product information</p>
          </div>
          <button 
            className="close-btn"
            onClick={onCancel}
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="edit-product-popup-content">
          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={editForm.sku}
                  onChange={onInputChange}
                  required
                  placeholder="Enter SKU"
                />
              </div>
              
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={onInputChange}
                  step="0.01"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={onInputChange}
                  required
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={onInputChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Name (Vietnamese)</label>
                <input
                  type="text"
                  name="nameVI"
                  value={editForm.nameVI}
                  onChange={onInputChange}
                  placeholder="Tên sản phẩm"
                />
              </div>
              
              <div className="form-group">
                <label>Name (English)</label>
                <input
                  type="text"
                  name="nameEN"
                  value={editForm.nameEN}
                  onChange={onInputChange}
                  placeholder="Product name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Name (Slovak)</label>
                <input
                  type="text"
                  name="nameSK"
                  value={editForm.nameSK}
                  onChange={onInputChange}
                  placeholder="Názov produktu"
                />
              </div>
              
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={editForm.quantity}
                  onChange={onInputChange}
                  min="0"
                  step="1"
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={onInputChange}
                rows="4"
                placeholder="Enter product description..."
              />
            </div>

            {/* Image Upload Section */}
            <div className="form-group full-width">
              <label>Product Image</label>
              <div className="image-upload-section">
                {/* Show preview if new image selected, otherwise show current image */}
                {(editForm.imagePreview || product.image) && (
                  <div className="current-image">
                    <img 
                      src={
                        editForm.imagePreview || // Show preview first if available
                        (product.image && product.image.startsWith('http')
                          ? product.image
                          : product.image 
                            ? `${url}/images/${product.image}`
                            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==')
                      }
                      alt={editForm.imagePreview ? "New image preview" : "Current product image"} 
                      className="current-product-image"
                    />
                    <p className="image-label">
                      {editForm.imagePreview ? "New Image Preview" : "Current Image"}
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="edit-image-upload"
                  onChange={onImageChange}
                  accept="image/*"
                  className="image-input"
                />
                <label htmlFor="edit-image-upload" className="image-upload-label">
                  📁 Choose New Image
                </label>
                <small className="form-help">
                  Upload a new image to replace the current one (optional)
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={editForm.isPromotion}
                  onChange={(e) => onInputChange({
                    target: {
                      name: 'isPromotion',
                      type: 'checkbox',
                      checked: e.target.checked
                    }
                  })}
                />
                Promotion
              </label>
            </div>
            
            {editForm.isPromotion && (
              <div className="promotion-section">
                <h4>Promotion Details</h4>
                <div className="form-group">
                  <label>Promotion Price *</label>
                  <input
                    type="number"
                    name="promotionPrice"
                    value={editForm.promotionPrice}
                    onChange={onInputChange}
                    step="0.01"
                    placeholder="Enter promotion price..."
                    required
                  />
                  <small className="form-help">
                    This will be the discounted price when promotion is active
                  </small>
                </div>
                
                {editForm.promotionPrice && (
                  <div className="discount-info">
                    <span className="discount-badge">
                      Promotion Active! Save €{(parseFloat(editForm.price) - parseFloat(editForm.promotionPrice)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <span className="btn-icon">💾</span>
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={onCancel}
                className="cancel-btn"
              >
                <span className="btn-icon">❌</span>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPopup;
