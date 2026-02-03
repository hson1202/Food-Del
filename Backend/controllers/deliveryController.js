import deliveryZoneModel from "../models/deliveryZoneModel.js";
import restaurantLocationModel from "../models/restaurantLocationModel.js";

// ========== OPENSTREETMAP/NOMINATIM CONFIG ==========
// Nominatim API không cần API key, nhưng cần User-Agent header
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const DEFAULT_MAP_CENTER = { latitude: 50.08804, longitude: 14.42076 };
// User-Agent header bắt buộc cho Nominatim (theo policy của họ)
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'FoodDeliveryApp/1.0';

// Parse địa chỉ từ Nominatim response format
const extractAddressComponents = (nominatimResult = {}) => {
  const components = {
    street: "",
    streetLine: "",
    houseNumber: "",
    city: "",
    village: "", // Thành phố nhỏ (ví dụ: Veča)
    town: "", // Thành phố lớn hơn (ví dụ: Šaľa)
    state: "",
    zipcode: "",
    country: "",
  };

  const address = nominatimResult.address || {};

  // Nominatim trả về address components trong object address
  // Số nhà
  components.houseNumber =
    address.house_number ||
    address.house ||
    address.housenumber ||
    "";

  // Tên đường
  components.street =
    address.road ||
    address.street ||
    address.pedestrian ||
    address.path ||
    "";

  // Village (thành phố nhỏ, ví dụ: Veča)
  components.village = address.village || "";

  // Town/City (thành phố lớn hơn, ví dụ: Šaľa)
  components.town = address.town || address.city || "";

  // City (fallback - dùng village hoặc town nếu không có)
  components.city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    "";

  // Tỉnh/Quận/Huyện
  components.state =
    address.state ||
    address.region ||
    address.county ||
    "";

  // Mã bưu điện
  components.zipcode = address.postcode || "";

  // Quốc gia
  components.country = address.country || "";

  // Tạo streetLine: kết hợp số nhà + tên đường
  components.streetLine = [components.houseNumber, components.street]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Fallback: Nếu không có streetLine, thử parse từ display_name
  if (!components.streetLine && nominatimResult.display_name) {
    const displayName = nominatimResult.display_name;
    // Thử tách số nhà từ đầu chuỗi (ví dụ: "1870/19, Hliník" hoặc "Hliník 1870/19")
    const match = displayName.match(/^(\d+[\/\-\d]*[a-zA-Z]?)\s+(.+?)(?:,|$)/);
    if (match) {
      components.houseNumber = components.houseNumber || match[1];
      components.street = components.street || match[2].trim();
      components.streetLine = [components.houseNumber, components.street]
        .filter(Boolean)
        .join(" ")
        .trim();
    } else {
      // Thử pattern ngược lại: "Hliník 1870/19"
      const reverseMatch = displayName.match(/^(.+?)\s+(\d+[\/\-\d]*[a-zA-Z]?)(?:,|$)/);
      if (reverseMatch) {
        components.street = components.street || reverseMatch[1].trim();
        components.houseNumber = components.houseNumber || reverseMatch[2];
        components.streetLine = [components.street, components.houseNumber]
          .filter(Boolean)
          .join(" ")
          .trim();
      } else {
        // Lấy phần đầu tiên trước dấu phẩy
        components.streetLine = displayName.split(',')[0].trim();
      }
    }
  }

  return components;
};

