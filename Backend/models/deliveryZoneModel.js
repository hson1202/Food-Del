import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  minDistance: {
    type: Number,
    required: true,
    min: 0
  },
  maxDistance: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minOrder: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true,
    min: 0,
    default: 30
  },
  color: {
    type: String,
    default: "#3B82F6"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
deliveryZoneSchema.index({ minDistance: 1, maxDistance: 1 });
deliveryZoneSchema.index({ isActive: 1 });

const deliveryZoneModel = mongoose.models.deliveryZone || mongoose.model("deliveryZone", deliveryZoneSchema);

export default deliveryZoneModel;

