import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DeliveryAddressInput.css';
import axios from 'axios';

const DeliveryAddressInput = ({ 
  value, 
  onChange, 
  onDeliveryCalculated,
  url,
  restaurantLocation
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [error, setError] = useState('');
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Thêm proximity nếu có vị trí nhà hàng
      let proximityParam = '';
      if (restaurantLocation?.longitude && restaurantLocation?.latitude) {
        proximityParam = `&proximity=${restaurantLocation.longitude},${restaurantLocation.latitude}`;
      }

      const response = await axios.get(
        `${url}/api/delivery/autocomplete?query=${encodeURIComponent(searchQuery)}${proximityParam}`
      );

      if (response.data.success) {
        setSuggestions(response.data.data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to fetch address suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [url, restaurantLocation]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (query && !selectedAddress) {
        fetchSuggestions(query);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, fetchSuggestions, selectedAddress]);

  // Calculate delivery fee
  const calculateDelivery = useCallback(async (address, latitude, longitude) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${url}/api/delivery/calculate`, {
        address,
        latitude,
        longitude
      });

      if (response.data.success) {
        setDeliveryInfo(response.data.data);
        if (onDeliveryCalculated) {
          onDeliveryCalculated(response.data.data);
        }
      } else {
        // Out of delivery range
        setError(response.data.message || 'Delivery not available to this location');
        setDeliveryInfo(null);
        if (onDeliveryCalculated) {
          onDeliveryCalculated(null);
        }
      }
    } catch (err) {
      console.error('Error calculating delivery:', err);
      setError('Failed to calculate delivery fee');
      setDeliveryInfo(null);
      if (onDeliveryCalculated) {
        onDeliveryCalculated(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, onDeliveryCalculated]);

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.address);
    setSelectedAddress(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);

    // Update parent component
    if (onChange) {
      onChange({
        address: suggestion.address,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude
      });
    }

    // Calculate delivery
    calculateDelivery(
      suggestion.address,
      suggestion.latitude,
      suggestion.longitude
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedAddress(null);
    setDeliveryInfo(null);
    setError('');

    if (onChange) {
      onChange({ address: newValue });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="delivery-address-input" ref={inputRef}>
      <div className="address-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Enter your delivery address..."
          className="address-input"
          autoComplete="off"
        />
        {isLoading && <div className="loading-spinner">🔄</div>}
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="suggestion-item"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <span className="suggestion-icon">📍</span>
              <div className="suggestion-text">
                <div className="suggestion-main">{suggestion.shortAddress}</div>
                <div className="suggestion-detail">{suggestion.address}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery info display */}
      {deliveryInfo && (
        <div className="delivery-info-card">
          <div className="delivery-info-header">
            <span className="delivery-icon">🚚</span>
            <span className="delivery-zone-name">{deliveryInfo.zone.name}</span>
          </div>
          <div className="delivery-info-details">
            <div className="info-row">
              <span className="info-label">Distance:</span>
              <span className="info-value">{deliveryInfo.distance} km</span>
            </div>
            <div className="info-row">
              <span className="info-label">Delivery Fee:</span>
              <span className="info-value delivery-fee">
                €{deliveryInfo.zone.deliveryFee === 0 ? 'FREE' : deliveryInfo.zone.deliveryFee.toFixed(2)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Min. Order:</span>
              <span className="info-value">€{deliveryInfo.zone.minOrder.toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estimated Time:</span>
              <span className="info-value">{deliveryInfo.zone.estimatedTime} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="delivery-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressInput;

