import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import "dotenv/config.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const coll = mongoose.connection.collection("categories");

    // Try drop old unique index on name if exists
    try {
      await coll.dropIndex("name_1");
      console.log("Dropped old index name_1");
    } catch (e) {
      console.log("Index name_1 not present or already dropped");
    }

    // Ensure new compound index exists
    await categoryModel.syncIndexes();
    console.log("Synced indexes for categoryModel");
  } catch (err) {
    console.error("Failed to fix indexes:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();


















