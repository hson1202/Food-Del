import React, { useState, useEffect, useContext, useMemo } from 'react';
import './Menu.css';
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import ProductDetail from '../../components/ProductDetail/ProductDetail';
import CartPopup from '../../components/CartPopup/CartPopup';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import InfiniteScroll from '../../components/InfiniteScroll/InfiniteScroll';
import { SkeletonGrid } from '../../components/Skeleton/Skeleton';
import useDebounce from '../../hooks/useDebounce';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import config from '../../config/config';
import { isFoodAvailable } from '../../utils/timeUtils';

const Menu = () => {
  const { 
    food_list, 
    cartItems, 
    getTotalCartAmount, 
    isLoadingFood,
    foodPagination,
    loadMoreFood,
    fetchFoodList
  } = useContext(StoreContext);
  
  const { i18n, t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Debounce search term để tránh filter quá nhiều lần
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchCategories();
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/category`);
      setCategories(response.data.data || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t('errors.failedToLoadCategories'));
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const scrollTop = window.pageYOffset;
    setIsSticky(scrollTop > 200);
  };

  // Memoize filtered foods để tránh re-calculate mỗi render
  const filteredFoods = useMemo(() => {
    return food_list.filter(food => {
      // Filter by availability (weekly/day/time/date)
      const matchesAvailability = isFoodAvailable(food);

      // Filter by category
      const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
      
      // Filter by search term
      const matchesSearch = !debouncedSearchTerm || 
        food.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        food.nameVI?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        food.nameEN?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        food.nameSK?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        food.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      return matchesAvailability && matchesCategory && matchesSearch;
    });
  }, [food_list, selectedCategory, debouncedSearchTerm]);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const openCartPopup = () => {
    setShowCartPopup(true);
  };

  const closeCartPopup = () => {
    setShowCartPopup(false);
  };

  // Handle load more for infinite scroll
  const handleLoadMore = () => {
    if (foodPagination?.hasMore && !isLoadingFood) {
      console.log('📥 Loading more food items...');
      loadMoreFood();
    }
  };

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <div className="menu-hero">
        <div className="menu-hero-content">
          <h1>{t('menu.title')}</h1>
          <p>{t('menu.subtitle')}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className={`menu-categories ${isSticky ? 'sticky' : ''}`}>
        <ExploreMenu 
          category={selectedCategory} 
          setCategory={setSelectedCategory}
          categories={categories}
        />
      </div>

      {/* Search Bar */}
      <div className="menu-search">
        <input
          type="text"
          placeholder={t('menu.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Food Grid with Infinite Scroll */}
      <div className="menu-content">
        {loading || (isLoadingFood && food_list.length === 0) ? (
          <SkeletonGrid count={8} />
        ) : filteredFoods.length === 0 ? (
          <div className="no-results">
            <p>{t('menu.noResults')}</p>
          </div>
        ) : (
          <InfiniteScroll
            onLoadMore={handleLoadMore}
            hasMore={foodPagination?.hasMore || false}
            isLoading={isLoadingFood}
            threshold={300}
          >
            <div className="food-grid">
              {filteredFoods.map((food) => (
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
          </InfiniteScroll>
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
  );
};

export default Menu;

