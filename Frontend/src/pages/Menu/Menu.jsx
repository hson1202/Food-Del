import { useState, useEffect, useContext, useMemo, useRef } from 'react'
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

// Load all hero images at once using Vite glob import
const HERO_IMAGES = import.meta.glob('../../assets/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' })

const Menu = () => {
  const { food_list, isLoadingFood } = useContext(StoreContext)
  const { t, i18n } = useTranslation()
  const [parentCategories, setParentCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCartPopup, setShowCartPopup] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const categoryRefs = useRef({})

  useEffect(() => {
    fetchMenuStructure()
  }, [])

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

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


  // Function to get localized name based on current language
  const getLocalizedName = (item, field = 'name') => {
    const currentLang = i18n.language
    const localizedField = `${field}${currentLang.toUpperCase()}`
    return item[localizedField] || item[field] || ''
  }


  const normalizeValue = (value) =>
    typeof value === 'string' ? value.trim().toLowerCase() : ''

  const doesFoodBelongToCategory = (food, category) => {
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
  }

  const filteredFoods = useMemo(() => {
    if (!searchTerm) return food_list

    const searchLower = normalizeValue(searchTerm)
    return food_list.filter((food) => {
      const localizedName = getLocalizedName(food)
      const description = food.description || ''
      return (
        normalizeValue(localizedName).includes(searchLower) ||
        normalizeValue(food.name).includes(searchLower) ||
        normalizeValue(description).includes(searchLower)
      )
    })
  }, [food_list, searchTerm, i18n.language])

  const sortByCreatedAt = (items = []) =>
    [...items].sort((a, b) => {
      const dateA = new Date(a?.createdAt || 0).getTime()
      const dateB = new Date(b?.createdAt || 0).getTime()
      return dateA - dateB
    })

  const menuSections = useMemo(() => {
    if (!parentCategories.length) return []

    const coveredFoodIds = new Set()

    const sections = sortByCreatedAt(parentCategories)
      .map((parent) => {
        const localizedParentName = getLocalizedName(parent)
        const categories = sortByCreatedAt(parent.categories || [])
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

    return sections
  }, [parentCategories, filteredFoods, t, i18n.language])

  useEffect(() => {
    if (!selectedCategory?.id) return
    const target = categoryRefs.current[selectedCategory.id]
    if (!target) return

    const offset = isMobile ? 90 : 140
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset

    window.scrollTo({
      top: top < 0 ? 0 : top,
      behavior: 'smooth',
    })
  }, [selectedCategory, isMobile])

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
  }

  const closeProductDetail = () => {
    setSelectedProduct(null)
  }

  const closeCartPopup = () => {
    setShowCartPopup(false)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <div className="menu-hero">
        <div className="hero-background">
          <img 
            src={
              HERO_IMAGES['../../assets/back10.jpg'] 
              ?? HERO_IMAGES['../../assets/header_img.png'] 
              ?? Object.values(HERO_IMAGES)[0]
            }
            alt="Menu background"
            className="hero-bg-image"
          />
        </div>
        
        <div className="hero-content">
          <div className="hero-text-section">
            <h1>Our Delicious Menu</h1>
            <p>Discover our amazing collection of dishes, carefully crafted to satisfy your cravings</p>
            
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search for your favorite dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button onClick={clearSearch} className="clear-search">
                    ✕
                  </button>
                )}
                <div className="search-icon">🔍</div>
              </div>
              {searchTerm && (
                <div className="search-results-info">
                  Found {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} for &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Category Filter Sidebar */}
      <div className="menu-filter-container">
        <div className="filter-sidebar">
          <CategoryFilter 
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
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
          <div className="menu-sections-list">
            {menuSections.map((section) => (
              <section className="menu-section" key={section._id}>
                <div className="menu-section-header">
                  <div className="menu-section-heading">
                    {section.icon && <span className="menu-section-icon">{section.icon}</span>}
                    <div>
                      <p className="menu-section-label">{section.localizedName}</p>
                      {section.description && (
                        <p className="menu-section-description">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="menu-section-count">
                    {section.totalItems} dish{section.totalItems !== 1 ? 'es' : ''}
                  </span>
                </div>

                <div className="menu-category-grid">
                  {section.categories.map((category) => (
                    <article
                      key={category.key}
                      ref={(node) => {
                        if (node) {
                          categoryRefs.current[category.key] = node
                        } else {
                          delete categoryRefs.current[category.key]
                        }
                      }}
                      className={`menu-category-block ${
                        selectedCategory?.id === category.key ? 'is-active' : ''
                      }`}
                      id={`category-${category.key}`}
                    >
                      <div className="menu-category-header">
                        <div>
                          <p className="menu-category-name">{category.localizedName}</p>
                          {category.description && (
                            <p className="menu-category-description">{category.description}</p>
                          )}
                        </div>
                        <span className="menu-category-count">
                          {category.foods.length} dish{category.foods.length !== 1 ? 'es' : ''}
                        </span>
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
                              onViewDetails={handleViewDetails}
                              compact={isMobile}
                            />
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        </div>
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