// Format địa chỉ ngắn gọn từ components
// Ví dụ: "Hliník 1870/19, Veča, 927 05 Šaľa"
// Bỏ qua state/region và country để tránh lặp lại thông tin
const formatShortAddress = (components = {}) => {
  const parts = [];

  // Phần 1: Street line (số nhà + tên đường)
  if (components.streetLine) {
    parts.push(components.streetLine);
  } else if (components.street) {
    parts.push(components.street);
  }

  // Phần 2: Village (thành phố nhỏ, ví dụ: Veča)
  if (components.village && components.village !== components.town) {
    parts.push(components.village);
  }

  // Phần 3: Zipcode + Town (thành phố lớn hơn, ví dụ: 927 05 Šaľa)
  if (components.zipcode && components.town) {
    // Kết hợp zipcode và town nếu town khác với village
    const zipAndTown = `${components.zipcode} ${components.town}`;
    // Kiểm tra xem town đã có trong parts chưa (tránh lặp)
    const townAlreadyIncluded = parts.some(part => part.includes(components.town));
    if (!townAlreadyIncluded) {
      parts.push(zipAndTown);
    } else {
      // Nếu đã có town ở trên, chỉ thêm zipcode nếu chưa có
      const zipcodeAlreadyIncluded = parts.some(part => part.includes(components.zipcode));
      if (!zipcodeAlreadyIncluded) {
        parts.push(components.zipcode);
      }
    }
  } else if (components.zipcode) {
    // Chỉ có zipcode, không có town
    const zipcodeAlreadyIncluded = parts.some(part => part.includes(components.zipcode));
    if (!zipcodeAlreadyIncluded) {
      parts.push(components.zipcode);
    }
  } else if (components.town && !components.village) {
    // Chỉ có town, không có village
    const townAlreadyIncluded = parts.some(part => part.includes(components.town));
    if (!townAlreadyIncluded) {
      parts.push(components.town);
    }
  } else if (components.city && !components.village && !components.town) {
    // Fallback: dùng city nếu không có village và town
    const cityAlreadyIncluded = parts.some(part => part.includes(components.city));
    if (!cityAlreadyIncluded) {
      parts.push(components.city);
    }
  }

  // KHÔNG thêm state/region và country để tránh lặp lại thông tin
  // (ví dụ: "Region of Nitra 927 01" sẽ bị bỏ qua)

  // Nếu không có gì, trả về empty string
  if (parts.length === 0) {
    return "";
  }

  return parts.join(", ");
};

// Clean display_name để bỏ phần state/region và country
// Ví dụ: "203/42 Vinohradnícka, 927 01 Šaľa, Šaľa, Region of Nitra 927 01, Slovakia"
// -> "203/42 Vinohradnícka, 927 01 Šaľa"
const cleanDisplayName = (displayName = "") => {
  if (!displayName) return "";

  // Tách địa chỉ thành các phần
  const parts = displayName.split(',').map(part => part.trim()).filter(Boolean);

  // Loại bỏ các phần chứa "Region of", "State", "Country", "Slovakia"
  const cleanedParts = parts.filter(part => {
    const lowerPart = part.toLowerCase();
    // Bỏ qua các phần chứa từ khóa region/state/country
    if (lowerPart.includes('region of') ||
      lowerPart.includes('state') ||
      (lowerPart.includes('country') && !lowerPart.match(/\d/)) || // Bỏ "country" nhưng giữ nếu có số
      lowerPart === 'slovakia') {
      return false;
    }
    return true;
  });

  // Loại bỏ các phần trùng lặp (ví dụ: "Šaľa" xuất hiện 2 lần)
  // Ưu tiên giữ phần có zipcode (ví dụ: "927 01 Šaľa" thay vì chỉ "Šaľa")
  const uniqueParts = [];
  const seenWords = new Set();

  // Đầu tiên, thêm các phần có zipcode (chứa số)
  for (const part of cleanedParts) {
    if (/\d/.test(part)) {
      uniqueParts.push(part);
      // Thêm các từ quan trọng vào seen (bỏ qua số và từ ngắn)
      part.split(/\s+/).forEach(word => {
        if (word.length >= 3 && !/\d/.test(word)) {
          seenWords.add(word.toLowerCase());
        }
      });
    }
  }

  // Sau đó, thêm các phần không có zipcode nhưng chưa bị trùng
  for (const part of cleanedParts) {
    if (!/\d/.test(part)) {
      const partWords = part.split(/\s+/).filter(w => w.length >= 3);
      const isDuplicate = partWords.some(word => seenWords.has(word.toLowerCase()));
      if (!isDuplicate) {
        uniqueParts.push(part);
        partWords.forEach(word => {
          seenWords.add(word.toLowerCase());
        });
      }
    }
  }

  return uniqueParts.join(", ");
};

