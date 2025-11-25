import React, { useState, useEffect } from 'react'
import './ParentCategory.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import '../../i18n'
import config from '../../config/config'

const ParentCategory = ({ url }) => {
  const { t } = useTranslation();
  const [parentCategories, setParentCategories] = useState([])
  const [newParentCategory, setNewParentCategory] = useState({ 
    name: '', 
    nameVI: '', 
    nameEN: '', 
    nameSK: '', 
    description: '', 
    icon: '',
    image: null 
  })
  const [editingParentCategory, setEditingParentCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [loadingImages, setLoadingImages] = useState(new Set())

  useEffect(() => {
    fetchParentCategories()
  }, [])

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Try again</button>
      </div>
    )
  }

  const fetchParentCategories = async (showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        toast.info('🔄 Đang tải lại parent categories...', { autoClose: 1000 })
      }
      
      const apiUrl = `${config.BACKEND_URL}/api/parent-category/admin/all`
      const response = await axios.get(apiUrl)
      const data = response.data.data || response.data
      setParentCategories(data)
      
      if (showLoadingToast) {
        toast.success(`✅ Đã tải lại ${data.length} parent categories`, { autoClose: 2000 })
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error)
      setError(error)
      toast.error('Failed to fetch parent categories')
    }
  }

  const handleAddParentCategory = async (e) => {
    e.preventDefault()
    if (!newParentCategory.name.trim()) {
      toast.error('Parent category name is required')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', newParentCategory.name)
      formData.append('nameVI', newParentCategory.nameVI || newParentCategory.name)
      formData.append('nameEN', newParentCategory.nameEN || newParentCategory.name)
      formData.append('nameSK', newParentCategory.nameSK || newParentCategory.name)
      formData.append('description', newParentCategory.description)
      formData.append('icon', newParentCategory.icon)
      if (newParentCategory.image) {
        formData.append('image', newParentCategory.image)
      }

      const apiUrl = `${config.BACKEND_URL}/api/parent-category`
      await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      })
      toast.success('Parent category added successfully')
      setNewParentCategory({ 
        name: '', 
        nameVI: '', 
        nameEN: '', 
        nameSK: '', 
        description: '', 
        icon: '',
        image: null 
      })
      fetchParentCategories()
    } catch (error) {
      console.error('Error adding parent category:', error)
      setError(error)
      toast.error(error.response?.data?.message || 'Failed to add parent category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0]
      if (file) {
        setNewParentCategory({ ...newParentCategory, image: file })
      }
    } catch (error) {
      console.error('Error handling image change:', error)
      setError(error)
    }
  }

  const handleEditParentCategory = async (e) => {
    e.preventDefault()
    if (!editingParentCategory.name.trim()) {
      toast.error('Parent category name is required')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', editingParentCategory.name)
      formData.append('nameVI', editingParentCategory.nameVI || editingParentCategory.name)
      formData.append('nameEN', editingParentCategory.nameEN || editingParentCategory.name)
      formData.append('nameSK', editingParentCategory.nameSK || editingParentCategory.name)
      formData.append('description', editingParentCategory.description)
      formData.append('icon', editingParentCategory.icon)
      if (editingParentCategory.newImage) {
        formData.append('image', editingParentCategory.newImage)
      }

      await axios.put(`${config.BACKEND_URL}/api/parent-category/${editingParentCategory._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Parent category updated successfully')
      setEditingParentCategory(null)
      fetchParentCategories()
    } catch (error) {
      console.error('Error updating parent category:', error)
      setError(error)
      toast.error(error.response?.data?.message || 'Failed to update parent category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteParentCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this parent category?')) {
      try {
        await axios.delete(`${config.BACKEND_URL}/api/parent-category/${categoryId}`)
        toast.success('Parent category deleted successfully')
        fetchParentCategories()
      } catch (error) {
        console.error('Error deleting parent category:', error)
        setError(error)
        toast.error(error.response?.data?.message || 'Failed to delete parent category')
      }
    }
  }

  const handleToggleStatus = async (categoryId) => {
    try {
      await axios.put(`${config.BACKEND_URL}/api/parent-category/${categoryId}/toggle`)
      toast.success('Parent category status updated')
      fetchParentCategories()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Failed to update status')
    }
  }

  const startEditing = (category) => {
    try {
      setEditingParentCategory({ ...category, newImage: null })
    } catch (error) {
      console.error('Error starting edit:', error)
      setError(error)
    }
  }

  const cancelEditing = () => {
    try {
      setEditingParentCategory(null)
    } catch (error) {
      console.error('Error canceling edit:', error)
      setError(error)
    }
  }

  return (
    <div className='parent-category-page'>
      <div className="category-header">
        <div className="header-content">
          <h1>Parent Categories</h1>
          <p>Manage parent categories (top-level groups)</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => fetchParentCategories(true)}>
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* Add Parent Category Form */}
      <div className="add-category-section" id="add-category-form">
        <h2>Add New Parent Category</h2>
        <form onSubmit={handleAddParentCategory} className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={newParentCategory.name}
                onChange={(e) => setNewParentCategory({ ...newParentCategory, name: e.target.value })}
                placeholder="Enter parent category name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="icon">Icon (Emoji)</label>
              <input
                type="text"
                id="icon"
                value={newParentCategory.icon}
                onChange={(e) => setNewParentCategory({ ...newParentCategory, icon: e.target.value })}
                placeholder="🍣 🥤 🍜"
                maxLength="2"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nameVI">Name (Vietnamese)</label>
              <input
                type="text"
                id="nameVI"
                value={newParentCategory.nameVI}
                onChange={(e) => setNewParentCategory({ ...newParentCategory, nameVI: e.target.value })}
                placeholder="Tên tiếng Việt"
              />
            </div>
            <div className="form-group">
              <label htmlFor="nameEN">Name (English)</label>
              <input
                type="text"
                id="nameEN"
                value={newParentCategory.nameEN}
                onChange={(e) => setNewParentCategory({ ...newParentCategory, nameEN: e.target.value })}
                placeholder="English name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="nameSK">Name (Slovak)</label>
              <input
                type="text"
                id="nameSK"
                value={newParentCategory.nameSK}
                onChange={(e) => setNewParentCategory({ ...newParentCategory, nameSK: e.target.value })}
                placeholder="Slovak name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newParentCategory.description}
              onChange={(e) => setNewParentCategory({ ...newParentCategory, description: e.target.value })}
              placeholder="Enter description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Add Parent Category'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setNewParentCategory({ 
              name: '', 
              nameVI: '', 
              nameEN: '', 
              nameSK: '', 
              description: '', 
              icon: '',
              image: null 
            })}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Parent Categories List */}
      <div className="categories-section">
        <h2>Parent Categories List</h2>
        {parentCategories.length === 0 ? (
          <div className="empty-state">
            <h3>No Parent Categories Found</h3>
            <p>Start by adding your first parent category</p>
          </div>
        ) : (
          <div className="categories-container">
            <div className="categories-grid" id="categoriesGrid">
              {parentCategories.map((category) => (
                <div key={category._id} className="category-card">
                  {editingParentCategory && editingParentCategory._id === category._id ? (
                    <form onSubmit={handleEditParentCategory} className="edit-form">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={editingParentCategory.name}
                          onChange={(e) => setEditingParentCategory({ ...editingParentCategory, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Icon</label>
                        <input
                          type="text"
                          value={editingParentCategory.icon || ''}
                          onChange={(e) => setEditingParentCategory({ ...editingParentCategory, icon: e.target.value })}
                          maxLength="2"
                        />
                      </div>
                      <div className="form-group">
                        <label>Name VI</label>
                        <input
                          type="text"
                          value={editingParentCategory.nameVI || ''}
                          onChange={(e) => setEditingParentCategory({ ...editingParentCategory, nameVI: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Name EN</label>
                        <input
                          type="text"
                          value={editingParentCategory.nameEN || ''}
                          onChange={(e) => setEditingParentCategory({ ...editingParentCategory, nameEN: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Name SK</label>
                        <input
                          type="text"
                          value={editingParentCategory.nameSK || ''}
                          onChange={(e) => setEditingParentCategory({ ...editingParentCategory, nameSK: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={editingParentCategory.description || ''}
                          onChange={(e) => setEditingParentCategory({ ...editingParentCategory, description: e.target.value })}
                          rows="2"
                        />
                      </div>
                      <div className="form-group">
                        <label>New Image</label>
                        <input
                          type="file"
                          onChange={(e) => setEditingParentCategory({ ...editingParentCategory, newImage: e.target.files[0] })}
                          accept="image/*"
                        />
                      </div>
                      <div className="edit-actions">
                        <button type="submit" className="btn-success" disabled={isLoading}>
                          {isLoading ? 'Loading...' : 'Save'}
                        </button>
                        <button type="button" onClick={cancelEditing} className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="category-image" style={{ position: 'relative' }}>
                        <img 
                          src={
                            category.image && category.image.startsWith('http')
                              ? category.image
                              : category.image 
                                ? `${config.BACKEND_URL}/images/${category.image}`
                                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                          }
                          alt={category.name || 'Parent Category'}
                          style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="category-content">
                        <div className="category-header">
                          <h3>
                            {category.icon && <span style={{ marginRight: '8px' }}>{category.icon}</span>}
                            {category.name}
                          </h3>
                          <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="category-description">{category.description || 'No description'}</p>
                        <div className="category-meta">
                          <div><strong>VI:</strong> {category.nameVI || category.name}</div>
                          <div><strong>EN:</strong> {category.nameEN || category.name}</div>
                          <div><strong>SK:</strong> {category.nameSK || category.name}</div>
                          {category.categories && (
                            <div><strong>Sub-categories:</strong> {category.categories.length}</div>
                          )}
                        </div>
                      </div>
                      <div className="category-actions">
                        <button onClick={() => startEditing(category)} className="btn-edit">
                          Edit
                        </button>
                        <button onClick={() => handleToggleStatus(category._id)} className={`btn-toggle ${category.isActive ? 'btn-deactivate' : 'btn-activate'}`}>
                          {category.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteParentCategory(category._id)} className="btn-delete">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentCategory

