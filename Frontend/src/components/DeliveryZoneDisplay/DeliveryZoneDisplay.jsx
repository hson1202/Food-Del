import React, { useState, useEffect } from 'react';
import './DeliveryZoneDisplay.css';
import axios from 'axios';

const DeliveryZoneDisplay = ({ url }) => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await axios.get(`${url}/api/delivery/zones`);
      if (response.data.success) {
        setZones(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="zones-loading">Loading delivery zones...</div>;
  }

  return (
    <div className="delivery-zones-display">
      <h3 className="zones-title">🚚 Delivery Zones</h3>
      <div className="zones-grid">
        {zones.map((zone) => (
          <div 
            key={zone._id} 
            className="zone-card"
            style={{ borderLeftColor: zone.color }}
          >
            <div className="zone-header">
              <span className="zone-distance">{zone.name}</span>
              <span className="zone-time">⏱️ {zone.estimatedTime} min</span>
            </div>
            <div className="zone-details">
              <div className="zone-detail-row">
                <span className="detail-label">Delivery Fee:</span>
                <span className="detail-value fee">
                  {zone.deliveryFee === 0 ? (
                    <span className="free-badge">FREE</span>
                  ) : (
                    `€${zone.deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="zone-detail-row">
                <span className="detail-label">Min. Order:</span>
                <span className="detail-value">€{zone.minOrder.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryZoneDisplay;

