import React from 'react'
import './ExploreMenu.css'

const ExploreMenu = ({category, setCategory, categories, loading}) => {
  if (loading) {
    return (
      <div className='explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
        <div className='explore-menu-list'>
          <div className='loading-categories'>Loading categories...</div>
        </div>
        <hr></hr>
      </div>
    )
  }

  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
        <div className='explore-menu-list'>
            {categories.length > 0 ? (
              categories.map((item, index) => {
                return (
                  <div 
                    onClick={() => setCategory(prev => prev === item.name ? "All" : item.name)} 
                    key={item._id || index} 
                    className='explore-menu-list-item'
                  >
                    {item.image ? (
                      <img 
                        className={category === item.name ? "active" : ""} 
                        src={item.image && item.image.startsWith('http') ? item.image : `http://localhost:4000/images/${item.image}`}
                        alt={item.name}
                      />
                    ) : (
                      <div className={`category-placeholder ${category === item.name ? "active" : ""}`}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p>{item.name}</p>
                  </div>
                )
              })
            ) : (
              <div className='no-categories'>No categories available</div>
            )}
        </div>
        <hr></hr>
    </div>
  )
}

export default ExploreMenu;