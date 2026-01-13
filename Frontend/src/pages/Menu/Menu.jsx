import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react'
import './Menu.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../../components/FoodItem/FoodItem'
import ProductDetail from '../../components/ProductDetail/ProductDetail'
import CartPopup from '../../components/CartPopup/CartPopup'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import config from '../../config/config'
import { isFoodAvailable } from '../../utils/timeUtils'

const Menu = () => {
  const { food_list, isLoadingFood } = useContext(StoreContext)
  const { t, i18n } = useTranslation()
  const [parentCategories, setParentCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedParentCategory, setSelectedParentCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCartPopup, setShowCartPopup] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const categoryRefs = useRef({})

  const getMenuStickyOffset = useCallback(() => {
    const filterContainer = document.querySelector('.menu-filter-container')
    if (filterContainer) {
      const rect = filterContainer.getBoundingClientRect()
      const styles = window.getComputedStyle(filterContainer)
      const marginTop = parseFloat(styles.marginTop || 0)
      const marginBottom = parseFloat(styles.marginBottom || 0)
      return rect.height + marginTop + marginBottom
    }

    return isMobile ? 180 : 160
  }, [isMobile])

  useEffect(() => {
    fetchMenuStructure()
  }, [])

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Tự động chọn parent category đầu tiên khi menu được load
  useEffect(() => {
    if (parentCategories.length > 0 && selectedParentCategory === null) {
      // Backend already sorted by sortOrder, so just use the first one
      const firstParent = parentCategories[0]
      const firstParentId = firstParent._id?.toString() || 'first'
      setSelectedParentCategory(firstParentId)
    }
  }, [parentCategories, selectedParentCategory])

  const fetchMenuStructure = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/category/menu-structure`)
      const menuData = response.data.data || []
      setParentCategories(menuData)
      
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching menu structure:', error)
      toast.error('Failed to load menu')
      setLoading(false)
    }
  }


  const getLocalizedName = useCallback((item, field = 'name') => {
    const currentLang = i18n.language
    const localizedField = `${field}${currentLang.toUpperCase()}`
    return item[localizedField] || item[field] || ''
  }, [i18n.language])


  const normalizeValue = (value) =>
    typeof value === 'string' ? value.trim().toLowerCase() : ''

  const doesFoodBelongToCategory = useCallback((food, category) => {
    if (!category) return false
    const categoryId = category._id?.toString()

    const possibleCategoryLabels = [
      category.name,
      category.nameEN,
      category.nameVI,
      category.nameSK,
      getLocalizedName(category),
    ]
      .filter(Boolean)
      .map(normalizeValue)

    const foodCategoryMatches =
      possibleCategoryLabels.includes(normalizeValue(food.category)) ||
      possibleCategoryLabels.includes(normalizeValue(food.categoryEN)) ||
      possibleCategoryLabels.includes(normalizeValue(food.categoryVI)) ||
      possibleCategoryLabels.includes(normalizeValue(food.categorySK))

    const foodCategoryId = food.categoryId?.toString()

    return (categoryId && foodCategoryId && categoryId === foodCategoryId) || foodCategoryMatches
  }, [getLocalizedName])

  const filteredFoods = useMemo(() => {
    const availableFoods = food_list.filter((food) => isFoodAvailable(food))
    if (!searchTerm) return availableFoods

    const searchLower = normalizeValue(searchTerm)
    return availableFoods.filter((food) => {
      const localizedName = getLocalizedName(food)
      const description = food.description || ''
      return (
        normalizeValue(localizedName).includes(searchLower) ||
        normalizeValue(food.name).includes(searchLower) ||
        normalizeValue(description).includes(searchLower)
      )
    })
  }, [food_list, searchTerm, getLocalizedName])

  // Backend already sorts by sortOrder, so we just use the order as received
  // No need to sort by createdAt anymore
  const menuSections = useMemo(() => {
    if (!parentCategories.length) return []

    const coveredFoodIds = new Set()

    // Use parentCategories directly as they're already sorted by backend
    const sections = parentCategories
      .map((parent) => {
        const localizedParentName = getLocalizedName(parent)
        // Use categories directly as they're already sorted by backend
        const categories = (parent.categories || [])
          .map((category) => {
            const categoryKey = category._id?.toString() || category.name || localizedParentName
            const foods = filteredFoods.filter((food) => {
              const belongs = doesFoodBelongToCategory(food, category)
              if (belongs) {
                coveredFoodIds.add(food._id)
              }
              return belongs
            })

            return {
              ...category,
              key: categoryKey,
              localizedName: getLocalizedName(category),
              foods,
            }
          })
          .filter((category) => category.foods.length > 0)

        const totalItems = categories.reduce((total, category) => total + category.foods.length, 0)

        if (!categories.length) {
          return null
        }

        return {
          ...parent,
          localizedName: localizedParentName,
          categories,
          totalItems,
        }
      })
      .filter(Boolean)

    const ungroupedFoods = filteredFoods.filter((food) => !coveredFoodIds.has(food._id))
    if (ungroupedFoods.length) {
      const fallbackGroupLabel = t('menu.miscGroup', { defaultValue: 'Chef’s picks' })
      const fallbackCategoryLabel = t('menu.miscCategory', { defaultValue: 'Popular now' })
      sections.push({
        _id: 'fallback',
        localizedName: fallbackGroupLabel,
        categories: [
          {
            key: 'fallback-category',
            localizedName: fallbackCategoryLabel,
            foods: ungroupedFoods,
          },
        ],
        totalItems: ungroupedFoods.length,
      })
    }

    // Filter by selected parent category if any
    if (selectedParentCategory) {
      return sections.filter(section => section._id === selectedParentCategory)
    }

    return sections
  }, [parentCategories, filteredFoods, selectedParentCategory, t, getLocalizedName, doesFoodBelongToCategory])

  useEffect(() => {
    if (!selectedCategory?.id || selectedCategory?.source === 'scroll') return
    const target = categoryRefs.current[selectedCategory.id]
    if (!target || !target.current) return

    // Offset includes: parent category filter + category carousel + some padding
    const offset = getMenuStickyOffset()
    const top = target.current.getBoundingClientRect().top + window.pageYOffset - offset

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    })
  }, [selectedCategory, isMobile, getMenuStickyOffset])

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
  }

  const closeProductDetail = () => {
    setSelectedProduct(null)
  }

  const closeCartPopup = () => {
    setShowCartPopup(false)
  }

  return (
    <div className="menu-page">
      {/* Sticky Filter Container */}
      <div className="menu-filter-container">
        {/* Parent Category Filter */}
          <div className="parent-category-container">
            {parentCategories.map((parent) => {
              const parentId = parent._id?.toString() || 'first'
              const isActive = selectedParentCategory === parentId
              return (
                <button
                  key={parentId}
                  className={`parent-category-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedParentCategory(parentId)
                    setSelectedCategory(null)
                  }}
                >
                  {parent.icon && <span className="parent-category-icon">{parent.icon}</span>}
                  {getLocalizedName(parent)}
                </button>
              )
            })}
          </div>
          
          {/* Separator Line */}
          <div className="menu-filter-separator"></div>

        {/* Category Filter Carousel */}
        <CategoryFilter 
          categories={menuSections}
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
          categoryRefs={categoryRefs}
        />
      </div>

      {/* Food Sections - Grouped by Parent Category */}
      <div className="menu-sections-container">
        {loading || isLoadingFood ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading delicious dishes...</p>
          </div>
        ) : parentCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No menu available</h3>
            <p>Please check back later.</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No dishes found</h3>
            <p>
              {searchTerm
                ? `No dishes match your search. Try a different keyword.`
                : 'No dishes available at the moment.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="reset-btn"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : menuSections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍱</div>
            <h3>No categories to show</h3>
            <p>We couldn’t match these dishes to any category.</p>
          </div>
        ) : (
          <div className="menu-categories-list">
            {menuSections.map((section) => (
              <div key={section._id} className="menu-parent-section">
                <div className="menu-parent-header">
                  {section.icon && <span className="menu-parent-icon">{section.icon}</span>}
                  <h1 className="menu-parent-name">{section.localizedName}</h1>
                </div>
                
                {section.categories.map((category) => (
                  <article
                    key={category.key}
                    ref={(node) => {
                      if (node) {
                        categoryRefs.current[category.key] = { current: node }
                      } else {
                        delete categoryRefs.current[category.key]
                      }
                    }}
                    data-category-id={category.key}
                    className="menu-category-block"
                    id={`category-${category.key}`}
                  >
                    <div className="menu-category-header">
                      <h2 className="menu-category-name">{category.localizedName}</h2>
                      {category.description && (
                        <p className="menu-category-description">{category.description}</p>
                      )}
                    </div>

                  <div className="menu-category-dishes">
                    {category.foods.map((food) => (
                      <div key={food._id} className="menu-category-item">
                        <FoodItem 
                          id={food._id} 
                          name={food.name}
                          nameVI={food.nameVI}
                          nameEN={food.nameEN}
                          nameSK={food.nameSK}
                          description={food.description} 
                          price={food.price} 
                          image={food.image}
                          sku={food.sku}
                          isPromotion={food.isPromotion}
                          originalPrice={food.originalPrice}
                          promotionPrice={food.promotionPrice}
                          soldCount={food.soldCount}
                          likes={food.likes}
                          options={food.options}
                          availableFrom={food.availableFrom}
                          availableTo={food.availableTo}
                          dailyAvailability={food.dailyAvailability}
                          weeklySchedule={food.weeklySchedule}
                          onViewDetails={handleViewDetails}
                          compact={isMobile}
                        />
                      </div>
                    ))}
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Popup */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct}
          onClose={closeProductDetail}
        />
      )}

      {/* Cart Popup */}
      {showCartPopup && (
        <CartPopup 
          onClose={closeCartPopup}
        />
      )}
    </div>
  )
}

export default Menu
