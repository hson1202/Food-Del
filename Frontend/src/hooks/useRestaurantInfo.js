import { useState, useEffect } from 'react';
import config from '../config/config';

const useRestaurantInfo = () => {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.BACKEND_URL}/api/restaurant-info`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch restaurant info');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setRestaurantInfo(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch restaurant info');
        }
      } catch (err) {
        console.error('Error fetching restaurant info:', err);
        setError(err.message);
        // Set default values on error
        setRestaurantInfo({
          restaurantName: 'Viet Bowls',
          phone: '+421 123 456 789',
          email: 'info@vietbowls.sk',
          address: 'Hlavná 33/36, 927 01 Šaľa, Slovakia',
          openingHours: {
            weekdays: 'Thứ 2 - Thứ 7: 11:00 - 20:00',
            sunday: 'Chủ nhật: 11:00 - 17:00'
          },
          socialMedia: {
            facebook: 'https://facebook.com',
            twitter: 'https://twitter.com',
            linkedin: 'https://linkedin.com',
            instagram: ''
          },
          copyrightText: '© 2024 Viet Bowls. All rights reserved.',
          googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12630.561638352605!2d17.871616!3d48.149105!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b6d006b93bc13%3A0x625b631240812045!2sVIET%20BOWLS!5e1!3m2!1svi!2sus!4v1754749939682!5m2!1svi!2sus'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, []);

  return { restaurantInfo, loading, error };
};

export default useRestaurantInfo;
