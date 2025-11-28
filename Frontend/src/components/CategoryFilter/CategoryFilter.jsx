import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './CategoryFilter.css'
import PropTypes from 'prop-types'

const CategoryFilter = ({
  categories = [],
  onCategorySelect,
  selectedCategory,
  categoryRefs = {},
}) => {
  const scrollContainerRef = useRef(null)
  const categoryButtonRefs = useRef({})
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const activeCategoryIdRef = useRef(null)
  const isScrollingRef = useRef(false)
  const [scrollState, setScrollState] = useState({
    hasPrev: false,
    hasNext: false,
    isOverflowing: false,
  })

  // Flatten all categories from menu sections
  const allCategories = categories.flatMap((section) =>
    section.categories.map((cat) => ({
      ...cat,
      sectionId: section._id,
      sectionName: section.localizedName,
    }))
  )

  const getStickyHeaderHeight = useCallback(() => {
    const filterContainer = document.querySelector('.menu-filter-container')
    if (filterContainer) {
      const rect = filterContainer.getBoundingClientRect()
      const styles = window.getComputedStyle(filterContainer)
      const marginTop = parseFloat(styles.marginTop || 0)
      const marginBottom = parseFloat(styles.marginBottom || 0)
      return rect.height + marginTop + marginBottom
    }

    return window.innerWidth <= 768 ? 180 : 160
  }, [])

  const updateScrollIndicators = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const canScroll = scrollWidth > clientWidth + 1

    setScrollState({
      hasPrev: canScroll && scrollLeft > 8,
      hasNext: canScroll && scrollLeft + clientWidth < scrollWidth - 8,
      isOverflowing: canScroll,
    })
  }, [])

  // Scroll category button into view in the carousel
  const scrollCategoryIntoView = useCallback(
    (categoryId) => {
      const buttonRef = categoryButtonRefs.current[categoryId]
      if (buttonRef && scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const buttonRect = buttonRef.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        const scrollLeft = container.scrollLeft
        const buttonLeft = buttonRect.left - containerRect.left + scrollLeft
        const buttonRight = buttonLeft + buttonRect.width
        const containerWidth = containerRect.width

        // Scroll if button is outside visible area
        if (buttonLeft < scrollLeft) {
          container.scrollTo({
            left: buttonLeft - 16,
            behavior: 'smooth',
          })
          requestAnimationFrame(updateScrollIndicators)
        } else if (buttonRight > scrollLeft + containerWidth) {
          container.scrollTo({
            left: buttonRight - containerWidth + 16,
            behavior: 'smooth',
          })
          requestAnimationFrame(updateScrollIndicators)
        }
      }
    },
    [updateScrollIndicators]
  )

  const handleCarouselScroll = useCallback(() => {
    updateScrollIndicators()
  }, [updateScrollIndicators])

  const categoryKeySignature = useMemo(
    () => allCategories.map((cat) => cat.key).join('|'),
    [allCategories]
  )

  const categoryMetaById = useMemo(() => {
    const map = new Map()
    allCategories.forEach((cat) => {
      if (cat?.key) {
        map.set(cat.key, cat)
      }
    })
    return map
  }, [allCategories])

  useEffect(() => {
    updateScrollIndicators()

    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleCarouselScroll, { passive: true })
    window.addEventListener('resize', updateScrollIndicators)

    return () => {
      container.removeEventListener('scroll', handleCarouselScroll)
      window.removeEventListener('resize', updateScrollIndicators)
    }
  }, [handleCarouselScroll, updateScrollIndicators])

  // Intersection observer to detect which category header is visible
  useEffect(() => {
    const refs = categoryRefs?.current || categoryRefs
    if (!refs || Object.keys(refs).length === 0) return

    const observedHeaders = new Set()
    let observer

    const cleanupObserverTargets = () => {
      observedHeaders.forEach((header) => {
        observer?.unobserve(header)
      })
      observedHeaders.clear()
    }

    const setupObserver = () => {
      cleanupObserverTargets()
      observer?.disconnect()

      const stickyHeaderHeight = getStickyHeaderHeight()
      observer = new IntersectionObserver(
        (entries) => {
          if (isScrollingRef.current) return

          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

          const nextCategory = visibleEntries[0]?.target?.dataset?.categoryId
          if (nextCategory && nextCategory !== activeCategoryIdRef.current) {
            activeCategoryIdRef.current = nextCategory
            setActiveCategoryId(nextCategory)
            scrollCategoryIntoView(nextCategory)

            const meta = categoryMetaById.get(nextCategory)
            if (meta && onCategorySelect) {
              onCategorySelect({
                id: nextCategory,
                label: meta.localizedName || meta.name,
                source: 'scroll',
              })
            }
          }
        },
        {
          root: null,
          rootMargin: `-${stickyHeaderHeight + 4}px 0px -70% 0px`,
          threshold: [0, 0.25, 0.5, 0.75, 1],
        }
      )

      Object.entries(refs).forEach(([categoryId, refObj]) => {
        const categoryElement = refObj?.current
        if (!categoryElement) return
        const categoryHeader = categoryElement.querySelector('.menu-category-header')
        if (!categoryHeader) return
        categoryHeader.dataset.categoryId = categoryId
        observer.observe(categoryHeader)
        observedHeaders.add(categoryHeader)
      })
    }

    const handleResize = () => {
      requestAnimationFrame(setupObserver)
    }

    setupObserver()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cleanupObserverTargets()
      observer?.disconnect()
    }
  }, [categoryRefs, categoryKeySignature, scrollCategoryIntoView, getStickyHeaderHeight, categoryMetaById, onCategorySelect])

  const handleCategoryClick = (category) => {
    isScrollingRef.current = true
    activeCategoryIdRef.current = category.key
    setActiveCategoryId(category.key)

    if (onCategorySelect) {
      onCategorySelect({ id: category.key, label: category.localizedName, source: 'click' })
    }

    const refs = categoryRefs?.current || categoryRefs
    const target = refs?.[category.key]
    if (target && target.current) {
      const offset = getStickyHeaderHeight()
      const top = target.current.getBoundingClientRect().top + window.pageYOffset - offset

      window.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth',
      })
    }

    requestAnimationFrame(updateScrollIndicators)

    setTimeout(() => {
      isScrollingRef.current = false
    }, 1000)
  }

  const handleNavClick = (direction) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = window.innerWidth <= 768 ? 220 : 320
    container.scrollBy({
      left: direction === 'prev' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (selectedCategory?.id && selectedCategory.id !== activeCategoryId) {
      activeCategoryIdRef.current = selectedCategory.id
      setActiveCategoryId(selectedCategory.id)
      scrollCategoryIntoView(selectedCategory.id)
    }
  }, [selectedCategory, activeCategoryId, scrollCategoryIntoView])

  useEffect(() => {
    updateScrollIndicators()
  }, [allCategories.length, updateScrollIndicators])

  if (allCategories.length === 0) {
    return null
  }

  const activeCategory = allCategories.find((cat) => cat.key === activeCategoryId)

  return (
    <section className="category-filter">
      <div className="category-filter-header">
        <div className="category-filter-copy">
          <p className="eyebrow">Browse menu</p>
          <h3>Find what you are craving</h3>
        </div>
        <div className="category-filter-meta">
          <span className="active-label">
            {activeCategory?.localizedName || selectedCategory?.label || 'All categories'}
          </span>
          {scrollState.isOverflowing && (
            <div className="category-filter-nav">
              <button
                type="button"
                className="nav-button"
                onClick={() => handleNavClick('prev')}
                disabled={!scrollState.hasPrev}
                aria-label="Scroll categories left"
              >
                ‹
              </button>
              <button
                type="button"
                className="nav-button"
                onClick={() => handleNavClick('next')}
                disabled={!scrollState.hasNext}
                aria-label="Scroll categories right"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="category-carousel-shell">
        {scrollState.hasPrev && <span className="fade-edge left" aria-hidden="true" />}
        <div className="category-carousel-container" ref={scrollContainerRef}>
          {allCategories.map((category) => {
            const isActive = activeCategoryId === category.key || selectedCategory?.id === category.key

            return (
              <button
                key={category.key}
                ref={(el) => {
                  if (el) {
                    categoryButtonRefs.current[category.key] = el
                  }
                }}
                className={`category-chip ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="category-chip-label">{category.localizedName}</span>
                {category.sectionName && (
                  <span className="category-chip-section">{category.sectionName}</span>
                )}
              </button>
            )
          })}
        </div>
        {scrollState.hasNext && <span className="fade-edge right" aria-hidden="true" />}
      </div>
    </section>
  )
}

export default CategoryFilter

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      localizedName: PropTypes.string,
      categories: PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string,
          localizedName: PropTypes.string,
        })
      ),
    })
  ),
  onCategorySelect: PropTypes.func,
  selectedCategory: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  categoryRefs: PropTypes.object,
}
