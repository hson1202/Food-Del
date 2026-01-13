import mongoose from 'mongoose';

const restaurantInfoSchema = new mongoose.Schema({
  // Basic Information
  restaurantName: {
    type: String,
    default: 'Viet Bowls'
  },
  
  // Contact Information
  phone: {
    type: String,
    default: '+421 123 456 789'
  },
  email: {
    type: String,
    default: 'info@vietbowls.sk'
  },
  
  // Address
  address: {
    type: String,
    default: 'Hlavná 33/36, 927 01 Šaľa, Slovakia'
  },
  
  // Opening Hours
  openingHours: {
    weekdays: {
      type: String,
      default: 'Thứ 2 - Thứ 7: 11:00 - 20:00'
    },
    sunday: {
      type: String,
      default: 'Chủ nhật: 11:00 - 17:00'
    }
  },
  
  // Social Media Links
  socialMedia: {
    facebook: {
      type: String,
      default: 'https://facebook.com'
    },
    twitter: {
      type: String,
      default: 'https://twitter.com'
    },
    linkedin: {
      type: String,
      default: 'https://linkedin.com'
    },
    instagram: {
      type: String,
      default: ''
    }
  },
  
  // Google Maps
  googleMapsUrl: {
    type: String,
    default: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12630.561638352605!2d17.871616!3d48.149105!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b6d006b93bc13%3A0x625b631240812045!2sVIET%20BOWLS!5e1!3m2!1svi!2sus!4v1754749939682!5m2!1svi!2sus'
  },
  
  // Multilingual support
  translations: {
    vi: {
      restaurantName: { type: String, default: 'Viet Bowls' },
      address: { type: String, default: 'Hlavná 33/36, 927 01 Šaľa, Slovakia' },
      openingHours: {
        weekdays: { type: String, default: 'Thứ 2 - Thứ 7: 11:00 - 20:00' },
        sunday: { type: String, default: 'Chủ nhật: 11:00 - 17:00' }
      }
    },
    en: {
      restaurantName: { type: String, default: 'Viet Bowls' },
      address: { type: String, default: 'Hlavná 33/36, 927 01 Šaľa, Slovakia' },
      openingHours: {
        weekdays: { type: String, default: 'Mon - Sat: 11:00 AM - 8:00 PM' },
        sunday: { type: String, default: 'Sunday: 11:00 AM - 5:00 PM' }
      }
    },
    sk: {
      restaurantName: { type: String, default: 'Viet Bowls' },
      address: { type: String, default: 'Hlavná 33/36, 927 01 Šaľa, Slovakia' },
      openingHours: {
        weekdays: { type: String, default: 'Pon - Sob: 11:00 - 20:00' },
        sunday: { type: String, default: 'Nedeľa: 11:00 - 17:00' }
      }
    }
  },
  
  // Copyright text
  copyrightText: {
    type: String,
    default: '© 2024 Viet Bowls. All rights reserved.'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one restaurant info document exists
restaurantInfoSchema.statics.getSingleton = async function() {
  let info = await this.findOne();
  
  // If no info exists, create default one
  if (!info) {
    info = await this.create({});
  }
  
  return info;
};

const RestaurantInfo = mongoose.model('RestaurantInfo', restaurantInfoSchema);

export default RestaurantInfo;
