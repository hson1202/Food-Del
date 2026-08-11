import deliveryZoneModel from "../models/deliveryZoneModel.js";
import restaurantLocationModel from "../models/restaurantLocationModel.js";

// ========== OPENSTREETMAP CONFIG ==========
// Autocomplete: Photon (OSM). Geocode/reverse: Nominatim (hardened).
const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
const PHOTON_BASE_URL = process.env.PHOTON_BASE_URL || 'https://photon.komoot.io';
const DEFAULT_MAP_CENTER = { latitude: 48.148598, longitude: 17.107748 }; // Bratislava
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'FoodDeliveryApp/1.0 (checkout; contact@vietbowls.local)';
const NOMINATIM_MIN_INTERVAL_MS = 1100; // public Nominatim policy ~1 req/s
const CACHE_TTL_MS = 5 * 60 * 1000;

const suggestionCache = new Map(); // key -> { expires, data }
const reverseCache = new Map();
let nominatimQueue = Promise.resolve();
let lastNominatimAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCached = (map, key) => {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    map.delete(key);
    return null;
  }
  return hit.data;
};

const setCached = (map, key, data, ttl = CACHE_TTL_MS) => {
  map.set(key, { expires: Date.now() + ttl, data });
};

const roundCoord = (n) => Math.round(Number(n) * 10000) / 10000;

/** Serialize Nominatim calls + retry on 429/5xx */
async function nominatimFetch(url, { retries = 2 } = {}) {
  const run = async () => {
    const wait = Math.max(0, NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastNominatimAt));
    if (wait > 0) await sleep(wait);

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      lastNominatimAt = Date.now();
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': NOMINATIM_USER_AGENT,
            Accept: 'application/json',
          },
        });

        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
          if (attempt < retries) {
            await sleep(NOMINATIM_MIN_INTERVAL_MS * (attempt + 1));
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await sleep(NOMINATIM_MIN_INTERVAL_MS * (attempt + 1));
          continue;
        }
        throw lastError;
      }
    }
    throw lastError;
  };

  const next = nominatimQueue.then(run, run);
  nominatimQueue = next.catch(() => {});
  return next;
}

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

// Photon (komoot) feature → same address shape as Nominatim path
const photonFeatureToAddress = (feature = {}) => {
  const props = feature.properties || {};
  const [longitude, latitude] = feature.geometry?.coordinates || [];

  const components = {
    street: props.street || props.name || "",
    streetLine: "",
    houseNumber: props.housenumber || "",
    city: props.city || props.town || props.village || props.municipality || "",
    village: props.village || props.locality || "",
    town: props.city || props.town || "",
    state: props.state || props.county || props.district || "",
    zipcode: props.postcode || "",
    country: props.country || "",
  };

  // Prefer street name over POI name when both exist
  if (props.street) {
    components.street = props.street;
  }

  components.streetLine = [components.houseNumber, components.street]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!components.streetLine && props.name) {
    components.streetLine = props.name;
  }

  const formattedAddress = formatShortAddress(components) || props.name || "";

  return {
    latitude: parseFloat(latitude) || DEFAULT_MAP_CENTER.latitude,
    longitude: parseFloat(longitude) || DEFAULT_MAP_CENTER.longitude,
    formattedAddress,
    components,
    osmId: props.osm_id,
    osmType: props.osm_type,
    osmKey: props.osm_key,
    countrycode: (props.countrycode || "").toUpperCase(),
    hasHouseNumber: Boolean(components.houseNumber && components.houseNumber.trim()),
    isPlace: !props.street && !props.housenumber,
  };
};

const suggestionFromParsed = (parsed, id, priority) => ({
  id,
  address: parsed.formattedAddress,
  shortAddress: parsed.formattedAddress || parsed.components.streetLine || parsed.components.street,
  latitude: parsed.latitude,
  longitude: parsed.longitude,
  components: parsed.components,
  priority,
  hasHouseNumber: Boolean(parsed.components?.houseNumber?.trim()),
});

const sortAndLimitSuggestions = (suggestions, limit = 5) => {
  suggestions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return 0;
  });
  return suggestions.slice(0, limit);
};

async function autocompleteFromPhoton(query, proximity) {
  const params = new URLSearchParams({
    q: query,
    limit: "15",
    lang: "en",
  });

  if (proximity) {
    const [lng, lat] = proximity.split(",").map(parseFloat);
    if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
      params.set("lon", String(lng));
      params.set("lat", String(lat));
    }
  }

  const url = `${PHOTON_BASE_URL}/api/?${params.toString()}`;
  console.log("🔎 Photon autocomplete:", query);

  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": NOMINATIM_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Photon API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const features = Array.isArray(data?.features) ? data.features : [];

  const suggestions = features
    .map((feature, index) => {
      const parsed = photonFeatureToAddress(feature);
      // Prefer SK; still allow nearby if country missing
      if (parsed.countrycode && parsed.countrycode !== "SK") {
        return null;
      }
      const priority = parsed.hasHouseNumber ? 1 : parsed.isPlace ? 3 : 2;
      return suggestionFromParsed(
        parsed,
        parsed.osmId ? `photon-${parsed.osmType}-${parsed.osmId}` : `photon-${index}`,
        priority
      );
    })
    .filter(Boolean);

  return sortAndLimitSuggestions(suggestions);
}

