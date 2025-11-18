import deliveryZoneModel from "../models/deliveryZoneModel.js";
import restaurantLocationModel from "../models/restaurantLocationModel.js";

// ========== MAPBOX CONFIG ==========
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

// ========== HAVERSINE FORMULA ==========
// Tính khoảng cách thẳng giữa 2 điểm trên trái đất (km)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(value) {
  return value * Math.PI / 180;
}

// ========== GEOCODING WITH MAPBOX ==========
async function geocodeAddress(address) {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.error("❌ MAPBOX_ACCESS_TOKEN not found in environment variables!");
    throw new Error("Mapbox access token not configured. Please add MAPBOX_ACCESS_TOKEN to .env file");
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
    
    console.log("🔍 Geocoding address:", address);
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for Mapbox API errors
    if (data.message) {
      console.error("❌ Mapbox API Error:", data.message);
      throw new Error(`Mapbox API Error: ${data.message}`);
    }
    
    if (!data.features || data.features.length === 0) {
      throw new Error("Address not found");
    }
    
    const [longitude, latitude] = data.features[0].center;
    const placeName = data.features[0].place_name;
    
    console.log("✅ Geocoding successful:", { latitude, longitude, placeName });
    
    return {
      latitude,
      longitude,
      formattedAddress: placeName
    };
  } catch (error) {
    console.error("❌ Geocoding error:", error);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
}

// ========== GET DELIVERY ZONES ==========
const getDeliveryZones = async (req, res) => {
  try {
    const zones = await deliveryZoneModel.find({ isActive: true }).sort({ order: 1, minDistance: 1 });
    
    res.json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error("Error fetching delivery zones:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== CALCULATE DELIVERY FEE ==========
const calculateDeliveryFee = async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body;
    
    let customerLat, customerLng, formattedAddress;
    
    // Nếu có latitude/longitude thì dùng luôn
    if (latitude && longitude) {
      customerLat = parseFloat(latitude);
      customerLng = parseFloat(longitude);
      formattedAddress = address || `${latitude}, ${longitude}`;
    } 
    // Nếu không, geocode từ address
    else if (address) {
      const geocoded = await geocodeAddress(address);
      customerLat = geocoded.latitude;
      customerLng = geocoded.longitude;
      formattedAddress = geocoded.formattedAddress;
    } 
    else {
      return res.status(400).json({
        success: false,
        message: "Please provide either address or latitude/longitude"
      });
    }
    
    // Lấy vị trí nhà hàng
    const restaurant = await restaurantLocationModel.findOne({ 
      isActive: true, 
      isPrimary: true 
    });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant location not configured"
      });
    }
    
    // Tính khoảng cách
    const distance = calculateHaversineDistance(
      restaurant.latitude,
      restaurant.longitude,
      customerLat,
      customerLng
    );
    
    // Tìm zone phù hợp
    const zones = await deliveryZoneModel.find({ isActive: true }).sort({ minDistance: 1 });
    
    let matchedZone = null;
    for (const zone of zones) {
      if (distance >= zone.minDistance && distance <= zone.maxDistance) {
        matchedZone = zone;
        break;
      }
    }

    // Nếu khách gần hơn cả zone nhỏ nhất (ví dụ < 1km) thì áp dụng zone đầu tiên
    if (!matchedZone && zones.length > 0) {
      const nearestZone = zones[0];
      if (distance < nearestZone.minDistance) {
        matchedZone = nearestZone;
      }
    }
    
    if (!matchedZone) {
      return res.json({
        success: false,
        message: "Sorry, we don't deliver to this location",
        distance: parseFloat(distance.toFixed(2)),
        address: formattedAddress,
        outOfRange: true
      });
    }
    
    res.json({
      success: true,
      data: {
        zone: {
          name: matchedZone.name,
          deliveryFee: matchedZone.deliveryFee,
          minOrder: matchedZone.minOrder,
          estimatedTime: matchedZone.estimatedTime,
          color: matchedZone.color
        },
        distance: parseFloat(distance.toFixed(2)),
        address: formattedAddress,
        coordinates: {
          latitude: customerLat,
          longitude: customerLng
        },
        restaurant: {
          name: restaurant.name,
          address: restaurant.address
        }
      }
    });
    
  } catch (error) {
    console.error("Error calculating delivery fee:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== AUTOCOMPLETE ADDRESS (MAPBOX) ==========
const autocompleteAddress = async (req, res) => {
  try {
    const { query, proximity } = req.query; // proximity: "lng,lat" để ưu tiên kết quả gần nhà hàng
    
    if (!query || query.length < 3) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    if (!MAPBOX_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "Mapbox not configured"
      });
    }
    
    const encodedQuery = encodeURIComponent(query);
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5&types=address,place`;
    
    // Thêm proximity nếu có (ưu tiên kết quả gần nhà hàng)
    if (proximity) {
      url += `&proximity=${proximity}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    const suggestions = data.features.map(feature => ({
      id: feature.id,
      address: feature.place_name,
      shortAddress: feature.text,
      latitude: feature.center[1],
      longitude: feature.center[0],
      context: feature.context
    }));
    
    res.json({
      success: true,
      data: suggestions
    });
    
  } catch (error) {
    console.error("❌ Autocomplete error:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.response?.data || "Network error or invalid Mapbox token"
    });
  }
};

