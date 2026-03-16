import React, { useState, useEffect, useContext } from 'react'
import './DailyMenu.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
import ProductDetail from '../ProductDetail/ProductDetail'
import { useTranslation } from 'react-i18next'

const TOTAL_DAYS = 7
const DAY_TABS = [
  { id: 1, name: { sk: 'Pondelok', en: 'Monday', vi: 'Thứ Hai' }, short: { sk: 'Po', en: 'Mon', vi: 'T2' } },
  { id: 2, name: { sk: 'Utorok', en: 'Tuesday', vi: 'Thứ Ba' }, short: { sk: 'Ut', en: 'Tue', vi: 'T3' } },
  { id: 3, name: { sk: 'Streda', en: 'Wednesday', vi: 'Thứ Tư' }, short: { sk: 'St', en: 'Wed', vi: 'T4' } },
  { id: 4, name: { sk: 'Štvrtok', en: 'Thursday', vi: 'Thứ Năm' }, short: { sk: 'Št', en: 'Thu', vi: 'T5' } },
  { id: 5, name: { sk: 'Piatok', en: 'Friday', vi: 'Thứ Sáu' }, short: { sk: 'Pi', en: 'Fri', vi: 'T6' } },
  { id: 6, name: { sk: 'Sobota', en: 'Saturday', vi: 'Thứ Bảy' }, short: { sk: 'So', en: 'Sat', vi: 'T7' } },
  { id: 0, name: { sk: 'Nedeľa', en: 'Sunday', vi: 'Chủ Nhật' }, short: { sk: 'Ne', en: 'Sun', vi: 'CN' } }
]

const normalizeLegacyDayOfWeek = (dayOfWeek) => {
  const parsed = Number(dayOfWeek)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) return null
  // Legacy format was Monday=0..Sunday=6. Convert to JS format Sunday=0..Saturday=6.
  return parsed === 6 ? 0 : parsed + 1
}

const isWithinDateRange = (item) => {
  const now = new Date()
  if (item.availableFrom) {
    const from = new Date(item.availableFrom)
    if (!Number.isNaN(from.getTime()) && now < from) return false
  }
  if (item.availableTo) {
    const to = new Date(item.availableTo)
    if (!Number.isNaN(to.getTime()) && now > to) return false
  }
  return true
}

const isWithinDailyTimeRange = (item) => {
  if (!item.dailyAvailability?.enabled) return true

  const { timeFrom, timeTo } = item.dailyAvailability
  if (!timeFrom || !timeTo) return true

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return currentTime >= timeFrom && currentTime <= timeTo
}

const isAvailableOnDay = (item, dayId) => {
  if (item.weeklySchedule?.enabled) {
    const days = Array.isArray(item.weeklySchedule.days)
      ? item.weeklySchedule.days.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      : []
    return days.length > 0 && days.includes(dayId)
  }

  if (item.dayOfWeek !== undefined && item.dayOfWeek !== null) {
    const normalizedLegacyDay = normalizeLegacyDayOfWeek(item.dayOfWeek)
    return normalizedLegacyDay !== null && normalizedLegacyDay === dayId
  }

  // No weekly config means show for all days.
  return true
}

const findNearestAvailableDay = (currentDay, itemsByDay) => {
  if (currentDay === null || currentDay === undefined) return currentDay
  if (itemsByDay[currentDay]?.length) return currentDay

  // Prefer the next day tab first, then fall back to previous tabs.
  for (let offset = 1; offset < TOTAL_DAYS; offset += 1) {
    const nextDay = (currentDay + offset) % TOTAL_DAYS
    if (itemsByDay[nextDay]?.length) {
      return nextDay
    }
  }

  for (let offset = 1; offset < TOTAL_DAYS; offset += 1) {
    const previousDay = (currentDay - offset + TOTAL_DAYS) % TOTAL_DAYS
    if (itemsByDay[previousDay]?.length) {
      return previousDay
    }
  }

  return currentDay
}

const DailyMenu = () => {
  const { food_list, isLoadingFood } = useContext(StoreContext)
  const { t, i18n } = useTranslation()
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [dailyMenuItems, setDailyMenuItems] = useState([])

  // Use JS native day index: 0=Sunday, 1=Monday, ..., 6=Saturday.
  useEffect(() => {
    setSelectedDay(new Date().getDay())
  }, [])

  // Filter daily menu items
  useEffect(() => {
    if (!food_list || food_list.length === 0) return

    // Filter items that belong to the daily menu:
    // - explicit menuType flag (future use)
    // - legacy "daily" category names
    // - any product with weekly schedule enabled (assigned to specific days)
    // - any product with daily time availability enabled
    const dailyItems = food_list.filter(food => {
      // Primary: explicit daily menu flags
      if (food.menuType === 'daily') return true
      if (food.weeklySchedule?.enabled === true) return true
      if (food.dailyAvailability?.enabled === true) return true
      // Legacy: category name matches (only relevant if category is stored as a name string)
      const cat = food.category || ''
      if (
        cat.toLowerCase().includes('daily') ||
        cat === 'DENNÉ MENU' ||
        cat === 'Daily Menu'
      ) return true
      return false
    }).filter(food => isWithinDateRange(food) && isWithinDailyTimeRange(food))

    if (selectedDay === null) {
      setDailyMenuItems(dailyItems)
      return
    }

    const itemsByDay = Array.from({ length: TOTAL_DAYS }, (_, dayIndex) =>
      dailyItems.filter((item) => isAvailableOnDay(item, dayIndex))
    )

    const resolvedDay = findNearestAvailableDay(selectedDay, itemsByDay)

    if (resolvedDay !== selectedDay) {
      setSelectedDay(resolvedDay)
      return
    }

    setDailyMenuItems(itemsByDay[resolvedDay] || [])
  }, [food_list, selectedDay, isLoadingFood])

  const days = DAY_TABS

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
    const menuNumber = item.menuNumber || item.name?.match(/Menu\s*(\d+)/i)?.[1] || 'Other'
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
      <div className="menu-categories-list">
        {isLoadingFood ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('dailyMenu.loading')}</p>
          </div>
        ) : dailyMenuItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>{t('dailyMenu.noItems')}</h3>
            <p>{t('dailyMenu.noItemsDesc')}</p>
          </div>
        ) : (
          Object.keys(groupedItems).map((menuNumber) => (
            <article key={menuNumber} className="menu-category-block">
              <div className="menu-category-header">
                <h2 className="menu-category-name">
                  {t('dailyMenu.menu')} {menuNumber}
                </h2>
              </div>
              <div className="menu-category-dishes">
                {groupedItems[menuNumber].map((item) => (
                  <div key={item._id} className="menu-category-item">
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
            </article>
          ))
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

