import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DeliveryAddressInput.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import ManualLocationPicker from '../ManualLocationPicker/ManualLocationPicker';

const DEFAULT_COORDS = { latitude: 50.08804, longitude: 14.42076 };

const buildAddressPayload = ({ address = '', components = {}, latitude, longitude }) => {
  const hasCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number';
  const coords = hasCoords ? { latitude, longitude } : undefined;

  return {
    address,
    street: components.streetLine || components.street || address,
    houseNumber: components.houseNumber || '',
    city: components.city || '',
    state: components.state || '',
    zipcode: components.zipcode || '',
    country: components.country || '',
    coordinates: coords,
    latitude: coords?.latitude,
    longitude: coords?.longitude
  };
};

const DeliveryAddressInput = ({
  value,
  onChange,
  onDeliveryCalculated,
  url,
  restaurantLocation
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [error, setError] = useState('');
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);
  // OpenStreetMap/Nominatim không cần API key, luôn available
  const manualPinAvailable = true;

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
      setError(t('placeOrder.form.addressError'));
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
  const calculateDelivery = useCallback(async ({ address, latitude, longitude, components, suppressQueryUpdate } = {}) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🚚 Calculating delivery for:', { address, latitude, longitude });

      const response = await axios.post(`${url}/api/delivery/calculate`, {
        address,
        latitude,
        longitude
      });

      console.log('📦 Delivery calculation response:', response.data);

      if (response.data.success) {
        const deliveryData = response.data.data;
        console.log('✅ Delivery available:', deliveryData.zone.name, `- €${deliveryData.zone.deliveryFee}`);

        setDeliveryInfo(deliveryData);
        if (onDeliveryCalculated) {
          onDeliveryCalculated(deliveryData);
        }

        const mergedComponents = components || deliveryData.addressComponents || {};
        const normalized = buildAddressPayload({
          address: deliveryData.address || address || '',
          components: mergedComponents,
          latitude: deliveryData.coordinates?.latitude ?? latitude,
          longitude: deliveryData.coordinates?.longitude ?? longitude
        });

        setSelectedAddress({
          address: normalized.address,
          latitude: normalized.coordinates?.latitude,
          longitude: normalized.coordinates?.longitude
        });

        if (onChange) {
          onChange(normalized);
        }

        if (!suppressQueryUpdate && normalized.address) {
          setQuery(normalized.address);
        }
      } else {
        // Out of delivery range - but still update address if available
        const deliveryData = response.data;

        console.warn('⚠️ Delivery NOT available. Distance:', deliveryData.distance, 'km');
        console.warn('Reason:', deliveryData.outOfRange ? 'Out of range' : 'Unknown');

        // Lấy thông báo phù hợp với ngôn ngữ hiện tại
        let errorMessage = deliveryData.message || t('placeOrder.form.deliveryNotAvailable');
        const currentLang = i18n.language || 'vi';
        if (currentLang === 'en' && deliveryData.messageEn) {
          errorMessage = deliveryData.messageEn;
        } else if (currentLang === 'sk' && deliveryData.messageSk) {
          errorMessage = deliveryData.messageSk;
        } else if (currentLang === 'vi' && deliveryData.message) {
          errorMessage = deliveryData.message;
        }

        console.log('❌ Error message to display:', errorMessage);

        if (deliveryData.address) {
          // Use coordinates from selectedAddress if available, otherwise from request
          const currentCoords = selectedAddress?.latitude && selectedAddress?.longitude
            ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
            : { latitude, longitude };

          setQuery(deliveryData.address);
          setSelectedAddress({
            address: deliveryData.address,
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude
          });

          if (onChange) {
            onChange(buildAddressPayload({
              address: deliveryData.address,
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude
            }));
          }
        }

        setError(errorMessage);
        setDeliveryInfo(null);
        if (onDeliveryCalculated) {
          onDeliveryCalculated(null);
        }
      }
    } catch (err) {
      console.error('❌ Error calculating delivery:', err);
      console.error('Response:', err.response?.data);
      setError(t('placeOrder.form.deliveryCalculationError'));
      setDeliveryInfo(null);
      if (onDeliveryCalculated) {
        onDeliveryCalculated(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, onDeliveryCalculated, onChange]);

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.address);
    setSelectedAddress({
      address: suggestion.address,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
    setShowSuggestions(false);
    setSuggestions([]);

    // Update parent component
    if (onChange) {
      onChange(buildAddressPayload({
        address: suggestion.address,
        components: suggestion.components || {},
        latitude: suggestion.latitude,
        longitude: suggestion.longitude
      }));
    }

    // Calculate delivery
    calculateDelivery({
      address: suggestion.address,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      components: suggestion.components
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedAddress(null);
    setDeliveryInfo(null);
    setError('');

    if (onChange) {
      onChange(buildAddressPayload({ address: newValue }));
    }
  };

  const handleManualLocationConfirm = async (coords) => {
    if (!coords) return;
    setIsManualPickerOpen(false);

    // Set temporary query (will be updated by calculateDelivery after reverse geocoding)
    setQuery(t('placeOrder.form.findingAddress'));
    setSelectedAddress({
      address: '',
      latitude: coords.latitude,
      longitude: coords.longitude
    });

    // Calculate delivery - backend will reverse geocode and return the address
    // calculateDelivery will automatically update the query with the address from response
    await calculateDelivery({
      latitude: coords.latitude,
      longitude: coords.longitude
      // Don't pass address - let backend reverse geocode it
    });
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
          placeholder={t('placeOrder.form.addressPlaceholder')}
          className="address-input"
          autoComplete="off"
        />
        {isLoading && <div className="loading-spinner">🔄</div>}
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion) => {
            // Kiểm tra xem địa chỉ có số nhà không
            const hasHouseNumber = suggestion.components?.houseNumber &&
              suggestion.components.houseNumber.trim().length > 0;
            const isGeneralAddress = !hasHouseNumber &&
              (suggestion.components?.street || suggestion.shortAddress);

            return (
              <div
                key={suggestion.id}
                className={`suggestion-item ${isGeneralAddress ? 'suggestion-item-warning' : ''}`}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <span className="suggestion-icon">📍</span>
                <div className="suggestion-text">
                  <div className="suggestion-main">
                    {suggestion.shortAddress}
                    {isGeneralAddress && (
                      <span className="suggestion-warning-badge" title={t('placeOrder.form.houseNumberMapboxMissing')}>
                        ⚠️
                      </span>
                    )}
                  </div>
                  <div className="suggestion-detail">{suggestion.address}</div>
                  {isGeneralAddress && (
                    <div className="suggestion-warning-text">
                      {t('placeOrder.form.houseNumberMapboxMissing')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
              <span className="info-label">{t('placeOrder.form.deliveryInfo.distance')}</span>
              <span className="info-value">{deliveryInfo.distance} km</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('placeOrder.form.deliveryInfo.deliveryFee')}</span>
              <span className="info-value delivery-fee">
                €{deliveryInfo.zone.deliveryFee === 0 ? t('placeOrder.form.deliveryInfo.free') : deliveryInfo.zone.deliveryFee.toFixed(2)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('placeOrder.form.deliveryInfo.minOrder')}</span>
              <span className="info-value">€{deliveryInfo.zone.minOrder.toFixed(2)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('placeOrder.form.deliveryInfo.estimatedTime')}</span>
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

      {manualPinAvailable && (
        <>
          <button
            type="button"
            className="manual-pin-trigger"
            onClick={() => setIsManualPickerOpen(true)}
          >
            {t('placeOrder.form.manualPinButton')}
          </button>
          <ManualLocationPicker
            isOpen={isManualPickerOpen}
            onClose={() => setIsManualPickerOpen(false)}
            onConfirm={handleManualLocationConfirm}
            initialCoords={
              selectedAddress?.latitude && selectedAddress?.longitude
                ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
                : restaurantLocation?.latitude && restaurantLocation?.longitude
                  ? { latitude: restaurantLocation.latitude, longitude: restaurantLocation.longitude }
                  : DEFAULT_COORDS
            }
            restaurantLocation={restaurantLocation}
          />
        </>
      )}
    </div>
  );
};

export default DeliveryAddressInput;

