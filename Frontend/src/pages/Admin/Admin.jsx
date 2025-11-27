import React, { useState, useEffect, useMemo } from 'react'
import './Admin.css'
import config from '../../config/config'

const Admin = () => {
  const [foods, setFoods] = useState([])
  const [editingFood, setEditingFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    sku: ''
  })

  // Restaurant location state
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: ''
  })
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationStatus, setLocationStatus] = useState({ type: '', message: '' })

  // Category management state
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [categoryStatus, setCategoryStatus] = useState({ type: '', message: '' })
  const [categoryRenameValues, setCategoryRenameValues] = useState({})
  const [savingCategoryId, setSavingCategoryId] = useState(null)

  // Product filtering state
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')

  useEffect(() => {
    fetchFoods()
    fetchRestaurantLocation()
    fetchCategories()
  }, [])

  const fetchFoods = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${config.BACKEND_URL}/api/food/list`)
      const data = await response.json()
      
      if (data.success) {
        setFoods(data.data)
      } else {
        setError('Failed to fetch foods')
      }
    } catch (error) {
      setError('Error fetching foods: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRestaurantLocation = async () => {
    try {
      setLocationLoading(true)
      setLocationStatus({ type: '', message: '' })

      const response = await fetch(`${config.BACKEND_URL}/api/delivery/restaurant-location`)
      const data = await response.json()

      if (data.success && data.data) {
        setLocationForm({
          name: data.data.name || '',
          address: data.data.address || '',
          latitude: data.data.latitude !== undefined ? data.data.latitude : '',
          longitude: data.data.longitude !== undefined ? data.data.longitude : ''
        })
      } else {
        setLocationStatus({
          type: 'info',
          message: 'Chưa có địa chỉ nhà hàng. Hãy nhập thông tin bên dưới và lưu lại.'
        })
      }
    } catch (err) {
      console.error('Error fetching restaurant location:', err)
      setLocationStatus({
        type: 'error',
        message: 'Không lấy được địa chỉ nhà hàng. Vui lòng thử lại.'
      })
    } finally {
      setLocationLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      setCategoryError('')
      const response = await fetch(`${config.BACKEND_URL}/api/category/admin`)
      const data = await response.json()

      if (data.success) {
        setCategories(data.data)
        setCategoryRenameValues(
          (data.data || []).reduce((acc, category) => {
            if (category?._id) {
              acc[category._id] = category.name || ''
            }
            return acc
          }, {})
        )
      } else {
        setCategoryError('Không thể tải danh sách category.')
      }
    } catch (err) {
      setCategoryError('Lỗi tải category: ' + err.message)
    } finally {
      setCategoriesLoading(false)
    }
  }


  const handleLocationChange = (e) => {
    const { name, value } = e.target
    setLocationForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLocationSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('token')
    if (!token) {
      setLocationStatus({
        type: 'error',
        message: 'Bạn cần đăng nhập (token) để cập nhật địa chỉ nhà hàng.'
      })
      return
    }

    // Basic validation
    if (!locationForm.name || !locationForm.address || !locationForm.latitude || !locationForm.longitude) {
      setLocationStatus({
        type: 'error',
        message: 'Vui lòng điền đủ Tên quán, Địa chỉ, Latitude và Longitude.'
      })
      return
    }

    const payload = {
      name: locationForm.name.trim(),
      address: locationForm.address.trim(),
      latitude: Number(locationForm.latitude),
      longitude: Number(locationForm.longitude)
    }

    if (Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude)) {
      setLocationStatus({
        type: 'error',
        message: 'Latitude/Longitude phải là số hợp lệ.'
      })
      return
    }

    try {
      setLocationSaving(true)
      setLocationStatus({ type: '', message: '' })

      const response = await fetch(`${config.BACKEND_URL}/api/delivery/restaurant-location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        setLocationStatus({
          type: 'success',
          message: '✅ Đã lưu địa chỉ nhà hàng thành công.'
        })
        setLocationForm({
          name: data.data?.name || payload.name,
          address: data.data?.address || payload.address,
          latitude: data.data?.latitude ?? payload.latitude,
          longitude: data.data?.longitude ?? payload.longitude
        })
      } else {
        setLocationStatus({
          type: 'error',
          message: data.message || 'Không thể lưu địa chỉ. Vui lòng thử lại.'
        })
      }
    } catch (err) {
      console.error('Error updating restaurant location:', err)
      setLocationStatus({
        type: 'error',
        message: 'Có lỗi khi lưu địa chỉ. Kiểm tra kết nối và thử lại.'
      })
    } finally {
      setLocationSaving(false)
    }
  }

  const handleCategoryNameChange = (categoryId, value) => {
    setCategoryRenameValues((prev) => ({
      ...prev,
      [categoryId]: value
    }))
  }

  const getParentLabel = (category) => {
    const parent = category?.parentCategory
    if (!parent) return 'Danh mục gốc'
    if (typeof parent === 'object') return parent.name || parent._id || 'Danh mục cha'
    return parent
  }

  const handleSaveCategoryName = async (category) => {
    const currentValue = category.name || ''
    const draftValue = (categoryRenameValues[category._id] ?? '').trim()

    if (!draftValue) {
      setCategoryStatus({ type: 'error', message: 'Tên danh mục không được để trống.' })
      return
    }

    if (draftValue === currentValue) {
      setCategoryStatus({ type: 'info', message: 'Tên danh mục chưa thay đổi.' })
      return
    }

    try {
      setSavingCategoryId(category._id)
      setCategoryStatus({ type: '', message: '' })

      const payload = {
        name: draftValue,
        description: category.description || '',
        sortOrder: category.sortOrder ?? 0,
        isActive: category.isActive,
        parentCategory: category.parentCategory?._id || category.parentCategory || null
      }

      const response = await fetch(`${config.BACKEND_URL}/api/category/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        const updated = data.data || { ...category, ...payload }

        setCategories((prev) =>
          prev.map((item) => (item._id === category._id ? { ...item, ...updated } : item))
        )
        setCategoryRenameValues((prev) => ({
          ...prev,
          [category._id]: updated.name || draftValue
        }))

        setCategoryStatus({ type: 'success', message: 'Đã cập nhật tên danh mục thành công.' })
      } else {
        setCategoryStatus({
          type: 'error',
          message: data.message || 'Không thể cập nhật danh mục.'
        })
      }
    } catch (error) {
      setCategoryStatus({
        type: 'error',
        message: 'Có lỗi khi cập nhật danh mục: ' + error.message
      })
    } finally {
      setSavingCategoryId(null)
    }
  }

  const normalizeValue = (value) =>
    typeof value === 'string' ? value.trim().toLowerCase() : ''

  const productCategoryOptions = useMemo(() => {
    const unique = new Set()
    foods.forEach((food) => {
      if (food?.category) {
        unique.add(food.category)
      }
    })
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [foods])

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesCategory =
        productCategoryFilter === 'all' ||
        normalizeValue(food.category) === normalizeValue(productCategoryFilter)

      if (!matchesCategory) return false

      if (!productSearch.trim()) return true

      const search = normalizeValue(productSearch)
      return (
        normalizeValue(food.name).includes(search) ||
        normalizeValue(food.sku).includes(search) ||
        normalizeValue(food.description).includes(search)
      )
    })
  }, [foods, productCategoryFilter, productSearch])

  const handleEdit = (food) => {
    setEditingFood(food)
    setEditForm({
      name: food.name || '',
      price: food.price || '',
      description: food.description || '',
      category: food.category || '',
      sku: food.sku || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingFood(null)
    setEditForm({
      name: '',
      price: '',
      description: '',
      category: '',
      sku: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/food/edit/${editingFood._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setFoods(prev => prev.map(food => 
          food._id === editingFood._id ? { ...food, ...editForm } : food
        ))
        setEditingFood(null)
        setEditForm({
          name: '',
          price: '',
          description: '',
          category: '',
          sku: ''
        })
        alert('Product updated successfully!')
      } else {
        alert('Failed to update product: ' + data.message)
      }
    } catch (error) {
      alert('Error updating product: ' + error.message)
    }
  }

  const handleDelete = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/food/remove`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: foodId })
        })

        const data = await response.json()
        
        if (data.success) {
          setFoods(prev => prev.filter(food => food._id !== foodId))
          alert('Product deleted successfully!')
        } else {
          alert('Failed to delete product: ' + data.message)
        }
      } catch (error) {
        alert('Error deleting product: ' + error.message)
      }
    }
  }

  if (loading) return <div className="admin-loading">Loading...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      {/* Restaurant Location Section */}
      <section className="location-card">
        <div className="location-header">
          <div>
            <h2>📍 Địa chỉ nhà hàng</h2>
            <p>Nhập địa chỉ + tọa độ (lat/lng) để hệ thống tính phí ship chính xác.</p>
          </div>
          <button
            type="button"
            className="refresh-btn"
            onClick={fetchRestaurantLocation}
            disabled={locationLoading}
          >
            {locationLoading ? 'Đang tải...' : 'Tải lại'}
          </button>
        </div>

        {locationStatus.message && (
          <div className={`location-status ${locationStatus.type}`}>
            {locationStatus.message}
          </div>
        )}

        <form className="location-form" onSubmit={handleLocationSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tên quán</label>
              <input
                type="text"
                name="name"
                value={locationForm.name}
                onChange={handleLocationChange}
                placeholder="Ví dụ: VietBowls Bratislava"
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ hiển thị</label>
              <input
                type="text"
                name="address"
                value={locationForm.address}
                onChange={handleLocationChange}
                placeholder="Số nhà, đường, thành phố..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                name="latitude"
                value={locationForm.latitude}
                onChange={handleLocationChange}
                step="0.000001"
                placeholder="48.148600"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                name="longitude"
                value={locationForm.longitude}
                onChange={handleLocationChange}
                step="0.000001"
                placeholder="17.107700"
              />
            </div>
          </div>

          <div className="location-actions">
            <button type="submit" className="save-btn" disabled={locationSaving}>
              {locationSaving ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
          </div>
        </form>
      </section>

      <section className="categories-card">
        <div className="categories-header">
          <div>
            <h2>Manage Categories</h2>
            <p>Đổi tên danh mục không làm mất món ăn; chúng vẫn giữ nguyên ID.</p>
          </div>
          <button
            type="button"
            className="refresh-btn"
            onClick={fetchCategories}
            disabled={categoriesLoading}
          >
            {categoriesLoading ? 'Đang tải...' : 'Tải lại'}
          </button>
        </div>

        {categoryStatus.message && (
          <div className={`category-status ${categoryStatus.type}`}>
            {categoryStatus.message}
          </div>
        )}

        {categoryError && (
          <div className="category-status error">
            {categoryError}
          </div>
        )}

        {categoriesLoading ? (
          <div className="category-loading">Đang tải danh sách danh mục...</div>
        ) : categories.length === 0 ? (
          <div className="category-empty">Chưa có danh mục nào.</div>
        ) : (
          <div className="category-list">
            {categories.map((category) => {
              const inputValue = categoryRenameValues[category._id] ?? category.name ?? ''
              const hasChanges = inputValue.trim() !== (category.name || '')
              const isSaving = savingCategoryId === category._id

              return (
                <div key={category._id} className="category-item">
                  <div className="category-item-header">
                    <div>
                      <p className="category-language">
                        {category.language?.toUpperCase() || 'VI'} ·{' '}
                        {category.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                      </p>
                      <p className="category-parent">{getParentLabel(category)}</p>
                    </div>
                    <span className="category-id">ID: {category._id}</span>
                  </div>

                  <label
                    className="category-label"
                    htmlFor={`category-name-${category._id}`}
                  >
                    Tên danh mục
                  </label>
                  <div className="category-input-row">
                    <input
                      type="text"
                      id={`category-name-${category._id}`}
                      value={inputValue}
                      onChange={(e) => handleCategoryNameChange(category._id, e.target.value)}
                      className="category-name-input"
                    />
                    <div className="category-actions">
                      <button
                        type="button"
                        className="save-btn"
                        disabled={!hasChanges || isSaving}
                        onClick={() => handleSaveCategoryName(category)}
                      >
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        disabled={!hasChanges || isSaving}
                        onClick={() => handleCategoryNameChange(category._id, category.name || '')}
                      >
                        Hoàn tác
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="products-card">
        <div className="products-header">
          <h2>Manage Products</h2>
          <p>Tìm kiếm theo tên/SKU và lọc theo danh mục để quản lý nhanh hơn.</p>
        </div>

        <div className="products-toolbar">
          <div className="toolbar-field">
            <label htmlFor="product-search">Tìm kiếm sản phẩm</label>
            <input
              id="product-search"
              type="text"
              value={productSearch}
              placeholder="Nhập tên, SKU hoặc mô tả..."
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-field">
            <label htmlFor="product-category-filter">Danh mục</label>
            <select
              id="product-category-filter"
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {productCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="clear-filter-btn"
            onClick={() => {
              setProductSearch('')
              setProductCategoryFilter('all')
            }}
            disabled={!productSearch && productCategoryFilter === 'all'}
          >
            Xóa lọc
          </button>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="foods-empty">
            <div>Không tìm thấy sản phẩm phù hợp bộ lọc hiện tại.</div>
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setProductSearch('')
                setProductCategoryFilter('all')
              }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="foods-list">
        {filteredFoods.map(food => (
          <div key={food._id} className="food-item">
            <div className="food-info">
              <img 
                src={
                  food.image && food.image.startsWith('http') 
                    ? food.image 
                    : food.image 
                      ? `${config.BACKEND_URL}/images/${food.image}` 
                      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                }
                alt={food.name}
                className="food-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5qrIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  e.target.onerror = null;
                }}
              />
              <div className="food-details">
                <h3>{food.name}</h3>
                <p><strong>SKU:</strong> {food.sku}</p>
                <p><strong>Price:</strong> ${food.price}</p>
                <p><strong>Category:</strong> {food.category}</p>
                <p><strong>Description:</strong> {food.description}</p>
              </div>
            </div>
            
            <div className="food-actions">
              <button 
                onClick={() => handleEdit(food)}
                className="edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(food._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editingFood && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Product: {editingFood.name}</h3>
            
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>SKU:</label>
                <input
                  type="text"
                  name="sku"
                  value={editForm.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category:</label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