// Convert Nominatim result to our address format
const nominatimResultToAddress = (result = {}) => {
  const latitude = parseFloat(result.lat) || DEFAULT_MAP_CENTER.latitude;
  const longitude = parseFloat(result.lon) || DEFAULT_MAP_CENTER.longitude;
  const components = extractAddressComponents(result);

  // Format địa chỉ ngắn gọn từ components
  const shortAddress = formatShortAddress(components);

  // Nếu không format được địa chỉ ngắn, fallback về display_name đã được clean
  const formattedAddress = shortAddress || cleanDisplayName(result.display_name) || "";

  return {
    latitude,
    longitude,
    formattedAddress: formattedAddress,
    components: components,
  };
};

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

// ========== GEOCODING WITH NOMINATIM (OPENSTREETMAP) ==========
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    // Nominatim API: search endpoint
    // countrycodes=sk: giới hạn trong Slovakia
    // addressdetails=1: lấy chi tiết địa chỉ
    // limit=5: lấy 5 kết quả để tìm địa chỉ có số nhà
    const url = `${NOMINATIM_BASE_URL}/search?q=${encodedAddress}&format=json&limit=5&countrycodes=sk&addressdetails=1&accept-language=en`;

    console.log("🔍 Geocoding address with Nominatim:", address);

    const response = await fetch(url, {
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error("Address not found");
    }

    // ✨ Ưu tiên chọn địa chỉ có số nhà cụ thể
    let bestResult = data[0];
    let bestParsed = nominatimResultToAddress(bestResult);

    // Tìm địa chỉ có số nhà trong các kết quả
    for (const result of data) {
      const parsed = nominatimResultToAddress(result);
      if (parsed.components.houseNumber && parsed.components.houseNumber.trim().length > 0) {
        bestResult = result;
        bestParsed = parsed;
        console.log("✅ Found address with house number:", parsed.components.houseNumber);
        break; // Dừng khi tìm thấy địa chỉ có số nhà
      }
    }

    console.log("✅ Geocoding successful:", {
      latitude: bestParsed.latitude,
      longitude: bestParsed.longitude,
      placeName: bestParsed.formattedAddress,
      houseNumber: bestParsed.components.houseNumber || "N/A"
    });

    return bestParsed;
  } catch (error) {
    console.error("❌ Geocoding error:", error);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
}

