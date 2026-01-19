import React, { useState, useEffect } from 'react'
import './Category.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import '../../i18n'
import config from '../../config/config'

const Category = ({ url }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [isLoadingParents, setIsLoadingParents] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image: null, parentCategory: '' })
  const [editingCategory, setEditingCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [loadingImages, setLoadingImages] = useState(new Set())
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'grid'
  const [expandedGroups, setExpandedGroups] = useState(new Set()) // Track which groups are expanded
  const [showAddForm, setShowAddForm] = useState(false) // Track if add form is visible
  
  // Environment info for debugging
  const envInfo = {
    urlProp: url,
    configBackendUrl: config.BACKEND_URL,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname
  }

  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Category component mounted:', envInfo)
    }
    fetchCategories()
    fetchParentCategories()
  }, [])
  
  // Error boundary - MOVED AFTER ALL HOOKS
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Try again</button>
      </div>
    )
  }

  const fetchCategories = async (showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        toast.info('🔄 Đang tải lại categories...', { autoClose: 1000 })
      }
      
      const apiUrl = `${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}/admin`
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching categories from:', apiUrl)
      }
      const response = await axios.get(apiUrl)
      const categoriesData = response.data.data || response.data
      setCategories(categoriesData)
      
      if (showLoadingToast) {
        toast.success(`✅ Đã tải lại ${categoriesData.length} categories`, { autoClose: 2000 })
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError(error)
      toast.error(t('categories.fetchError', 'Failed to fetch categories'))
    }
  }

  const fetchParentCategories = async () => {
    try {
      setIsLoadingParents(true)
      const apiUrl = `${config.BACKEND_URL}/api/parent-category/admin/all`
      const response = await axios.get(apiUrl)
      setParentCategories(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error fetching parent categories:', error)
      toast.error('Không thể tải danh sách parent category')
    } finally {
      setIsLoadingParents(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      toast.error(t('categories.nameRequired', 'Category name is required'))
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', newCategory.name)
      formData.append('description', newCategory.description)
      formData.append('parentCategory', newCategory.parentCategory || '')
      if (newCategory.image) {
        formData.append('image', newCategory.image)
      }

      const apiUrl = `${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}`
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding category to:', apiUrl, { name: newCategory.name, hasImage: !!newCategory.image })
      }
      
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds timeout
      })
      toast.success(t('categories.addSuccess', 'Category added successfully'))
      setNewCategory({ name: '', description: '', image: null, parentCategory: '' })
      setShowAddForm(false) // Close form after successful add
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      setError(error)
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - backend không phản hồi. Vui lòng thử lại.')
      } else if (error.response?.status === 404) {
        toast.error('Backend không tìm thấy. Kiểm tra URL: ' + config.BACKEND_URL)
      } else if (error.response?.status >= 500) {
        toast.error('Lỗi server. Vui lòng thử lại sau.')
      } else {
        toast.error(error.response?.data?.message || t('categories.addError', 'Failed to add category'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0]
      if (file) {
        setNewCategory({ ...newCategory, image: file })
      }
    } catch (error) {
      console.error('Error handling image change:', error)
      setError(error)
    }
  }

  const handleEditCategory = async (e) => {
    e.preventDefault()
    if (!editingCategory.name.trim()) {
      toast.error(t('categories.nameRequired', 'Category name is required'))
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', editingCategory.name)
      formData.append('description', editingCategory.description)
      formData.append('parentCategory', editingCategory.parentCategory || '')
      if (editingCategory.newImage) {
        formData.append('image', editingCategory.newImage)
      }

      await axios.put(`${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}/${editingCategory._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success(t('categories.updateSuccess', 'Category updated successfully'))
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      setError(error)
      toast.error(error.response?.data?.message || t('categories.updateError', 'Failed to update category'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(t('categories.deleteConfirm', 'Are you sure you want to delete this category?'))) {
      try {
        await axios.delete(`${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}/${categoryId}`)
        toast.success(t('categories.deleteSuccess', 'Category deleted successfully'))
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        setError(error)
        toast.error(t('categories.deleteError', 'Failed to delete category'))
      }
    }
  }

  const startEditing = (category) => {
    try {
      const parentCategoryId = typeof category.parentCategory === 'object'
        ? category.parentCategory?._id
        : category.parentCategory || ''
      setEditingCategory({ ...category, parentCategory: parentCategoryId || '', newImage: null })
    } catch (error) {
      console.error('Error starting edit:', error)
      setError(error)
    }
  }

  const cancelEditing = () => {
    try {
      setEditingCategory(null)
    } catch (error) {
      console.error('Error canceling edit:', error)
      setError(error)
    }
  }

  // Group categories by parent
  const getGroupedCategories = () => {
    const grouped = {}
    
    // Group by parent category
    categories.forEach(cat => {
      const parentId = typeof cat.parentCategory === 'object' 
        ? cat.parentCategory?._id 
        : cat.parentCategory || 'none'
      
      if (!grouped[parentId]) {
        grouped[parentId] = []
      }
      grouped[parentId].push(cat)
    })
    
    // Sort within each group by sortOrder
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.sortOrder - b.sortOrder)
    })
    
    return grouped
  }

  // Toggle group expand/collapse
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  // Expand all groups
  const expandAllGroups = () => {
    const groupedCategories = getGroupedCategories()
    setExpandedGroups(new Set(Object.keys(groupedCategories)))
  }

  // Collapse all groups
  const collapseAllGroups = () => {
    setExpandedGroups(new Set())
  }

  // Move category up in sort order
  const buildReorderedUpdates = (group, fromIndex, toIndex) => {
    const normalizedGroup = group.map((item, index) => ({
      ...item,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index
    }))

    // If duplicate or invalid sortOrder values exist, normalize to current order
    const sortOrders = normalizedGroup.map((item) => item.sortOrder)
    const hasDuplicate = new Set(sortOrders).size !== normalizedGroup.length
    const needsNormalize = hasDuplicate || normalizedGroup.some((item, index) => item.sortOrder !== index && sortOrders.every((value) => value === sortOrders[0]))

    const baseGroup = needsNormalize
      ? normalizedGroup.map((item, index) => ({ ...item, sortOrder: index }))
      : normalizedGroup

    const reordered = [...baseGroup]
    const temp = reordered[fromIndex]
    reordered[fromIndex] = reordered[toIndex]
    reordered[toIndex] = temp

    return reordered.map((item, index) => ({
      id: item._id,
      sortOrder: index
    }))
  }

  const moveCategoryUp = async (category, groupedCategories) => {
    const parentId = typeof category.parentCategory === 'object'
      ? category.parentCategory?._id
      : category.parentCategory || 'none'
    
    const group = groupedCategories[parentId]
    const currentIndex = group.findIndex(c => c._id === category._id)
    
    if (currentIndex <= 0) return // Already at top
    
    const updates = buildReorderedUpdates(group, currentIndex, currentIndex - 1)
    await updateCategorySortOrder(updates)
  }

  // Move category down in sort order
  const moveCategoryDown = async (category, groupedCategories) => {
    const parentId = typeof category.parentCategory === 'object'
      ? category.parentCategory?._id
      : category.parentCategory || 'none'
    
    const group = groupedCategories[parentId]
    const currentIndex = group.findIndex(c => c._id === category._id)
    
    if (currentIndex >= group.length - 1) return // Already at bottom
    
    const updates = buildReorderedUpdates(group, currentIndex, currentIndex + 1)
    await updateCategorySortOrder(updates)
  }

  // Call API to update sort order
  const updateCategorySortOrder = async (updates) => {
    try {
      setIsLoading(true)
      const apiUrl = `${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}/bulk-update-order`
      
      const response = await axios.post(apiUrl, { updates })
      
      if (response.data.success) {
        toast.success('Đã cập nhật thứ tự thành công!')
        fetchCategories()
      } else {
        toast.error(response.data.message || 'Không thể cập nhật thứ tự')
      }
    } catch (error) {
      console.error('Error updating sort order:', error)
      toast.error('Lỗi khi cập nhật thứ tự')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='category-page'>
      <div className="category-header">
        <div className="header-content">
          <h1>{t('categories.title')}</h1>
          <p>{t('categories.subtitle', 'Manage your food categories')}</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-add-category" 
            onClick={() => {
              setShowAddForm(true);
              // Scroll to form
              setTimeout(() => {
                document.getElementById('add-category-form')?.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              }, 100);
            }}
          >
            ➕ Thêm mới
          </button>
          <button className="refresh-btn" onClick={() => fetchCategories(true)}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="add-category-section" id="add-category-form">
        <div 
          className="add-category-header" 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ marginBottom: showAddForm ? '20px' : '0' }}
        >
          <span className="expand-icon">
            {showAddForm ? '▼' : '▶'}
          </span>
          <h2>Thêm danh mục</h2>
        </div>
        
        {showAddForm && (
        <form onSubmit={handleAddCategory} className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('categories.name')} *</label>
              <input
                type="text"
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder={t('categories.namePlaceholder', 'Enter category name')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">{t('categories.description')}</label>
              <textarea
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder={t('categories.descriptionPlaceholder', 'Enter category description')}
                rows="3"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="parentCategory">{t('categories.parentCategory', 'Parent Category')}</label>
            <select
              id="parentCategory"
              value={newCategory.parentCategory}
              onChange={(e) => setNewCategory({ ...newCategory, parentCategory: e.target.value })}
              disabled={isLoadingParents}
            >
              <option value="">{t('categories.parentCategoryNone', 'Không có parent')}</option>
              {parentCategories.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.icon ? `${parent.icon} ` : ''}{parent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">{t('categories.image')}</label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('categories.addNew')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setNewCategory({ name: '', description: '', image: null, parentCategory: '' })}
            >
              {t('common.clear')}
            </button>
          </div>
        </form>
        )}
      </div>

      {/* Categories List */}
      <div className="categories-section">
        <div className="categories-section-header">
          <h2>{t('categories.list', 'Categories List')}</h2>
          <div className="header-controls">
            <div className="view-mode-toggle">
              <button 
                className={`view-btn ${viewMode === 'grouped' ? 'active' : ''}`}
                onClick={() => setViewMode('grouped')}
              >
                📁 Grouped View
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                🔲 Grid View
              </button>
            </div>
            {viewMode === 'grouped' && (
              <div className="expand-controls">
                <button className="expand-btn" onClick={expandAllGroups}>
                  ⬇️ Mở tất cả
                </button>
                <button className="expand-btn" onClick={collapseAllGroups}>
                  ⬆️ Đóng tất cả
                </button>
              </div>
            )}
          </div>
        </div>
        {categories.length === 0 ? (
          <div className="empty-state">
            <h3>{t('categories.noCategoriesTitle', 'No Categories Found')}</h3>
            <p>{t('categories.noCategories', 'Start by adding your first category')}</p>
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="categories-container">
            {(() => {
              const groupedCategories = getGroupedCategories()
              return Object.keys(groupedCategories).map(parentId => {
                const parentInfo = parentId !== 'none' 
                  ? parentCategories.find(p => p._id === parentId)
                  : null
                const group = groupedCategories[parentId]
                
                const isExpanded = expandedGroups.has(parentId)
                
                return (
                  <div key={parentId} className="category-group">
                    <div 
                      className="category-group-header" 
                      onClick={() => toggleGroup(parentId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="group-header-left">
                        <span className="expand-icon">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <h3>
                          {parentInfo 
                            ? `${parentInfo.icon ? `${parentInfo.icon} ` : ''}${parentInfo.name}` 
                            : '📂 Không có Parent Category'}
                        </h3>
                      </div>
                      <span className="category-count">{group.length} categories</span>
                    </div>
                    {isExpanded && (
                      <div className="category-group-list">
                      {group.map((category, index) => (
                        <div key={category._id} className="category-list-item">
                          {editingCategory && editingCategory._id === category._id ? (
                            <form onSubmit={handleEditCategory} className="edit-form-inline">
                              <div className="edit-form-content">
                                <div className="form-group-inline">
                                  <label>{t('categories.name')}</label>
                                  <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="form-group-inline">
                                  <label>{t('categories.description')}</label>
                                  <textarea
                                    value={editingCategory.description}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                    rows="2"
                                  />
                                </div>
                                <div className="form-group-inline">
                                  <label>{t('categories.parentCategory', 'Parent Category')}</label>
                                  <div className="parent-select-row">
                                    <select
                                      value={editingCategory.parentCategory || ''}
                                      onChange={(e) => setEditingCategory({ ...editingCategory, parentCategory: e.target.value })}
                                    >
                                      <option value="">{t('categories.parentCategoryNone', 'Không có parent')}</option>
                                      {parentCategories.map((parent) => (
                                        <option key={parent._id} value={parent._id}>
                                          {parent.icon ? `${parent.icon} ` : ''}{parent.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="form-group-inline">
                                  <label>{t('categories.newImage', 'New Image')}</label>
                                  <input
                                    type="file"
                                    onChange={(e) => setEditingCategory({ ...editingCategory, newImage: e.target.files[0] })}
                                    accept="image/*"
                                  />
                                </div>
                              </div>
                              <div className="edit-actions-inline">
                                <button type="submit" className="btn-success" disabled={isLoading}>
                                  {isLoading ? t('common.loading') : t('common.save')}
                                </button>
                                <button type="button" onClick={cancelEditing} className="btn-secondary">
                                  {t('common.cancel')}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="category-list-image">
                                <img 
                                  src={
                                    category.image && category.image.startsWith('http')
                                      ? category.image
                                      : category.image 
                                        ? `${config.BACKEND_URL}${config.IMAGE_PATHS.CATEGORY}/${category.image}`
                                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'
                                  }
                                  alt={category.name}
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZWJlZSIgc3Ryb2tlPSIjZmY2ODY4IiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2ZmNjg2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg=='
                                  }}
                                />
                              </div>
                              <div className="category-list-info">
                                <h4>{category.name}</h4>
                                <p>{category.description || t('categories.noDescription', 'No description')}</p>
                                <span className="category-sort-number">Order: {category.sortOrder}</span>
                              </div>
                              <div className="category-list-actions">
                                <div className="sort-controls">
                                  <button
                                    className="btn-sort"
                                    onClick={() => moveCategoryUp(category, groupedCategories)}
                                    disabled={isLoading || index === 0}
                                    title="Move up"
                                  >
                                    ⬆️
                                  </button>
                                  <button
                                    className="btn-sort"
                                    onClick={() => moveCategoryDown(category, groupedCategories)}
                                    disabled={isLoading || index === group.length - 1}
                                    title="Move down"
                                  >
                                    ⬇️
                                  </button>
                                </div>
                                <div className="action-buttons">
                                  <button onClick={() => startEditing(category)} className="btn-edit">
                                    {t('common.edit')}
                                  </button>
                                  <button onClick={() => handleDeleteCategory(category._id)} className="btn-delete">
                                    {t('common.delete')}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        ) : (
                    <div className="categories-container">
            <div className="categories-grid" id="categoriesGrid">
              {categories.map((category) => {
                const parentInfo = category.parentCategory
                  ? (typeof category.parentCategory === 'object'
                    ? category.parentCategory
                    : parentCategories.find((parent) => parent._id === category.parentCategory))
                  : null
                
                return (
                  <div key={category._id} className="category-card">
                {editingCategory && editingCategory._id === category._id ? (
                  <form onSubmit={handleEditCategory} className="edit-form">
                    <div className="form-group">
                      <label>{t('categories.name')}</label>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('categories.description')}</label>
                      <textarea
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('categories.parentCategory', 'Parent Category')}</label>
                      <div className="parent-select-row">
                        <select
                          value={editingCategory.parentCategory || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, parentCategory: e.target.value })}
                        >
                          <option value="">{t('categories.parentCategoryNone', 'Không có parent')}</option>
                          {parentCategories.map((parent) => (
                            <option key={parent._id} value={parent._id}>
                              {parent.icon ? `${parent.icon} ` : ''}{parent.name}
                            </option>
                          ))}
                        </select>
                        {editingCategory.parentCategory && (
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ marginLeft: '8px' }}
                            onClick={() => setEditingCategory({ ...editingCategory, parentCategory: '' })}
                          >
                            {t('categories.removeParent', 'Xóa parent')}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>{t('categories.newImage', 'New Image')}</label>
                      <input
                        type="file"
                        onChange={(e) => setEditingCategory({ ...editingCategory, newImage: e.target.files[0] })}
                        accept="image/*"
                      />
                    </div>
                    <div className="edit-actions">
                      <button type="submit" className="btn-success" disabled={isLoading}>
                        {isLoading ? t('common.loading') : t('common.save')}
                      </button>
                      <button type="button" onClick={cancelEditing} className="btn-secondary">
                        {t('common.cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="category-image" style={{ position: 'relative' }}>
                      {loadingImages.has(category._id) && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}>
                          <div style={{ color: '#666', textAlign: 'center' }}>
                            <div style={{ marginBottom: '5px' }}>📥</div>
                            <div style={{ fontSize: '12px' }}>Đang tải...</div>
                          </div>
                        </div>
                      )}
                      <img 
                        src={
                          category.image && category.image.startsWith('http')
                            ? category.image
                            : category.image 
                              ? `${config.BACKEND_URL}${config.IMAGE_PATHS.CATEGORY}/${category.image}`
                              : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                        }
                        alt={category.name || 'Category'}
                        onLoadStart={() => {
                          setLoadingImages(prev => new Set([...prev, category._id]));
                        }}
                        onLoad={() => {
                          setLoadingImages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(category._id);
                            return newSet;
                          });
                          // Remove from error list if image loads successfully
                          setImageErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(category._id);
                            return newSet;
                          });
                        }}
                        onError={(e) => {
                          const originalSrc = e.target.src;
                          console.error('Category image failed to load:', originalSrc);
                          
                          // Add to error tracking
                          setImageErrors(prev => new Set([...prev, category._id]));
                          
                          // Show toast notification
                          toast.warning(`Hình ảnh category "${category.name}" bị lỗi hoặc không tải được`, {
                            toastId: `image-error-${category._id}` // Prevent duplicate toasts
                          });
                          
                          // Set fallback image with error styling
                          e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                              <rect width="300" height="200" fill="#ffebee" stroke="#ff6868" stroke-width="2" stroke-dasharray="5,5"/>
                              <text x="150" y="80" font-family="Arial" font-size="16" fill="#ff6868" text-anchor="middle" dy=".3em">⚠️ Hình ảnh lỗi</text>
                              <text x="150" y="100" font-family="Arial" font-size="12" fill="#ff6868" text-anchor="middle" dy=".3em">Không tải được</text>
                              <text x="150" y="120" font-family="Arial" font-size="10" fill="#999" text-anchor="middle" dy=".3em">Kiểm tra lại đường dẫn</text>
                            </svg>
                          `);
                          e.target.onerror = null;
                        }}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="category-content">
                      <div className="category-header">
                        <h3>
                          {category.name}
                          {imageErrors.has(category._id) && (
                            <span 
                              className="image-error-indicator" 
                              title="Hình ảnh bị lỗi hoặc không tải được"
                              style={{
                                marginLeft: '8px',
                                color: '#ff6868',
                                fontSize: '14px',
                                fontWeight: 'normal'
                              }}
                            >
                              ⚠️ Hình lỗi
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="category-description">{category.description || t('categories.noDescription', 'No description')}</p>
                      <div className="category-meta">
                        <span className="category-date">{new Date(category.createdAt).toLocaleDateString()}</span>
                        <span className="category-parent">
                          {parentInfo
                            ? `${t('categories.parentCategory', 'Parent Category')}: ${parentInfo.icon ? `${parentInfo.icon} ` : ''}${parentInfo.name}`
                            : t('categories.parentCategoryNone', 'Không có parent')}
                        </span>
                      </div>
                    </div>
                    <div className="category-actions">
                      <button onClick={() => startEditing(category)} className="btn-edit">
                        {t('common.edit')}
                      </button>
                      <button onClick={() => handleDeleteCategory(category._id)} className="btn-delete">
                        {t('common.delete')}
                      </button>
                    </div>
                  </>
                )}
              </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Category 