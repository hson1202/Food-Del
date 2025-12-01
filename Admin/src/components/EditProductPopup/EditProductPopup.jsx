import React, { useState, useCallback, useMemo } from 'react';
import './EditProductPopup.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [currentOption, setCurrentOption] = useState({
    name: '',
    nameVI: '',
    nameEN: '',
    nameSK: '',
    type: 'select',
    defaultChoiceCode: '',
    choices: [],
    pricingMode: 'add'
  });
  const [editingOptionIndex, setEditingOptionIndex] = useState(-1);
  const [editingChoiceIndex, setEditingChoiceIndex] = useState(-1);
  const [currentChoice, setCurrentChoice] = useState({
    code: '',
    label: '',
    labelVI: '',
    labelEN: '',
    labelSK: '',
    price: 0,
    image: null
  });

  // Memoize initial states để tránh tạo lại object không cần thiết
  const initialOption = useMemo(() => ({
    name: '',
    nameVI: '',
    nameEN: '',
    nameSK: '',
    type: 'select',
    defaultChoiceCode: '',
    choices: [],
    pricingMode: 'add'
  }), []);

  const initialChoice = useMemo(() => ({
    code: '',
    label: '',
    labelVI: '',
    labelEN: '',
    labelSK: '',
    price: 0,
    image: null
  }), []);

  // Validate functions
  const validateOption = useCallback((option, existingOptions, editingIndex = -1) => {
    if (!option.name.trim()) {
      return t('editProduct.validation.optionNameRequired');
    }
    
    if (option.choices.length === 0) {
      return t('editProduct.validation.choiceRequired');
    }
    
    if (!option.defaultChoiceCode) {
      return t('editProduct.validation.defaultChoiceRequired');
    }
    
    // Check duplicate names
    const duplicate = existingOptions.find((opt, index) => 
      opt.name === option.name && index !== editingIndex
    );
    if (duplicate) {
      return t('editProduct.validation.optionNameExists');
    }
    
    return null;
  }, [t]);

  const validateChoice = useCallback((choice, existingChoices, editingIndex = -1) => {
    if (!choice.code.trim()) {
      return t('editProduct.validation.choiceCodeRequired');
    }
    
    if (!choice.label.trim()) {
      return t('editProduct.validation.choiceLabelRequired');
    }
    
    if (choice.price === undefined || choice.price === null || isNaN(Number(choice.price))) {
      return t('editProduct.validation.choicePriceRequired');
    }
    
    // Check duplicate codes
    const duplicate = existingChoices.find((ch, index) => 
      ch.code === choice.code && index !== editingIndex
    );
    if (duplicate) {
      return t('editProduct.validation.choiceCodeExists');
    }
    
    return null;
  }, [t]);

  // Reset functions
  const resetOptionsForm = useCallback(() => {
    setCurrentOption({ ...initialOption });
    setCurrentChoice({ ...initialChoice });
    setEditingOptionIndex(-1);
    setEditingChoiceIndex(-1);
    setShowOptionsForm(false);
  }, [initialOption, initialChoice]);

  const resetChoiceForm = useCallback(() => {
    setCurrentChoice({ ...initialChoice });
    setEditingChoiceIndex(-1);
  }, [initialChoice]);

  // Option management
  const addOption = useCallback(() => {
    const error = validateOption(currentOption, editForm.options || [], editingOptionIndex);
    if (error) {
      alert(error);
      return;
    }
    
    const updatedOptions = [...(editForm.options || [])];
    
    if (editingOptionIndex >= 0) {
      updatedOptions[editingOptionIndex] = { ...currentOption };
    } else {
      updatedOptions.push({ ...currentOption });
    }
    
    onInputChange({
      target: { name: 'options', value: updatedOptions }
    });
    
    resetOptionsForm();
    alert(editingOptionIndex >= 0 ? t('editProduct.optionUpdated') : t('editProduct.optionAdded'));
  }, [currentOption, editForm.options, editingOptionIndex, onInputChange, resetOptionsForm, validateOption, t]);

  const editOption = useCallback((index) => {
    const option = editForm.options[index];
    setCurrentOption({ ...option });
    setEditingOptionIndex(index);
    setShowOptionsForm(true);
  }, [editForm.options]);

  const deleteOption = useCallback((index) => {
    if (!window.confirm(t('editProduct.confirmDeleteOption'))) {
      return;
    }
    
    const updatedOptions = editForm.options.filter((_, i) => i !== index);
    onInputChange({
      target: { name: 'options', value: updatedOptions }
    });
    alert(t('editProduct.optionDeleted'));
  }, [editForm.options, onInputChange, t]);

  // Choice management
  const addChoice = useCallback(() => {
    const error = validateChoice(currentChoice, currentOption.choices, editingChoiceIndex);
    if (error) {
      alert(error);
      return;
    }
    
    const updatedChoices = [...currentOption.choices];
    
    if (editingChoiceIndex >= 0) {
      updatedChoices[editingChoiceIndex] = { ...currentChoice };
    } else {
      updatedChoices.push({ ...currentChoice });
    }
    
    setCurrentOption({ ...currentOption, choices: updatedChoices });
    resetChoiceForm();
    alert(editingChoiceIndex >= 0 ? t('editProduct.choiceUpdated') : t('editProduct.choiceAdded'));
  }, [currentChoice, currentOption, editingChoiceIndex, resetChoiceForm, validateChoice, t]);

  const editChoice = useCallback((index) => {
    const choice = currentOption.choices[index];
    setCurrentChoice({ ...choice });
    setEditingChoiceIndex(index);
  }, [currentOption.choices]);

  const deleteChoice = useCallback((index) => {
    if (!window.confirm(t('editProduct.confirmDeleteChoice'))) {
      return;
    }
    
    const updatedChoices = currentOption.choices.filter((_, i) => i !== index);
    const deletedChoice = currentOption.choices[index];
    
    // Reset default choice if deleted choice was the default
    const newDefaultCode = currentOption.defaultChoiceCode === deletedChoice.code 
      ? '' 
      : currentOption.defaultChoiceCode;
    
    setCurrentOption({ 
      ...currentOption, 
      choices: updatedChoices,
      defaultChoiceCode: newDefaultCode
    });
    
    alert(t('editProduct.choiceDeleted'));
  }, [currentOption, t]);

  // Event handlers
  const handleOptionChange = useCallback((field, value) => {
    setCurrentOption(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleChoiceChange = useCallback((field, value) => {
    setCurrentChoice(prev => ({ 
      ...prev, 
      [field]: field === 'price' ? parseFloat(value) || 0 : value 
    }));
  }, []);

  // Memoize image source calculation
  const imageSrc = useMemo(() => {
    if (editForm.imagePreview) {
      return editForm.imagePreview;
    }
    
    if (!product?.image) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
    
    return product.image.startsWith('http') 
      ? product.image 
      : `${url}/images/${product.image}`;
  }, [editForm.imagePreview, product?.image, url]);

  // Calculate discount
  const discountAmount = useMemo(() => {
    if (!editForm.isPromotion || !editForm.price || !editForm.promotionPrice) {
      return 0;
    }
    return parseFloat(editForm.price) - parseFloat(editForm.promotionPrice);
  }, [editForm.isPromotion, editForm.price, editForm.promotionPrice]);

  if (!isOpen || !product) return null;

  return (
    <div className="edit-product-popup-overlay" onClick={onCancel}>
      <div className="edit-product-popup" onClick={e => e.stopPropagation()}>
        <div className="edit-product-popup-header">
          <div className="header-content">
            <h2>{t('editProduct.title')}</h2>
            <p className="header-subtitle">{t('editProduct.subtitle')}</p>
          </div>
          <button 
            className="close-btn"
            onClick={onCancel}
            title={t('editProduct.close')}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="edit-product-popup-content">
          <form onSubmit={onSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">{t('editProduct.basicInfo')}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t('products.sku')} *</label>
                  <input
                    type="text"
                    name="sku"
                    value={editForm.sku || ''}
                    onChange={onInputChange}
                    required
                    placeholder={t('products.skuPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('products.price')} *</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price || ''}
                    onChange={onInputChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('products.name')} *</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name || ''}
                    onChange={onInputChange}
                    required
                    placeholder={t('products.namePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('products.category')} *</label>
                  <select
                    name="category"
                    value={editForm.category || ''}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">{t('products.selectCategory')}</option>
                    {categories?.map(category => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('products.nameVI')}</label>
                  <input
                    type="text"
                    name="nameVI"
                    value={editForm.nameVI || ''}
                    onChange={onInputChange}
                    placeholder={t('products.nameVIPlaceholder') || t('products.nameVI')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('products.nameEN')}</label>
                  <input
                    type="text"
                    name="nameEN"
                    value={editForm.nameEN || ''}
                    onChange={onInputChange}
                    placeholder={t('products.nameENPlaceholder') || t('products.nameEN')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('products.nameSK')}</label>
                  <input
                    type="text"
                    name="nameSK"
                    value={editForm.nameSK || ''}
                    onChange={onInputChange}
                    placeholder={t('products.nameSKPlaceholder') || t('products.nameSK')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('common.quantity')} *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editForm.quantity || ''}
                    onChange={onInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>{t('products.description')}</label>
                <textarea
                  name="description"
                  value={editForm.description || ''}
                  onChange={onInputChange}
                  rows="4"
                  placeholder={t('products.descriptionPlaceholder')}
                />
              </div>
            </div>

            {/* Product Image */}
            <div className="form-section">
              <h3 className="section-title">{t('editProduct.productImage')}</h3>
              
              <div className="image-upload-section">
                <div className="current-image">
                  <img 
                    src={imageSrc}
                    alt={editForm.imagePreview ? t('editProduct.newImagePreview') : t('editProduct.currentImage')} 
                    className="current-product-image"
                    loading="lazy"
                  />
                  <p className="image-label">
                    {editForm.imagePreview ? t('editProduct.newImagePreview') : t('editProduct.currentImage')}
                  </p>
                </div>
                
                <input
                  type="file"
                  id="edit-image-upload"
                  onChange={onImageChange}
                  accept="image/*"
                  className="image-input"
                />
                <label htmlFor="edit-image-upload" className="image-upload-label">
                  {t('editProduct.chooseNewImage')}
                </label>
                <small className="form-help">
                  {t('editProduct.uploadImageHelp')}
                </small>
              </div>
            </div>

            {/* Variant Options Section */}
            <div className="form-section">
              <h3 className="section-title">{t('editProduct.optionsVariants')}</h3>
              <p className="section-description">{t('editProduct.optionsDescription')}</p>

              {/* Display existing options */}
              {editForm.options && editForm.options.length > 0 && (
                <div className="existing-options">
                  <h4>{t('editProduct.currentOptions')}</h4>
                  <div className="options-list">
                    {editForm.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option-card">
                        <div className="option-header">
                          <div className="option-info">
                            <h5>{option.name}</h5>
                            <span className="pricing-mode">{option.pricingMode}</span>
                          </div>
                          <div className="option-actions">
                            <button 
                              type="button" 
                              onClick={() => editOption(optionIndex)}
                              className="btn btn-edit"
                            >
                              {t('editProduct.edit')}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => deleteOption(optionIndex)}
                              className="btn btn-delete"
                            >
                              {t('editProduct.delete')}
                            </button>
                          </div>
                        </div>
                        
                        <div className="choices-grid">
                          {option.choices.map((choice, choiceIndex) => (
                            <div 
                              key={choiceIndex} 
                              className={`choice-card ${option.defaultChoiceCode === choice.code ? 'default' : ''}`}
                            >
                              <div className="choice-code">{choice.code}</div>
                              <div className="choice-label">{choice.label}</div>
                              <div className="choice-price">€{choice.price}</div>
                              {choice.image && <div className="choice-image">📷</div>}
                              {option.defaultChoiceCode === choice.code && (
                                <div className="default-badge">{t('editProduct.default')}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add/Edit Option Form */}
              {showOptionsForm && (
                <div className="option-form">
                  <div className="form-header">
                    <h4>{editingOptionIndex >= 0 ? t('editProduct.editOption') : t('editProduct.addNewOption')}</h4>
                    <button 
                      type="button" 
                      onClick={resetOptionsForm}
                      className="btn btn-secondary btn-sm"
                    >
                      {t('editProduct.cancel')}
                    </button>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('editProduct.optionName')}</label>
                      <input
                        type="text"
                        value={currentOption.name}
                        onChange={(e) => handleOptionChange('name', e.target.value)}
                        placeholder={t('editProduct.optionNamePlaceholder')}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('editProduct.pricingMode')}</label>
                      <select
                        value={currentOption.pricingMode}
                        onChange={(e) => handleOptionChange('pricingMode', e.target.value)}
                      >
                        <option value="add">{t('editProduct.pricingModeAdd')}</option>
                        <option value="override">{t('editProduct.pricingModeOverride')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('editProduct.optionNameSK')}</label>
                      <input
                        type="text"
                        value={currentOption.nameSK || ''}
                        onChange={(e) => handleOptionChange('nameSK', e.target.value)}
                        placeholder={t('editProduct.optionNamePlaceholder')}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('editProduct.optionNameVI')}</label>
                      <input
                        type="text"
                        value={currentOption.nameVI || ''}
                        onChange={(e) => handleOptionChange('nameVI', e.target.value)}
                        placeholder={t('editProduct.optionNamePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('editProduct.optionNameEN')}</label>
                      <input
                        type="text"
                        value={currentOption.nameEN || ''}
                        onChange={(e) => handleOptionChange('nameEN', e.target.value)}
                        placeholder={t('editProduct.optionNamePlaceholder')}
                      />
                    </div>
                  </div>

                  {/* Choices Management */}
                  <div className="choices-section">
                    <h5>{t('editProduct.choices')}</h5>
                    
                    {/* Display existing choices */}
                    {currentOption.choices.length > 0 && (
                      <div className="choices-grid">
                        {currentOption.choices.map((choice, index) => (
                          <div key={index} className="choice-card">
                            <div className="choice-code">{choice.code}</div>
                            <div className="choice-label">{choice.label}</div>
                            <div className="choice-price">€{choice.price}</div>
                            {choice.image && <div className="choice-image">📷</div>}
                            <div className="choice-actions">
                              <button 
                                type="button" 
                                onClick={() => editChoice(index)}
                                className="btn btn-edit btn-sm"
                              >
                                ✏️
                              </button>
                              <button 
                                type="button" 
                                onClick={() => deleteChoice(index)}
                                className="btn btn-delete btn-sm"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add/Edit Choice Form */}
                    <div className="choice-form">
                      <h6>{editingChoiceIndex >= 0 ? t('editProduct.editChoice') : t('editProduct.addNewChoice')}</h6>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('editProduct.choiceCode')}</label>
                          <input
                            type="text"
                            value={currentChoice.code}
                            onChange={(e) => handleChoiceChange('code', e.target.value)}
                            placeholder={t('editProduct.choiceCodePlaceholder')}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('editProduct.choicePrice')}</label>
                          <input
                            type="number"
                            value={currentChoice.price}
                            onChange={(e) => handleChoiceChange('price', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('editProduct.choiceLabel')}</label>
                          <input
                            type="text"
                            value={currentChoice.label}
                            onChange={(e) => handleChoiceChange('label', e.target.value)}
                            placeholder={t('editProduct.choiceLabelPlaceholder')}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('editProduct.choiceLabelSK')}</label>
                          <input
                            type="text"
                            value={currentChoice.labelSK || ''}
                            onChange={(e) => handleChoiceChange('labelSK', e.target.value)}
                            placeholder={t('editProduct.choiceLabelPlaceholder')}
                          />
                        </div>
                        <div className="form-group">
                          <label>{t('editProduct.choiceLabelVI')}</label>
                          <input
                            type="text"
                            value={currentChoice.labelVI || ''}
                            onChange={(e) => handleChoiceChange('labelVI', e.target.value)}
                            placeholder={t('editProduct.choiceLabelPlaceholder')}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>{t('editProduct.choiceLabelEN')}</label>
                          <input
                            type="text"
                            value={currentChoice.labelEN || ''}
                            onChange={(e) => handleChoiceChange('labelEN', e.target.value)}
                            placeholder={t('editProduct.choiceLabelPlaceholder')}
                          />
                        </div>
                      </div>

                      <div className="choice-form-actions">
                        <button 
                          type="button" 
                          onClick={addChoice}
                          className="btn btn-primary"
                        >
                          {editingChoiceIndex >= 0 ? t('editProduct.updateChoice') : t('editProduct.addChoice')}
                        </button>
                        {editingChoiceIndex >= 0 && (
                          <button 
                            type="button" 
                            onClick={resetChoiceForm}
                            className="btn btn-secondary"
                          >
                            {t('editProduct.cancelEdit')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Default Choice Selection */}
                    {currentOption.choices.length > 0 && (
                      <div className="default-choice-section">
                        <label>{t('editProduct.defaultChoice')}</label>
                        <select
                          value={currentOption.defaultChoiceCode}
                          onChange={(e) => handleOptionChange('defaultChoiceCode', e.target.value)}
                        >
                          <option value="">{t('editProduct.selectDefaultChoice')}</option>
                          {currentOption.choices.map((choice) => (
                            <option key={choice.code} value={choice.code}>
                              {choice.code} - {choice.label} (€{choice.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="option-form-actions">
                    <button 
                      type="button" 
                      onClick={addOption}
                      className="btn btn-primary"
                      disabled={!currentOption.name || currentOption.choices.length === 0 || !currentOption.defaultChoiceCode}
                    >
                      {editingOptionIndex >= 0 ? t('editProduct.updateOption') : t('editProduct.addOption')}
                    </button>
                  </div>
                </div>
              )}

              {/* Add Option Button */}
              {!showOptionsForm && (
                <button 
                  type="button" 
                  onClick={() => setShowOptionsForm(true)}
                  className="btn btn-success btn-add-option"
                >
                  {t('editProduct.addVariantOption')}
                </button>
              )}
            </div>

            {/* Promotion Section */}
            <div className="form-section">
              <h3 className="section-title">{t('editProduct.promotion')}</h3>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.isPromotion || false}
                    onChange={(e) => onInputChange({
                      target: {
                        name: 'isPromotion',
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    })}
                  />
                  {t('editProduct.enablePromotion')}
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.disableBoxFee || false}
                    onChange={(e) => onInputChange({
                      target: {
                        name: 'disableBoxFee',
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    })}
                  />
                  {t('editProduct.disableBoxFee')}
                </label>
                <small className="form-help">
                  {t('editProduct.disableBoxFeeHelp')}
                </small>
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: editForm.disableBoxFee ? '#e8f5e9' : '#fff3e0',
                  borderRadius: '5px',
                  border: '1px solid #ddd'
                }}>
                  <strong>{t('editProduct.priceDisplay')}</strong>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2', marginTop: '5px' }}>
                    €{(() => {
                      const basePrice = Number(editForm.price) || 0;
                      const boxFee = editForm.disableBoxFee ? 0 : 0.3;
                      const finalPrice = basePrice + boxFee;
                      return finalPrice.toFixed(2);
                    })()}
                    {!editForm.disableBoxFee && (
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginLeft: '5px' }}>
                        ({t('editProduct.originalPriceLabel')} €{(Number(editForm.price) || 0).toFixed(2)} + {t('editProduct.boxFeeLabel')} €0.30)
                      </span>
                    )}
                    {editForm.disableBoxFee && (
                      <span style={{ fontSize: '12px', color: '#4caf50', fontWeight: 'normal', marginLeft: '5px' }}>
                        ({t('editProduct.boxFeeDisabled')})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {editForm.isPromotion && (
                <div className="promotion-details">
                  <div className="form-group">
                    <label>{t('editProduct.promotionPrice')}</label>
                    <input
                      type="number"
                      name="promotionPrice"
                      value={editForm.promotionPrice || ''}
                      onChange={onInputChange}
                      step="0.01"
                      min="0"
                      placeholder={t('editProduct.promotionPrice')}
                      required
                    />
                    <small className="form-help">
                      {t('editProduct.promotionPriceHelp')}
                    </small>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="discount-info">
                      <div className="discount-badge">
                        {t('editProduct.promotionActive')}{discountAmount.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-save">
                <span className="btn-icon">💾</span>
                {t('editProduct.saveChanges')}
              </button>
              <button 
                type="button" 
                onClick={onCancel}
                className="btn btn-secondary btn-cancel"
              >
                <span className="btn-icon">❌</span>
                {t('editProduct.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPopup;