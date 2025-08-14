import React, { useState, useEffect } from 'react'
import './Category.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import '../../i18n'

const Category = ({ url }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image: null })
  const [editingCategory, setEditingCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category/admin`)
      const categoriesData = response.data.data || response.data
      console.log('Categories fetched:', categoriesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error(t('categories.fetchError', 'Failed to fetch categories'))
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
      if (newCategory.image) {
        formData.append('image', newCategory.image)
      }

      await axios.post(`${url}/api/category`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success(t('categories.addSuccess', 'Category added successfully'))
      setNewCategory({ name: '', description: '', image: null })
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error(error.response?.data?.message || t('categories.addError', 'Failed to add category'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewCategory({ ...newCategory, image: file })
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
      if (editingCategory.newImage) {
        formData.append('image', editingCategory.newImage)
      }

      await axios.put(`${url}/api/category/${editingCategory._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success(t('categories.updateSuccess', 'Category updated successfully'))
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error(error.response?.data?.message || t('categories.updateError', 'Failed to update category'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(t('categories.deleteConfirm', 'Are you sure you want to delete this category?'))) {
      try {
        await axios.delete(`${url}/api/category/${categoryId}`)
        toast.success(t('categories.deleteSuccess', 'Category deleted successfully'))
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error(t('categories.deleteError', 'Failed to delete category'))
      }
    }
  }

  const startEditing = (category) => {
    setEditingCategory({ ...category, newImage: null })
  }

  const cancelEditing = () => {
    setEditingCategory(null)
  }

  return (
    <div className='category-page'>
      <div className="category-header">
        <div>
          <h1>{t('categories.title')}</h1>
          <p>{t('categories.subtitle', 'Manage your food categories')}</p>
        </div>
      
      </div>

      {/* Add Category Form */}
      <div className="add-category-section" id="add-category-form">
        <h2>{t('categories.addNew')}</h2>
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
            <button type="button" className="btn-secondary" onClick={() => setNewCategory({ name: '', description: '', image: null })}>
              {t('common.clear')}
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="categories-section">
        <h2>{t('categories.list', 'Categories List')}</h2>
        {categories.length === 0 ? (
          <div className="empty-state">
            <h3>{t('categories.noCategoriesTitle', 'No Categories Found')}</h3>
            <p>{t('categories.noCategories', 'Start by adding your first category')}</p>
          </div>
        ) : (
                    <div className="categories-container">
            <div className="categories-grid" id="categoriesGrid">
              {categories.map((category) => {
                console.log('Rendering category:', category)
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
                    <div className="category-image">
                      <img 
                        src={
                          category.image && category.image.startsWith('http')
                            ? category.image
                            : category.image 
                              ? `${url}/images/${category.image}`
                              : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                        }
                        alt={category.name || 'Category'} 
                        onError={(e) => {
                          console.error('Category image failed to load:', e.target.src);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
                          e.target.onerror = null;
                        }}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="category-content">
                      <div className="category-header">
                        <h3>{category.name}</h3>
                      </div>
                      <p className="category-description">{category.description || t('categories.noDescription', 'No description')}</p>
                      <div className="category-meta">
                        <span className="category-date">{new Date(category.createdAt).toLocaleDateString()}</span>
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