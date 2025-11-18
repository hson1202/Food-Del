import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './ManualLocationPicker.css';

const DEFAULT_COORDS = { latitude: 50.08804, longitude: 14.42076 };

const ManualLocationPicker = ({
  isOpen,
  onClose,
  onConfirm,
  initialCoords,
  restaurantLocation,
  mapboxToken
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(initialCoords || restaurantLocation || DEFAULT_COORDS);
  const [localError, setLocalError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);

  // Search for addresses using Mapbox Geocoding API
  const searchAddresses = useCallback(async (query) => {
    if (!query || query.length < 3 || !mapboxToken) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5&types=address,place`;
      
      // Add proximity if restaurant location is available
      if (restaurantLocation?.longitude && restaurantLocation?.latitude) {
        url += `&proximity=${restaurantLocation.longitude},${restaurantLocation.latitude}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const formattedSuggestions = data.features.map(feature => ({
          id: feature.id,
          address: feature.place_name,
          latitude: feature.center[1],
          longitude: feature.center[0],
          feature: feature
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, [mapboxToken, restaurantLocation]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (searchQuery) {
        searchAddresses(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, searchAddresses]);

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.address);
    setShowSuggestions(false);
    
    const newCoords = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    };
    
    setSelectedCoords(newCoords);
    
    // Move map and marker to selected location
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({
        center: [suggestion.longitude, suggestion.latitude],
        zoom: 15,
        duration: 1000
      });
      
      markerRef.current.setLngLat([suggestion.longitude, suggestion.latitude]);
    }
  };

  // Move map to coordinates
  const moveMapToCoords = (coords) => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 15,
        duration: 1000
      });
      markerRef.current.setLngLat([coords.longitude, coords.latitude]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setLocalError('');
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    const startCoords =
      initialCoords ||
      (restaurantLocation?.latitude && restaurantLocation?.longitude
        ? { latitude: restaurantLocation.latitude, longitude: restaurantLocation.longitude }
        : DEFAULT_COORDS);

    setSelectedCoords(startCoords);

    if (!mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [startCoords.longitude, startCoords.latitude],
      zoom: 12
    });

    mapRef.current = map;

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([startCoords.longitude, startCoords.latitude])
      .addTo(map);

    markerRef.current = marker;

    const handleDragEnd = () => {
      const lngLat = marker.getLngLat();
      setSelectedCoords({ latitude: lngLat.lat, longitude: lngLat.lng });
      setSearchQuery(''); // Clear search when dragging
    };

    marker.on('dragend', handleDragEnd);

    map.on('click', (event) => {
      marker.setLngLat(event.lngLat);
      setSelectedCoords({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
      setSearchQuery(''); // Clear search when clicking
    });

    return () => {
      marker.off('dragend', handleDragEnd);
      map.remove();
    };
  }, [isOpen, mapboxToken, initialCoords, restaurantLocation]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedCoords) {
      setLocalError('Please drop a pin on the map first.');
      return;
    }
    onConfirm(selectedCoords);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="manual-picker-overlay">
      <div className="manual-picker">
        <div className="manual-picker-header">
          <h3>Drop a pin on the map</h3>
          <button type="button" onClick={onClose} aria-label="Close picker">
            ✖
          </button>
        </div>
        {!mapboxToken ? (
          <div className="manual-picker-error">
            Mapbox token is missing. Please set VITE_MAPBOX_TOKEN (frontend) and reload.
          </div>
        ) : (
          <>
            {/* Search Box */}
            <div className="manual-picker-search-wrapper">
              <div className="manual-picker-search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Tìm kiếm địa chỉ..."
                  className="manual-picker-search-input"
                  autoComplete="off"
                />
                {isSearching && <div className="manual-picker-search-loading">🔄</div>}
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="manual-picker-suggestions">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="manual-picker-suggestion-item"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <div className="manual-picker-suggestion-address">
                        {suggestion.address}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="manual-picker-map" ref={mapContainerRef} />
            <div className="manual-picker-footer">
              <div className="manual-picker-coords">
                <span>Lat: {selectedCoords?.latitude?.toFixed(5)}</span>
                <span>Lng: {selectedCoords?.longitude?.toFixed(5)}</span>
              </div>
              <div className="manual-picker-actions">
                <button type="button" className="secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="primary" onClick={handleConfirm}>
                  Use this location
                </button>
              </div>
            </div>
          </>
        )}
        {localError && <div className="manual-picker-error">{localError}</div>}
      </div>
    </div>
  );
};

export default ManualLocationPicker;

