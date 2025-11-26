import { useState, useEffect, useContext, useRef } from 'react'
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

const ITEMS_PER_LOAD = 12

const Menu = () => {
  const { food_list, isLoadingFood } = useContext(StoreContext)
  const { i18n } = useTranslation()
  const [parentCategories, setParentCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('') // Category con được chọn từ filter
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCartPopup, setShowCartPopup] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD)
  const sectionsRef = useRef(null)

  useEffect(() => {
    fetchMenuStructure()
  }, [])

  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD)
  }, [selectedCategory, searchTerm, food_list])

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!selectedCategory || !sectionsRef.current) return
    const offset = isMobile ? 120 : 150
    const rect = sectionsRef.current.getBoundingClientRect()
    const target =
      rect.top + window.pageYOffset - offset < 0
        ? 0
        : rect.top + window.pageYOffset - offset

    window.scrollTo({
      top: target,
      behavior: 'smooth',
    })
  }, [selectedCategory, isMobile])


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


  // Filter foods based on selected parent category, selected category, and search
  const getFilteredFoods = () => {
    let filtered = food_list

    // Filter by selected category (category con)
    if (selectedCategory) {
      filtered = filtered.filter(food => food.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(food => {
        const localizedName = getLocalizedName(food)
        return (
          localizedName.toLowerCase().includes(searchLower) ||
          food.name.toLowerCase().includes(searchLower) ||
          food.description.toLowerCase().includes(searchLower)
        )
      })
    }

    return filtered
  }

  const filteredFoods = getFilteredFoods()
  const visibleFoods = filteredFoods.slice(0, visibleCount)

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
        <div className="menu-sections-container" ref={sectionsRef}>
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
        ) : (
          <>
            {/* Show all foods - simplified display */}
            {filteredFoods.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No dishes found</h3>
                <p>
                  {searchTerm || selectedCategory
                    ? `No dishes match your filter. Try a different search term or category.`
                    : 'No dishes available at the moment.'}
                </p>
                {(searchTerm || selectedCategory) && (
                  <button 
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('')
                    }}
                    className="reset-btn"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="food-grid">
                  {visibleFoods.map((food) => (
                    <div key={food._id} className="food-item-wrapper">
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

                {visibleCount < filteredFoods.length && (
                  <div className="load-more-container">
                    <button 
                      className="load-more-btn"
                      onClick={() => setVisibleCount(prev => prev + ITEMS_PER_LOAD)}
                    >
                      Read more dishes
                    </button>
                  </div>
                )}
              </>
            )}
          </>
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