// ========== ADMIN: CRUD DELIVERY ZONES ==========
const createDeliveryZone = async (req, res) => {
  try {
    const { name, minDistance, maxDistance, deliveryFee, minOrder, estimatedTime, color, order } = req.body;
    
    const zone = new deliveryZoneModel({
      name,
      minDistance,
      maxDistance,
      deliveryFee,
      minOrder,
      estimatedTime,
      color,
      order
    });
    
    await zone.save();
    
    res.json({
      success: true,
      message: "Delivery zone created successfully",
      data: zone
    });
    
  } catch (error) {
    console.error("Error creating delivery zone:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateDeliveryZone = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const zone = await deliveryZoneModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Delivery zone not found"
      });
    }
    
    res.json({
      success: true,
      message: "Delivery zone updated successfully",
      data: zone
    });
    
  } catch (error) {
    console.error("Error updating delivery zone:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteDeliveryZone = async (req, res) => {
  try {
    const { id } = req.params;
    
    const zone = await deliveryZoneModel.findByIdAndDelete(id);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Delivery zone not found"
      });
    }
    
    res.json({
      success: true,
      message: "Delivery zone deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting delivery zone:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== ADMIN: CRUD RESTAURANT LOCATION ==========
const getRestaurantLocation = async (req, res) => {
  try {
    const location = await restaurantLocationModel.findOne({ 
      isActive: true, 
      isPrimary: true 
    });
    
    res.json({
      success: true,
      data: location
    });
    
  } catch (error) {
    console.error("Error fetching restaurant location:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateRestaurantLocation = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    
    // Tìm location hiện tại hoặc tạo mới
    let location = await restaurantLocationModel.findOne({ 
      isActive: true, 
      isPrimary: true 
    });
    
    if (location) {
      location.name = name || location.name;
      location.address = address || location.address;
      location.latitude = latitude || location.latitude;
      location.longitude = longitude || location.longitude;
      await location.save();
    } else {
      location = new restaurantLocationModel({
        name,
        address,
        latitude,
        longitude,
        isActive: true,
        isPrimary: true
      });
      await location.save();
    }
    
    res.json({
      success: true,
      message: "Restaurant location updated successfully",
      data: location
    });
    
  } catch (error) {
    console.error("Error updating restaurant location:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  getDeliveryZones,
  calculateDeliveryFee,
  autocompleteAddress,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  getRestaurantLocation,
  updateRestaurantLocation
};

