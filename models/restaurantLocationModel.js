import mongoose from "mongoose";

const restaurantLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "VietBowls Restaurant"
  },
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: true
  },
  boxFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0.3  // Default 0.3€
  }
}, {
  timestamps: true
});

// Chỉ cho phép 1 location active làm primary
restaurantLocationSchema.index({ isPrimary: 1, isActive: 1 });

const restaurantLocationModel = mongoose.models.restaurantLocation || mongoose.model("restaurantLocation", restaurantLocationSchema);

export default restaurantLocationModel;

