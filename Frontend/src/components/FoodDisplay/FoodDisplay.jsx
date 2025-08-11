import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'
const FoodDisplay = ({category}) => {

    const {food_list}=useContext(StoreContext)
  return (

    <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        <div className="food-display-list">
            {food_list.map((item,index)=>{
                if(category==="All" || category===item.category){

                  return <FoodItem 
                    key={index} 
                    id={item._id} 
                    name={item.name}
                    nameVI={item.nameVI}
                    nameEN={item.nameEN}
                    nameSK={item.nameSK}
                    description={item.description} 
                    price={item.price} 
                    image={item.image}
                    isPromotion={item.isPromotion}
                    originalPrice={item.originalPrice}
                    promotionPrice={item.promotionPrice}
                    soldCount={item.soldCount}
                    likes={item.likes}
                  />
                }
            })}
        </div>
    </div>
  )
}

export default FoodDisplay;