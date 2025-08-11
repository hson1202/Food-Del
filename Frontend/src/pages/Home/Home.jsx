import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './Home.css'
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import ProductDetail from '../../components/ProductDetail/ProductDetail';

import axios from 'axios';

const Home = () => {
  const { t } = useTranslation()
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/category');
      setCategories(response.data.data || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <Header/>
      <ExploreMenu 
        category={category} 
        setCategory={setCategory} 
        categories={categories}
        loading={loading}
      />
      <FoodDisplay category={category}/>
      {/* Google Maps Section */}
      <div className="map-section">
        <div className="container">
          <h2>{t('contact.map.title')}</h2>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12630.561638352605!2d17.871616!3d48.149105!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b6d006b93bc13%3A0x625b631240812045!2sVIET%20BOWLS!5e1!3m2!1svi!2sus!4v1754749939682!5m2!1svi!2sus" 
              width="100%" 
              height="450" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="VietBow Restaurant Location"
            ></iframe>
          </div>
        </div>
      </div>
      {/* Floating Cart Button is now handled globally in App.jsx */}
    </div>
  )
}

export default Home;