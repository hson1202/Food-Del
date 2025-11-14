import mongoose from "mongoose";
import "dotenv/config";
import deliveryZoneModel from "../models/deliveryZoneModel.js";
import restaurantLocationModel from "../models/restaurantLocationModel.js";

const MONGODB_URL = process.env.MONGODB_URI || process.env.MONGODB_URL;

// Default delivery zones (theo ảnh của bạn)
const defaultZones = [
  {
    name: "1-3 Km",
    minDistance: 1,
    maxDistance: 3,
    deliveryFee: 0,
    minOrder: 8,
    estimatedTime: 25,
    color: "#3B82F6", // Blue
    order: 1
  },
  {
    name: "3-5 Km",
    minDistance: 3,
    maxDistance: 5,
    deliveryFee: 2,
    minOrder: 9,
    estimatedTime: 30,
    color: "#8B5CF6", // Purple
    order: 2
  },
  {
    name: "5-7 Km",
    minDistance: 5,
    maxDistance: 7,
    deliveryFee: 3,
    minOrder: 10,
    estimatedTime: 40,
    color: "#06B6D4", // Cyan
    order: 3
  },
  {
    name: "7-12 km",
    minDistance: 7,
    maxDistance: 12,
    deliveryFee: 3.5,
    minOrder: 10,
    estimatedTime: 45,
    color: "#EC4899", // Pink
    order: 4
  }
];

// Default restaurant location (Bratislava - cập nhật vị trí thực tế của bạn)
const defaultRestaurant = {
  name: "VietBowls Restaurant",
  address: "Bratislava, Slovakia", // Cập nhật địa chỉ thực tế
  latitude: 48.1486, // Cập nhật latitude thực tế
  longitude: 17.1077, // Cập nhật longitude thực tế
  isActive: true,
  isPrimary: true
};

async function seedDeliveryZones() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("✅ Connected to MongoDB");
    
    // Seed delivery zones
    console.log("\n📦 Seeding delivery zones...");
    
    // Xóa zones cũ (nếu muốn reset)
    const existingZones = await deliveryZoneModel.countDocuments();
    if (existingZones > 0) {
      console.log(`⚠️  Found ${existingZones} existing zones. Delete and recreate? (yes/no)`);
      console.log("   Skipping deletion for safety. To reset, manually delete zones first.");
    } else {
      for (const zone of defaultZones) {
        const newZone = new deliveryZoneModel(zone);
        await newZone.save();
        console.log(`✅ Created zone: ${zone.name} (${zone.minDistance}-${zone.maxDistance}km)`);
      }
    }
    
    // Seed restaurant location
    console.log("\n📍 Seeding restaurant location...");
    const existingLocation = await restaurantLocationModel.findOne({ isPrimary: true });
    
    if (existingLocation) {
      console.log(`⚠️  Restaurant location already exists: ${existingLocation.name}`);
      console.log(`   Location: ${existingLocation.address}`);
      console.log(`   Coordinates: ${existingLocation.latitude}, ${existingLocation.longitude}`);
    } else {
      const newLocation = new restaurantLocationModel(defaultRestaurant);
      await newLocation.save();
      console.log(`✅ Created restaurant location: ${newLocation.name}`);
      console.log(`   Address: ${newLocation.address}`);
      console.log(`   Coordinates: ${newLocation.latitude}, ${newLocation.longitude}`);
    }
    
    console.log("\n🎉 Seeding completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Update restaurant coordinates in Admin panel");
    console.log("2. Add MAPBOX_ACCESS_TOKEN to .env");
    console.log("3. Test delivery calculation: POST /api/delivery/calculate");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDeliveryZones();

