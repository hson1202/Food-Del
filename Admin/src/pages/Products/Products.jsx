import React, { useState, useEffect } from 'react'
import './Products.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'

const Products = ({ url }) => {
  const { t } = useTranslation();
  const [foodList, setFoodList] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState(null)
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    nameVI: '',
    nameEN: '',
    nameSK: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    image: null,
    isPromotion: false,
    originalPrice: '',
    promotionPrice: '',
    soldCount: 0,
    likes: 0,
    language: 'vi'
  })

  useEffect(() => {
    fetchFoodList()
    fetchCategories()
  }, [])

  const fetchFoodList = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = {};
      const response = await axios.get(`${url}/api/food/list`, { params })
      console.log('Food list response:', response.data) // Debug log
      if (response.data && response.data.data) {
        setFoodList(response.data.data)
      } else {
        setFoodList([])
        console.warn('No data received from API')
      }
    } catch (error) {
      console.error('Error fetching food list:', error)
      setError('Failed to fetch products: ' + (error.message || 'Unknown error'))
      toast.error(t('products.fetchError') || 'Failed to fetch products')
      setFoodList([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category`)
      console.log('Categories response:', response.data) // Debug log
      if (response.data && (response.data.data || response.data)) {
        setCategories(response.data.data || response.data)
      } else {
        setCategories([])
        console.warn('No categories received from API')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to fetch categories: ' + (error.message || 'Unknown error'))
      toast.error('Failed to fetch categories')
      setCategories([])
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm(t('products.deleteConfirm') || 'Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`${url}/api/food/remove`, { data: { id: productId } })
        if (response.data) {
          toast.success(t('products.deleteSuccess') || 'Product deleted successfully')
          fetchFoodList()
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        if (error.response && error.response.data && error.response.data.error) {
          toast.error(`Failed to delete product: ${error.response.data.error}`)
        } else if (error.message) {
          toast.error(`Failed to delete product: ${error.message}`)
        } else {
          toast.error(t('products.deleteError') || 'Failed to delete product')
        }
      }
    }
  }

  const handleStatusToggle = async (productId, currentStatus) => {
    try {
              const response = await axios.put(`${url}/api/food/status`, {
          id: productId,
          status: currentStatus === 'active' ? 'inactive' : 'active'
        })
      if (response.data) {
        toast.success(t('products.statusUpdateSuccess') || 'Product status updated successfully')
        fetchFoodList()
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed to update status: ${error.response.data.error}`)
      } else if (error.message) {
        toast.error(`Failed to update status: ${error.message}`)
      } else {
        toast.error(t('products.statusUpdateError') || 'Failed to update product status')
      }
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!newProduct.sku || !newProduct.sku.trim()) {
      toast.error('SKU is required')
      return
    }
    
    if (!newProduct.name || !newProduct.name.trim()) {
      toast.error('Product name is required')
      return
    }
    
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast.error('Valid price is required')
      return
    }
    
    if (!newProduct.category || !newProduct.category.trim()) {
      toast.error('Category is required')
      return
    }
    
    if (newProduct.isPromotion && (!newProduct.promotionPrice || parseFloat(newProduct.promotionPrice) <= 0)) {
      toast.error('Promotion price is required when promotion is enabled')
      return
    }
    
    if (newProduct.isPromotion && parseFloat(newProduct.promotionPrice) >= parseFloat(newProduct.price)) {
      toast.error('Promotion price must be less than regular price')
      return
    }

    const formData = new FormData()
    formData.append('sku', newProduct.sku)
    formData.append('name', newProduct.name)
    formData.append('nameVI', newProduct.nameVI)
    formData.append('nameEN', newProduct.nameEN)
    formData.append('nameSK', newProduct.nameSK)
    formData.append('slug', newProduct.slug)
    formData.append('description', newProduct.description)
    formData.append('price', newProduct.price)
    formData.append('category', newProduct.category)
    formData.append('isPromotion', newProduct.isPromotion)
    formData.append('language', newProduct.language)
    
    if (newProduct.isPromotion) {
      formData.append('originalPrice', newProduct.originalPrice || newProduct.price)
      formData.append('promotionPrice', newProduct.promotionPrice)
    }
    
    if (newProduct.image) {
      formData.append('image', newProduct.image)
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data) {
        toast.success('Product added successfully')
        setNewProduct({
          sku: '',
          name: '',
          nameVI: '',
          nameEN: '',
          nameSK: '',
          slug: '',
          description: '',
          price: '',
          category: '',
          image: null,
          isPromotion: false,
          originalPrice: '',
          promotionPrice: '',
          soldCount: 0,
          likes: 0,
          language: 'vi'
        })
        setShowAddForm(false)
        fetchFoodList()
      }
    } catch (error) {
      console.error('Error adding product:', error)
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed to add product: ${error.response.data.error}`)
      } else if (error.message) {
        toast.error(`Failed to add product: ${error.message}`)
      } else {
        toast.error('Failed to add product')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewProduct({ ...newProduct, image: file })
    }
  }

  const handlePromotionToggle = () => {
    setNewProduct({
      ...newProduct,
      isPromotion: !newProduct.isPromotion,
      originalPrice: newProduct.isPromotion ? '' : newProduct.price,
      promotionPrice: newProduct.isPromotion ? '' : ''
    })
  }

  const calculateDiscount = (originalPrice, promotionPrice) => {
    if (!originalPrice || !promotionPrice) return 0
    return Math.round(((originalPrice - promotionPrice) / originalPrice) * 100)
  }

  const filteredProducts = foodList.filter(product => {
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = product.name.toLowerCase().includes(searchTermLower) ||
                         (product.nameVI && product.nameVI.toLowerCase().includes(searchTermLower)) ||
                         (product.nameEN && product.nameEN.toLowerCase().includes(searchTermLower)) ||
                         (product.nameSK && product.nameSK.toLowerCase().includes(searchTermLower)) ||
                         product.category.toLowerCase().includes(searchTermLower)
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className='products-page'>
      <div className="products-header">
        <h1>{t('products.title') || 'Products Management'}</h1>
        <p>{t('products.subtitle') || 'Manage your food products'}</p>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-add-product"
        >
          {showAddForm ? (t('common.cancel') || 'Cancel') : (t('products.addNew') || 'Add New Product')}
        </button>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0', fontSize: '12px' }}>
          <strong>Debug Info:</strong><br/>
          URL: {url}<br/>
          Food List Count: {foodList.length}<br/>
          Categories Count: {categories.length}<br/>
          Loading: {isLoading ? 'Yes' : 'No'}<br/>
          Search Term: {searchTerm}<br/>
          Filter Category: {filterCategory}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', background: '#ffe6e6', margin: '10px 0', borderRadius: '5px' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => { setError(null); fetchFoodList(); fetchCategories(); }} style={{ padding: '10px 20px', margin: '10px' }}>
            Retry
          </button>
        </div>
      )}

      {/* No Products State */}
      {!isLoading && !error && foodList.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <h3>No products found</h3>
          <p>Try refreshing the page or check if the backend is running.</p>
          <button onClick={fetchFoodList} style={{ padding: '10px 20px', margin: '10px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="add-product-section">
          <h2>{t('products.addNew')}</h2>
          <form onSubmit={handleAddProduct} className="product-form">
                                <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="sku">{t('products.sku')} *</label>
                        <input
                          type="text"
                          id="sku"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                          placeholder={t('products.skuPlaceholder')}
                          required
                        />
                      </div>
                      <div className="form-group">
                            <label>{t('products.name') || 'Name'}</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.nameVI') || 'Name (Vietnamese)'}</label>
                            <input
                                type="text"
                                value={newProduct.nameVI}
                                onChange={(e) => setNewProduct({...newProduct, nameVI: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.nameEN') || 'Name (English)'}</label>
                            <input
                                type="text"
                                value={newProduct.nameEN}
                                onChange={(e) => setNewProduct({...newProduct, nameEN: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.nameSK') || 'Name (Slovak)'}</label>
                            <input
                                type="text"
                                value={newProduct.nameSK}
                                onChange={(e) => setNewProduct({...newProduct, nameSK: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.slug') || 'Slug'}</label>
                            <input
                                type="text"
                                value={newProduct.slug}
                                onChange={(e) => setNewProduct({...newProduct, slug: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.language') || 'Language'}</label>
                            <select
                                value={newProduct.language}
                                onChange={(e) => setNewProduct({...newProduct, language: e.target.value})}
                            >
                                <option value="vi">🇻🇳 Vietnamese</option>
                                <option value="en">🇬🇧 English</option>
                                <option value="sk">🇸🇰 Slovak</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="description">{t('products.description')}</label>
                        <textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder={t('products.descriptionPlaceholder', 'Enter product description')}
                          rows="3"
                        />
                      </div>
                    </div>
            


            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">{t('products.category')} *</label>
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="price">{t('products.price')} *</label>
                <input
                  type="number"
                  id="price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image">{t('products.image')}</label>
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              
            </div>

            <div className="promotion-section">
              <div className="promotion-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={newProduct.isPromotion}
                    onChange={handlePromotionToggle}
                  />
                  {t('products.promotion')}
                </label>
              </div>

              {newProduct.isPromotion && (
                <div className="promotion-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="originalPrice">{t('products.originalPrice')}</label>
                      <input
                        type="number"
                        id="originalPrice"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                        placeholder="Original price"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="promotionPrice">{t('products.promotionPrice')} *</label>
                      <input
                        type="number"
                        id="promotionPrice"
                        value={newProduct.promotionPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, promotionPrice: e.target.value })}
                        placeholder="Promotion price"
                        min="0"
                        step="0.01"
                        required={newProduct.isPromotion}
                      />
                    </div>
                  </div>
                  {newProduct.originalPrice && newProduct.promotionPrice && (
                    <div className="discount-info">
                      <span className="discount-badge">
                        -{calculateDiscount(parseFloat(newProduct.originalPrice), parseFloat(newProduct.promotionPrice))}% OFF
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? t('common.loading') : t('products.addNew')}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        {isLoading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ fontSize: '10px', color: 'red', padding: '2px' }}>
                      Debug: {product.image ? `${url}/images/${product.image}` : 'No image'}
                    </div>
                  )}
                  <img 
                    src={product.image ? `${url}/images/${product.image}` : 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={product.name || 'Product'} 
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                      e.target.onerror = null;
                    }}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <div className="product-overlay">
                    <button
                      onClick={() => handleStatusToggle(product._id, product.status)}
                      className={`status-toggle ${product.status}`}
                    >
                      {getStatusBadge(product.status)}
                    </button>
                  </div>
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h3>{product.name || product.nameVI || product.nameEN || product.nameSK || 'Unnamed Product'}</h3>
                    <span className="product-sku">SKU: {product.sku || 'N/A'}</span>
                  </div>
                  <div className="product-info">
                    {product.nameVI && <p className="product-name-vi">🇻🇳 {product.nameVI}</p>}
                    {product.nameEN && <p className="product-name-en">🇬🇧 {product.nameEN}</p>}
                    {product.nameSK && <p className="product-name-sk">🇸🇰 {product.nameSK}</p>}
                    <p className="product-category">📁 {product.category || 'No Category'}</p>
                    <p className="product-description">📝 {product.description || 'No description'}</p>
                  </div>
                  <div className="product-pricing">
                    {product.isPromotion && product.originalPrice && product.promotionPrice ? (
                      <div className="promotion-pricing">
                        <div className="original-price">€{product.originalPrice}</div>
                        <div className="promotion-price">€{product.promotionPrice}</div>
                        <div className="discount-badge">
                          -{calculateDiscount(product.originalPrice, product.promotionPrice)}% OFF
                        </div>
                      </div>
                    ) : (
                      <div className="regular-price">€{product.price || '0.00'}</div>
                    )}
                  </div>
                  <div className="product-actions">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="btn-edit"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="btn-delete"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="products-summary">
        <div className="summary-card">
          <h3>{t('dashboard.totalProducts')}</h3>
          <p>{foodList.length}</p>
        </div>
        <div className="summary-card">
          <h3>Active Products</h3>
          <p>{foodList.filter(product => product.status === 'active').length}</p>
        </div>
        <div className="summary-card">
          <h3>Categories</h3>
          <p>{categories.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Price</h3>
          <p>€{foodList.length > 0 ? (foodList.reduce((sum, product) => sum + product.price, 0) / foodList.length).toFixed(2) : '0.00'}</p>
        </div>
      </div>
    </div>
  )
}

export default Products 