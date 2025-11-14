import React, { useState, useEffect } from 'react';
import './DeliveryZones.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeliveryZones = ({ url }) => {
  const [zones, setZones] = useState([]);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  // Zone form state
  const [zoneForm, setZoneForm] = useState({
    name: '',
    minDistance: '',
    maxDistance: '',
    deliveryFee: '',
    minOrder: '',
    estimatedTime: '',
    color: '#3B82F6',
    order: 0
  });

  // Restaurant location form state
  const [locationForm, setLocationForm] = useState({
    name: 'VietBowls Restaurant',
    address: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchZones(), fetchRestaurantLocation()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await axios.get(`${url}/api/delivery/zones`, {
        headers: { token: localStorage.getItem('token') }
      });
      if (response.data.success) {
        setZones(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchRestaurantLocation = async () => {
    try {
      const response = await axios.get(`${url}/api/delivery/restaurant-location`);
      if (response.data.success && response.data.data) {
        setRestaurantLocation(response.data.data);
        setLocationForm({
          name: response.data.data.name,
          address: response.data.data.address,
          latitude: response.data.data.latitude,
          longitude: response.data.data.longitude
        });
      }
    } catch (error) {
      console.error('Error fetching restaurant location:', error);
    }
  };

  const handleZoneFormChange = (e) => {
    const { name, value } = e.target;
    setZoneForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationFormChange = (e) => {
    const { name, value } = e.target;
    setLocationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${url}/api/delivery/zones/create`,
        zoneForm,
        { headers: { token: localStorage.getItem('token') } }
      );
      
      if (response.data.success) {
        toast.success('Delivery zone created successfully!');
        fetchZones();
        resetZoneForm();
        setShowZoneForm(false);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
      toast.error(error.response?.data?.message || 'Failed to create zone');
    }
  };

  const handleUpdateZone = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${url}/api/delivery/zones/${editingZone._id}`,
        zoneForm,
        { headers: { token: localStorage.getItem('token') } }
      );
      
      if (response.data.success) {
        toast.success('Delivery zone updated successfully!');
        fetchZones();
        resetZoneForm();
        setEditingZone(null);
        setShowZoneForm(false);
      }
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error(error.response?.data?.message || 'Failed to update zone');
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this delivery zone?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${url}/api/delivery/zones/${zoneId}`,
        { headers: { token: localStorage.getItem('token') } }
      );
      
      if (response.data.success) {
        toast.success('Delivery zone deleted successfully!');
        fetchZones();
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error(error.response?.data?.message || 'Failed to delete zone');
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      minDistance: zone.minDistance,
      maxDistance: zone.maxDistance,
      deliveryFee: zone.deliveryFee,
      minOrder: zone.minOrder,
      estimatedTime: zone.estimatedTime,
      color: zone.color,
      order: zone.order
    });
    setShowZoneForm(true);
  };

  const resetZoneForm = () => {
    setZoneForm({
      name: '',
      minDistance: '',
      maxDistance: '',
      deliveryFee: '',
      minOrder: '',
      estimatedTime: '',
      color: '#3B82F6',
      order: 0
    });
    setEditingZone(null);
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${url}/api/delivery/restaurant-location`,
        locationForm,
        { headers: { token: localStorage.getItem('token') } }
      );
      
      if (response.data.success) {
        toast.success('Restaurant location updated successfully!');
        fetchRestaurantLocation();
        setShowLocationForm(false);
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error.response?.data?.message || 'Failed to update location');
    }
  };

  if (isLoading) {
    return <div className="delivery-zones-loading">Loading...</div>;
  }

  return (
    <div className="delivery-zones-page">
      <div className="page-header">
        <h1>🚚 Delivery Zones Management</h1>
        <p>Manage delivery zones, fees, and restaurant location</p>
      </div>

      {/* Restaurant Location Section */}
      <div className="section-card location-section">
        <div className="section-header">
          <h2>📍 Restaurant Location</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowLocationForm(!showLocationForm)}
          >
            {showLocationForm ? 'Cancel' : restaurantLocation ? 'Edit Location' : 'Set Location'}
          </button>
        </div>

        {restaurantLocation && !showLocationForm && (
          <div className="location-display">
            <div className="location-info">
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">{restaurantLocation.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">{restaurantLocation.address}</span>
              </div>
              <div className="info-item">
                <span className="label">Coordinates:</span>
                <span className="value">
                  {restaurantLocation.latitude}, {restaurantLocation.longitude}
                </span>
              </div>
            </div>
          </div>
        )}

        {showLocationForm && (
          <form className="location-form" onSubmit={handleUpdateLocation}>
            <div className="form-grid">
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  value={locationForm.name}
                  onChange={handleLocationFormChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={locationForm.address}
                  onChange={handleLocationFormChange}
                  placeholder="Full restaurant address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={locationForm.latitude}
                  onChange={handleLocationFormChange}
                  step="any"
                  placeholder="e.g., 48.1486"
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={locationForm.longitude}
                  onChange={handleLocationFormChange}
                  step="any"
                  placeholder="e.g., 17.1077"
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Save Location
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLocationForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delivery Zones Section */}
      <div className="section-card zones-section">
        <div className="section-header">
          <h2>📦 Delivery Zones</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetZoneForm();
              setShowZoneForm(!showZoneForm);
            }}
          >
            {showZoneForm ? 'Cancel' : '+ Add Zone'}
          </button>
        </div>

        {showZoneForm && (
          <form
            className="zone-form"
            onSubmit={editingZone ? handleUpdateZone : handleCreateZone}
          >
            <div className="form-grid">
              <div className="form-group">
                <label>Zone Name</label>
                <input
                  type="text"
                  name="name"
                  value={zoneForm.name}
                  onChange={handleZoneFormChange}
                  placeholder="e.g., 1-3 Km"
                  required
                />
              </div>
              <div className="form-group">
                <label>Min Distance (km)</label>
                <input
                  type="number"
                  name="minDistance"
                  value={zoneForm.minDistance}
                  onChange={handleZoneFormChange}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Distance (km)</label>
                <input
                  type="number"
                  name="maxDistance"
                  value={zoneForm.maxDistance}
                  onChange={handleZoneFormChange}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Delivery Fee (€)</label>
                <input
                  type="number"
                  name="deliveryFee"
                  value={zoneForm.deliveryFee}
                  onChange={handleZoneFormChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Min Order (€)</label>
                <input
                  type="number"
                  name="minOrder"
                  value={zoneForm.minOrder}
                  onChange={handleZoneFormChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Estimated Time (min)</label>
                <input
                  type="number"
                  name="estimatedTime"
                  value={zoneForm.estimatedTime}
                  onChange={handleZoneFormChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  name="color"
                  value={zoneForm.color}
                  onChange={handleZoneFormChange}
                />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={zoneForm.order}
                  onChange={handleZoneFormChange}
                  min="0"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  resetZoneForm();
                  setShowZoneForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="zones-list">
          {zones.length === 0 ? (
            <div className="no-zones">
              <p>No delivery zones configured yet.</p>
              <p>Click "Add Zone" to create your first delivery zone.</p>
            </div>
          ) : (
            <div className="zones-grid">
              {zones.map((zone) => (
                <div
                  key={zone._id}
                  className="zone-card"
                  style={{ borderLeftColor: zone.color }}
                >
                  <div className="zone-header">
                    <h3>{zone.name}</h3>
                    <div className="zone-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEditZone(zone)}
                        title="Edit zone"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteZone(zone._id)}
                        title="Delete zone"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="zone-details">
                    <div className="detail-row">
                      <span className="label">Distance:</span>
                      <span className="value">{zone.minDistance} - {zone.maxDistance} km</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Delivery Fee:</span>
                      <span className="value fee">
                        {zone.deliveryFee === 0 ? 'FREE' : `€${zone.deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Min Order:</span>
                      <span className="value">€{zone.minOrder.toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Est. Time:</span>
                      <span className="value">{zone.estimatedTime} min</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Status:</span>
                      <span className={`status ${zone.isActive ? 'active' : 'inactive'}`}>
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>💡 How to use Mapbox</h3>
        <ol>
          <li>Sign up for free at <a href="https://account.mapbox.com/auth/signup" target="_blank" rel="noopener noreferrer">mapbox.com</a></li>
          <li>Get your access token from <a href="https://account.mapbox.com/access-tokens" target="_blank" rel="noopener noreferrer">Access Tokens page</a></li>
          <li>Add <code>MAPBOX_ACCESS_TOKEN=your_token</code> to your backend <code>.env</code> file</li>
          <li>Restart your backend server</li>
          <li>Configure restaurant location with accurate coordinates</li>
          <li>Create delivery zones with distance ranges and fees</li>
        </ol>
        <p><strong>Free tier:</strong> 100,000 requests/month - more than enough for most restaurants!</p>
      </div>
    </div>
  );
};

export default DeliveryZones;