async function autocompleteFromNominatim(query, proximity) {
  const encodedQuery = encodeURIComponent(query);
  let url = `${NOMINATIM_BASE_URL}/search?q=${encodedQuery}&format=json&limit=15&countrycodes=sk&addressdetails=1&accept-language=en`;

  if (proximity) {
    const [lng, lat] = proximity.split(",").map(parseFloat);
    if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
      const offset = 0.5;
      const viewbox = `${lng - offset},${lat - offset},${lng + offset},${lat + offset}`;
      url += `&viewbox=${viewbox}`;
    }
  }

  console.log("🔎 Nominatim autocomplete fallback:", query);
  const data = await nominatimFetch(url);
  if (!data || data.length === 0) return [];

  const suggestions = data.map((result, index) => {
    const parsed = nominatimResultToAddress(result);
    const hasHouseNumber = Boolean(parsed.components.houseNumber?.trim());
    const isPlace =
      result.type === "administrative" ||
      result.type === "city" ||
      result.type === "town" ||
      result.type === "village";
    const priority = hasHouseNumber ? 1 : isPlace ? 3 : 2;
    return suggestionFromParsed(
      parsed,
      result.place_id || result.osm_id || `nominatim-${index}`,
      priority
    );
  });

  return sortAndLimitSuggestions(suggestions);
}

// ========== HAVERSINE FORMULA ==========
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

// ========== GEOCODING WITH NOMINATIM (OPENSTREETMAP) ==========
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${NOMINATIM_BASE_URL}/search?q=${encodedAddress}&format=json&limit=5&countrycodes=sk&addressdetails=1&accept-language=en`;

    console.log("🔍 Geocoding address with Nominatim:", address);
    const data = await nominatimFetch(url);

    if (!data || data.length === 0) {
      throw new Error("Address not found");
    }

    let bestParsed = nominatimResultToAddress(data[0]);

    for (const result of data) {
      const parsed = nominatimResultToAddress(result);
      if (parsed.components.houseNumber && parsed.components.houseNumber.trim().length > 0) {
        bestParsed = parsed;
        console.log("✅ Found address with house number:", parsed.components.houseNumber);
        break;
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
  const cacheKey = `${roundCoord(latitude)},${roundCoord(longitude)}`;
  const cached = getCached(reverseCache, cacheKey);
  if (cached) {
    console.log("♻️ Reverse geocode cache hit:", cacheKey);
    return cached;
  }

  try {
    const url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=en`;
    console.log("🔄 Reverse geocoding coordinates with Nominatim:", latitude, longitude);

    const data = await nominatimFetch(url);

    if (!data || !data.lat || !data.lon) {
      throw new Error("Reverse geocoding failed");
    }

    const parsedResult = nominatimResultToAddress(data);
    if (!parsedResult.formattedAddress || !String(parsedResult.formattedAddress).trim()) {
      throw new Error("Reverse geocoding returned empty address");
    }

    setCached(reverseCache, cacheKey, parsedResult);

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
          console.warn("⚠️ Reverse geocode failed (no coordinate fallback):", geoErr?.message);
          return res.status(422).json({
            success: false,
            reverseGeocodeFailed: true,
            message: "Không xác định được địa chỉ từ vị trí này. Vui lòng nhập địa chỉ hoặc chọn lại trên bản đồ.",
            messageEn: "Could not determine an address for this location. Please enter an address or pick again on the map.",
            messageSk: "Nepodarilo sa určiť adresu pre túto polohu. Prosím zadajte adresu alebo vyberte znova na mape.",
            coordinates: {
              latitude: customerLat,
              longitude: customerLng
            }
          });
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

// ========== AUTOCOMPLETE ADDRESS (PHOTON → NOMINATIM FALLBACK) ==========
const autocompleteAddress = async (req, res) => {
  try {
    const { query, proximity } = req.query;

    if (!query || query.length < 3) {
      return res.json({
        success: true,
        data: []
      });
    }

    const cacheKey = `${String(query).trim().toLowerCase()}|${proximity || ""}`;
    const cached = getCached(suggestionCache, cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    let suggestions = [];
    try {
      suggestions = await autocompleteFromPhoton(query, proximity);
    } catch (photonErr) {
      console.warn("⚠️ Photon autocomplete failed:", photonErr?.message);
    }

    if (!suggestions.length) {
      try {
        suggestions = await autocompleteFromNominatim(query, proximity);
      } catch (nominatimErr) {
        console.error("❌ Nominatim autocomplete fallback failed:", nominatimErr?.message);
        if (!suggestions.length) {
          throw nominatimErr;
        }
      }
    }

    setCached(suggestionCache, cacheKey, suggestions);

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error("❌ Autocomplete error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: "Network error or OSM geocoding API issue"
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

