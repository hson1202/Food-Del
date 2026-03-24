import { useContext } from 'react';
import { StoreContext } from '../Context/StoreContext';

/**
 * Returns restaurant info fetched once in StoreContext.
 * Components should prefer consuming StoreContext directly, but this hook
 * is kept for backwards compatibility.
 */
const useRestaurantInfo = () => {
  const { restaurantInfo, restaurantInfoLoading } = useContext(StoreContext);
  return { restaurantInfo, loading: restaurantInfoLoading, error: null };
};

export default useRestaurantInfo;
