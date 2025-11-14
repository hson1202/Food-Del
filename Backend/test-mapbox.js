// Quick test script for Mapbox API
import "dotenv/config";

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

async function testMapbox() {
  console.log("\n🧪 Testing Mapbox Configuration...\n");
  
  // 1. Check if token exists
  if (!MAPBOX_ACCESS_TOKEN) {
    console.error("❌ MAPBOX_ACCESS_TOKEN not found in .env!");
    console.log("\nTo fix:");
    console.log("1. Get token from: https://account.mapbox.com/access-tokens");
    console.log("2. Add to Backend/.env:");
    console.log("   MAPBOX_ACCESS_TOKEN=pk.your_token_here");
    process.exit(1);
  }
  
  console.log("✅ Token found:", MAPBOX_ACCESS_TOKEN.substring(0, 20) + "...");
  
  // 2. Test Geocoding API
  console.log("\n🔍 Testing Geocoding API...");
  
  try {
    const testAddress = "Bratislava, Slovakia";
    const encodedAddress = encodeURIComponent(testAddress);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.message) {
      console.error("❌ Mapbox API Error:", data.message);
      
      if (data.message.includes("Not Authorized") || data.message.includes("401")) {
        console.log("\n🔧 Fix:");
        console.log("1. Your token is invalid or expired");
        console.log("2. Get new token: https://account.mapbox.com/access-tokens");
        console.log("3. Make sure to use PUBLIC token (starts with 'pk.')");
      }
      
      process.exit(1);
    }
    
    if (!data.features || data.features.length === 0) {
      console.error("❌ No results found");
      process.exit(1);
    }
    
    const [longitude, latitude] = data.features[0].center;
    const placeName = data.features[0].place_name;
    
    console.log("✅ Geocoding works!");
    console.log(`   Address: ${testAddress}`);
    console.log(`   Result: ${placeName}`);
    console.log(`   Coordinates: ${latitude}, ${longitude}`);
    
  } catch (error) {
    console.error("❌ Network error:", error.message);
    console.log("\nPossible issues:");
    console.log("- No internet connection");
    console.log("- Firewall blocking Mapbox API");
    console.log("- Mapbox API is down (rare)");
    process.exit(1);
  }
  
  // 3. Test Autocomplete API
  console.log("\n🔍 Testing Autocomplete API...");
  
  try {
    const query = "brat";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=3&types=address,place`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      console.log("✅ Autocomplete works!");
      console.log(`   Query: "${query}"`);
      console.log(`   Found ${data.features.length} results:`);
      data.features.forEach((f, i) => {
        console.log(`   ${i+1}. ${f.place_name}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Autocomplete test failed:", error.message);
  }
  
  console.log("\n🎉 All tests passed! Mapbox is configured correctly.\n");
  console.log("Next steps:");
  console.log("1. Run seed script: node scripts/seedDeliveryZones.js");
  console.log("2. Configure restaurant location in Admin Panel");
  console.log("3. Test on frontend: http://localhost:3000/order\n");
}

testMapbox().catch(error => {
  console.error("\n❌ Test failed:", error);
  process.exit(1);
});

