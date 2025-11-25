import React, { useState, useEffect } from 'react'
import './CategoryFilter.css'
import axios from 'axios'
import config from '../../config/config'
import { useTranslation } from 'react-i18next'

const CategoryFilter = ({ onCategorySelect, selectedCategory }) => {
  const { i18n, t } = useTranslation()
  const [parentCategories, setParentCategories] = useState([])
  const [selectedParentCategory, setSelectedParentCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detect mobile and tablet
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width <= 768)
      setIsTablet(width > 768 && width <= 1024)
      // Auto expand only on desktop (>1024px)
      if (width > 1024) {
        setIsExpanded(true)
      } else {
        // Tablet and mobile: start collapsed
        setIsExpanded(false)
      }
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  useEffect(() => {
    fetchParentCategories()
  }, [])

  useEffect(() => {
    if (selectedParentCategory && parentCategories.length > 0) {
      fetchCategoriesByParent(selectedParentCategory)
    } else {
      // Khi chưa chọn danh mục cha, hiển thị tất cả categories
      fetchAllCategories()
    }
  }, [selectedParentCategory, parentCategories])

  const fetchAllCategories = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/category`)
      const allCategories = response.data.data || []
      setCategories(allCategories)
    } catch (error) {
      console.error('Error fetching all categories:', error)
      setCategories([])
    }
  }

  const fetchParentCategories = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/parent-category`)
      const data = response.data.data || []
      setParentCategories(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching parent categories:', error)
      setLoading(false)
    }
  }

  const fetchCategoriesByParent = async (parentId) => {
    try {
      // Find parent category from already loaded data
      const parentCategory = parentCategories.find(pc => 
        (pc._id?.toString() || 'first') === parentId
      )
      
      if (parentCategory && parentCategory.categories) {
        // Use categories from parentCategory object (already populated from API)
        setCategories(parentCategory.categories)
      } else {
        // Fallback: fetch all categories and filter
        const response = await axios.get(`${config.BACKEND_URL}/api/category`)
        const allCategories = response.data.data || []
        
        // Filter by parentCategory field
        const filtered = allCategories.filter(cat => {
          if (cat.parentCategory) {
            // If parentCategory is populated object
            return cat.parentCategory._id?.toString() === parentId
          }
          // If parentCategory is just ID string
          return cat.parentCategory?.toString() === parentId
        })
        setCategories(filtered)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const getLocalizedName = (item, field = 'name') => {
    const currentLang = i18n.language
    const localizedField = `${field}${currentLang.toUpperCase()}`
    return item[localizedField] || item[field] || ''
  }

  const handleParentCategoryChange = (e) => {
    const parentId = e.target.value
    setSelectedParentCategory(parentId)
    // Reset selected category when parent changes
    if (onCategorySelect) {
      onCategorySelect('')
    }
  }

  const handleCategoryClick = (categoryName) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName)
    }
    // Tự động ẩn filter sau khi chọn (chỉ trên mobile/tablet)
    if (isMobile || isTablet) {
      setTimeout(() => {
        setIsExpanded(false)
      }, 300) // Delay 300ms để user thấy được feedback
    }
  }

  const clearFilter = () => {
    setSelectedParentCategory('')
    setCategories([])
    if (onCategorySelect) {
      onCategorySelect('')
    }
  }

  if (loading) {
    return (
      <div className="category-filter">
        <div className="filter-loading">{t('filter.loading')}</div>
      </div>
    )
  }

  return (
    <div className={`category-filter ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filter-header">
        <div className="filter-header-left">
          <h3>{t('filter.title')}</h3>
          {selectedCategory && (
            <span className="filter-badge">{selectedCategory}</span>
          )}
        </div>
        <div className="filter-header-right">
          {(isMobile || isTablet) && (
            <button 
              className="toggle-filter-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? t('filter.hide') : t('filter.show')}
              title={isExpanded ? t('filter.hide') : t('filter.show')}
            >
              <span className="toggle-icon">{isExpanded ? '▼' : '☰'}</span>
            </button>
          )}
          {(selectedParentCategory || selectedCategory) && (
            <button className="clear-filter-btn" onClick={clearFilter} title={t('filter.clear')}>
              <span className="clear-icon">✕</span>
            </button>
          )}
        </div>
      </div>


      {/* Filter content - hidden when collapsed on mobile/tablet */}
      <div className={`filter-content ${(isMobile || isTablet) && !isExpanded ? 'hidden' : ''}`}>

        {/* Step 1: Chọn danh mục cha (optional) */}
        <div className="filter-step">
          <label className="filter-label">
            {t('filter.selectParentCategory')}
          </label>
          <select
            className="filter-select"
            value={selectedParentCategory}
            onChange={handleParentCategoryChange}
          >
            <option value="">{t('filter.allCategories')}</option>
            {parentCategories.map((parent) => {
              const parentId = parent._id?.toString() || 'first'
              return (
                <option key={parentId} value={parentId}>
                  {parent.icon && `${parent.icon} `}
                  {getLocalizedName(parent)}
                </option>
              )
            })}
          </select>
        </div>

        {/* Step 2: Hiển thị danh sách category con */}
        {categories.length > 0 && (
          <div className="filter-step">
            <label className="filter-label">
              {selectedParentCategory ? t('filter.selectSubcategory') : t('filter.selectCategory')}
            </label>
            <div className="category-list">
              {categories.map((category) => {
                const categoryName = category.name || category
                const isSelected = selectedCategory === categoryName
                
                return (
                  <button
                    key={category._id || categoryName}
                    className={`category-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(categoryName)}
                  >
                    {categoryName}
                    {isSelected && <span className="check-mark">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Hiển thị khi chưa có category con */}
        {selectedParentCategory && categories.length === 0 && (
          <div className="filter-message">
            <p>{t('filter.noSubcategories')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryFilter

