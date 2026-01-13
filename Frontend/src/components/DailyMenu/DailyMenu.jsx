import React, { useState, useEffect, useContext } from 'react'
import './DailyMenu.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import ProductDetail from '../ProductDetail/ProductDetail'
import { useTranslation } from 'react-i18next'
import { isFoodAvailable } from '../../utils/timeUtils'

const DailyMenu = () => {
  const { food_list, isLoadingFood } = useContext(StoreContext)
  const { i18n } = useTranslation()
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [dailyMenuItems, setDailyMenuItems] = useState([])

  // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  useEffect(() => {
    const today = new Date().getDay()
    // Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
    const mondayBasedDay = today === 0 ? 6 : today - 1
    setSelectedDay(mondayBasedDay)
  }, [])

  // Filter daily menu items
  useEffect(() => {
    if (!food_list || food_list.length === 0) return

    // Filter items that have menuType === 'daily' or category contains 'Daily'
    const dailyItems = food_list.filter(food => {
      return food.menuType === 'daily' || 
             food.category?.toLowerCase().includes('daily') ||
             food.category === 'DENNÉ MENU' ||
             food.category === 'Daily Menu'
    }).filter(food => isFoodAvailable(food))

    // Group by day if items have dayOfWeek field
    if (selectedDay !== null) {
      const itemsForDay = dailyItems.filter(item => {
        if (item.dayOfWeek !== undefined) {
          return item.dayOfWeek === selectedDay
        }
        // If no dayOfWeek, show all daily items
        return true
      })
      setDailyMenuItems(itemsForDay)
    } else {
      setDailyMenuItems(dailyItems)
    }
  }, [food_list, selectedDay, isLoadingFood])

  const days = [
    { id: 0, name: { sk: 'Pondelok', en: 'Monday', vi: 'Thứ Hai' }, short: { sk: 'Po', en: 'Mon', vi: 'T2' } },
    { id: 1, name: { sk: 'Utorok', en: 'Tuesday', vi: 'Thứ Ba' }, short: { sk: 'Ut', en: 'Tue', vi: 'T3' } },
    { id: 2, name: { sk: 'Streda', en: 'Wednesday', vi: 'Thứ Tư' }, short: { sk: 'St', en: 'Wed', vi: 'T4' } },
    { id: 3, name: { sk: 'Štvrtok', en: 'Thursday', vi: 'Thứ Năm' }, short: { sk: 'Št', en: 'Thu', vi: 'T5' } },
    { id: 4, name: { sk: 'Piatok', en: 'Friday', vi: 'Thứ Sáu' }, short: { sk: 'Pi', en: 'Fri', vi: 'T6' } },
    { id: 5, name: { sk: 'Sobota', en: 'Saturday', vi: 'Thứ Bảy' }, short: { sk: 'So', en: 'Sat', vi: 'T7' } },
    { id: 6, name: { sk: 'Nedeľa', en: 'Sunday', vi: 'Chủ Nhật' }, short: { sk: 'Ne', en: 'Sun', vi: 'CN' } }
  ]

  const getDayName = (day) => {
    const lang = i18n.language
    return day.name[lang] || day.name.en
  }

  const getDayShort = (day) => {
    const lang = i18n.language
    return day.short[lang] || day.short.en
  }

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
  }

  const closeProductDetail = () => {
    setSelectedProduct(null)
  }

  // Group items by menu number (Menu 1, Menu 2, etc.)
  const groupedItems = dailyMenuItems.reduce((acc, item) => {
    const menuNumber = item.menuNumber || item.name.match(/Menu\s*(\d+)/i)?.[1] || 'Other'
    if (!acc[menuNumber]) {
      acc[menuNumber] = []
    }
    acc[menuNumber].push(item)
    return acc
  }, {})

  return (
    <div className="daily-menu-container">
      {/* Day Selector */}
      <div className="day-selector">
        {days.map((day) => (
          <button
            key={day.id}
            className={`day-button ${selectedDay === day.id ? 'active' : ''}`}
            onClick={() => setSelectedDay(day.id)}
          >
            <span className="day-short">{getDayShort(day)}</span>
            <span className="day-full">{getDayName(day)}</span>
          </button>
        ))}
      </div>

      {/* Daily Menu Content */}
      <div className="daily-menu-content">
        {isLoadingFood ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading daily menu...</p>
          </div>
        ) : dailyMenuItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No daily menu available</h3>
            <p>Daily menu items will appear here when available.</p>
          </div>
        ) : (
          <div className="daily-menu-items">
            {Object.keys(groupedItems).map((menuNumber) => (
              <div key={menuNumber} className="menu-group">
                <h3 className="menu-group-title">Menu {menuNumber}</h3>
                <div className="menu-items-grid">
                  {groupedItems[menuNumber].map((item) => (
                    <div key={item._id} className="menu-item-wrapper">
                      <FoodItem
                        id={item._id}
                        name={item.name}
                        nameVI={item.nameVI}
                        nameEN={item.nameEN}
                        nameSK={item.nameSK}
                        description={item.description}
                        price={item.price}
                        image={item.image}
                        sku={item.sku}
                        isPromotion={item.isPromotion}
                        originalPrice={item.originalPrice}
                        promotionPrice={item.promotionPrice}
                        soldCount={item.soldCount}
                        likes={item.likes}
                        options={item.options}
                        availableFrom={item.availableFrom}
                        availableTo={item.availableTo}
                        dailyAvailability={item.dailyAvailability}
                        weeklySchedule={item.weeklySchedule}
                        onViewDetails={handleViewDetails}
                        compact={false}
                      />
                    </div>
                  ))}
                </div>
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
    </div>
  )
}

export default DailyMenu