async function reverseGeocodeCoordinates(latitude, longitude) {
  try {
    // Nominatim reverse geocoding
    const url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`;
    console.log("🔄 Reverse geocoding coordinates with Nominatim:", latitude, longitude);

    const response = await fetch(url, {
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.lat || !data.lon) {
      throw new Error("Reverse geocoding failed");
    }

    const parsedResult = nominatimResultToAddress(data);

    console.log("✅ Reverse geocoding successful:", {
      latitude: parsedResult.latitude,
      longitude: parsedResult.longitude,
      placeName: parsedResult.formattedAddress,
    });

    return parsedResult;
  } catch (error) {
    console.error("❌ Reverse geocoding error:", error);
    throw new Error(`Failed to reverse geocode coordinates: ${error.message}`);
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
    let addressComponents = null;

    // Nếu có latitude/longitude thì dùng luôn
    if (latitude && longitude) {
      customerLat = parseFloat(latitude);
      customerLng = parseFloat(longitude);

      if (address) {
        formattedAddress = address;
      } else {
        try {
          const reverse = await reverseGeocodeCoordinates(customerLat, customerLng);
          formattedAddress = reverse.formattedAddress;
          addressComponents = reverse.components;
        } catch (geoErr) {
          console.warn("⚠️ Reverse geocode failed, falling back to raw coordinates:", geoErr?.message);
          formattedAddress = `${latitude}, ${longitude}`;
        }
      }
    }
    // Nếu không, geocode từ address
    else if (address) {
      const geocoded = await geocodeAddress(address);
      customerLat = geocoded.latitude;
      customerLng = geocoded.longitude;
      formattedAddress = geocoded.formattedAddress;
      addressComponents = geocoded.components;
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

    console.log(`🔍 Delivery calculation for distance: ${distance.toFixed(2)}km`);
    console.log(`📦 Available zones (${zones.length}):`, zones.map(z => ({
      name: z.name,
      range: `${z.minDistance}-${z.maxDistance}km`,
      fee: `€${z.deliveryFee}`
    })));

    let matchedZone = null;
    for (const zone of zones) {
      if (distance >= zone.minDistance && distance <= zone.maxDistance) {
        matchedZone = zone;
        console.log(`✅ Matched zone: ${zone.name} (${zone.minDistance}-${zone.maxDistance}km) - Fee: €${zone.deliveryFee}`);
        break;
      }
    }

    // Nếu khách gần hơn cả zone nhỏ nhất (ví dụ < 1km) thì áp dụng zone đầu tiên
    if (!matchedZone && zones.length > 0) {
      const nearestZone = zones[0];
      if (distance < nearestZone.minDistance) {
        matchedZone = nearestZone;
        console.log(`⚠️ Distance ${distance.toFixed(2)}km is less than minimum zone. Using nearest zone: ${nearestZone.name}`);
      }
    }

    if (!matchedZone) {
      console.log(`❌ No zone matched for distance: ${distance.toFixed(2)}km`);
    }


    if (!matchedZone) {
      // Kiểm tra xem có zone nào được setup không
      if (zones.length === 0) {
        return res.json({
          success: false,
          message: "Hiện chưa có khu vực giao hàng được cấu hình. Vui lòng liên hệ nhà hàng để biết thêm chi tiết.",
          messageEn: "No delivery zones are currently configured. Please contact the restaurant for more details.",
          messageSk: "Momentálne nie sú nakonfigurované žiadne zóny doručenia. Prosím kontaktujte reštauráciu pre viac informácií.",
          distance: parseFloat(distance.toFixed(2)),
          address: formattedAddress,
          outOfRange: true,
          noZonesConfigured: true
        });
      }

      // Có zone nhưng địa chỉ ngoài tất cả các zone
      const maxDistance = Math.max(...zones.map(z => z.maxDistance || 0));
      return res.json({
        success: false,
        message: `Xin lỗi, địa chỉ này quá xa (${parseFloat(distance.toFixed(2))}km). Hiện chúng tôi chưa phục vụ giao hàng tại khu vực này. Vui lòng chọn địa chỉ gần hơn hoặc liên hệ nhà hàng để biết thêm chi tiết.`,
        messageEn: `Sorry, this address is too far (${parseFloat(distance.toFixed(2))}km). We currently don't deliver to this area. Please choose a closer address or contact the restaurant for more details.`,
        messageSk: `Ľutujeme, táto adresa je príliš ďaleko (${parseFloat(distance.toFixed(2))}km). Momentálne nedoručujeme do tejto oblasti. Prosím vyberte bližšiu adresu alebo kontaktujte reštauráciu pre viac informácií.`,
        distance: parseFloat(distance.toFixed(2)),
        address: formattedAddress,
        outOfRange: true,
        maxDeliveryDistance: maxDistance
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
        addressComponents,
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

// ========== AUTOCOMPLETE ADDRESS (NOMINATIM/OPENSTREETMAP) ==========
const autocompleteAddress = async (req, res) => {
  try {
    const { query, proximity } = req.query; // proximity: "lng,lat" để ưu tiên kết quả gần nhà hàng

    if (!query || query.length < 3) {
      return res.json({
        success: true,
        data: []
      });
    }

    const encodedQuery = encodeURIComponent(query);
    // Nominatim search API
    // countrycodes=sk: giới hạn trong Slovakia
    // addressdetails=1: lấy chi tiết địa chỉ
    // limit=15: lấy nhiều kết quả để filter
    let url = `${NOMINATIM_BASE_URL}/search?q=${encodedQuery}&format=json&limit=15&countrycodes=sk&addressdetails=1&accept-language=en`;

    // Thêm proximity nếu có (Nominatim dùng viewbox thay vì proximity)
    // viewbox=min_lon,min_lat,max_lon,max_lat
    if (proximity) {
      const [lng, lat] = proximity.split(',').map(parseFloat);
      if (!isNaN(lng) && !isNaN(lat)) {
        // Tạo viewbox xung quanh điểm proximity (khoảng 10km)
        const offset = 0.1; // ~10km
        const viewbox = `${lng - offset},${lat - offset},${lng + offset},${lat + offset}`;
        url += `&viewbox=${viewbox}&bounded=1`;
      }
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let suggestions = [];

    // Parse kết quả từ Nominatim
    if (data && data.length > 0) {
      suggestions = data.map((result, index) => {
        const parsed = nominatimResultToAddress(result);

        // Phân loại ưu tiên:
        // Priority 1: Có số nhà rõ ràng
        // Priority 2: Address nhưng không có số nhà (chỉ tên đường)
        // Priority 3: Place (địa chỉ chung chung)
        const hasHouseNumber = parsed.components.houseNumber &&
          parsed.components.houseNumber.trim().length > 0;
        const isPlace = result.type === 'administrative' ||
          result.type === 'city' ||
          result.type === 'town' ||
          result.type === 'village';
        const priority = hasHouseNumber ? 1 : (isPlace ? 3 : 2);

        return {
          id: result.place_id || result.osm_id || `nominatim-${index}`,
          address: parsed.formattedAddress, // Địa chỉ đã được format ngắn gọn
          shortAddress: parsed.formattedAddress || parsed.components.streetLine || parsed.components.street || result.display_name.split(',')[0],
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          components: parsed.components,
          priority: priority,
          hasHouseNumber: hasHouseNumber
        };
      });
    }

    // ✨ Sắp xếp: ưu tiên địa chỉ có số nhà trước
    suggestions.sort((a, b) => {
      // Ưu tiên theo priority (1 = có số nhà, 2 = address không có số nhà, 3 = place)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Nếu cùng priority, giữ nguyên thứ tự từ Nominatim
      return 0;
    });

    // Chỉ trả về 5 kết quả tốt nhất
    suggestions = suggestions.slice(0, 5);

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
      details: error.response?.data || "Network error or Nominatim API issue"
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
    const { name, address, latitude, longitude, boxFee } = req.body;

    console.log('🔍 Update Restaurant Location - Request body:', req.body);
    console.log('📦 Box Fee received:', boxFee, 'Type:', typeof boxFee);

    // Tìm location hiện tại hoặc tạo mới
    let location = await restaurantLocationModel.findOne({
      isActive: true,
      isPrimary: true
    });

    if (location) {
      const oldBoxFee = location.boxFee;

      location.name = name || location.name;
      location.address = address || location.address;
      location.latitude = latitude || location.latitude;
      location.longitude = longitude || location.longitude;

      // Update box fee if provided
      if (boxFee !== undefined && boxFee !== null) {
        location.boxFee = Number(boxFee);
        console.log(`📦 Box Fee updated: ${oldBoxFee} → ${location.boxFee}`);
      }

      await location.save();
      console.log('✅ Location saved successfully');
    } else {
      location = new restaurantLocationModel({
        name,
        address,
        latitude,
        longitude,
        boxFee: boxFee !== undefined && boxFee !== null ? Number(boxFee) : 0.3,
        isActive: true,
        isPrimary: true
      });
      await location.save();
      console.log('✅ New location created with boxFee:', location.boxFee);
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

