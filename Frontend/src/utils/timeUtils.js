/**
 * Utility functions for time-based food availability
 */

/**
 * Check if a food item is currently available based on time settings
 * @param {Object} food - Food item object
 * @returns {Boolean} - True if available, false otherwise
 */
export const isFoodAvailable = (food) => {
  if (!food) return false;

  const now = new Date();

  // Check date-based availability (availableFrom & availableTo)
  if (food.availableFrom || food.availableTo) {
    const availableFrom = food.availableFrom ? new Date(food.availableFrom) : null;
    const availableTo = food.availableTo ? new Date(food.availableTo) : null;

    if (availableFrom && now < availableFrom) {
      return false; // Not yet available
    }

    if (availableTo && now > availableTo) {
      return false; // No longer available
    }
  }

  // Check daily time-based availability (dailyAvailability)
  if (food.dailyAvailability?.enabled) {
    const { timeFrom, timeTo } = food.dailyAvailability;
    
    if (timeFrom && timeTo) {
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (currentTime < timeFrom || currentTime > timeTo) {
        return false; // Outside daily time window
      }
    }
  }

  return true; // Available
};

/**
 * Get availability status message
 * @param {Object} food - Food item object
 * @param {String} language - Current language (vi, en, sk)
 * @returns {Object} - {available: Boolean, message: String, timeInfo: String}
 */
export const getAvailabilityStatus = (food, language = 'vi') => {
  const messages = {
    vi: {
      available: 'Có sẵn',
      notYetAvailable: 'Chưa có',
      noLongerAvailable: 'Hết giờ',
      availableTime: 'Phục vụ',
      from: 'từ',
      to: 'đến'
    },
    en: {
      available: 'Available',
      notYetAvailable: 'Not yet available',
      noLongerAvailable: 'No longer available',
      availableTime: 'Available',
      from: 'from',
      to: 'to'
    },
    sk: {
      available: 'Dostupné',
      notYetAvailable: 'Ešte nie je k dispozícii',
      noLongerAvailable: 'Už nie je k dispozícii',
      availableTime: 'Dostupné',
      from: 'od',
      to: 'do'
    }
  };

  const t = messages[language] || messages.vi;
  const now = new Date();

  // Check date-based availability
  if (food.availableFrom || food.availableTo) {
    const availableFrom = food.availableFrom ? new Date(food.availableFrom) : null;
    const availableTo = food.availableTo ? new Date(food.availableTo) : null;

    if (availableFrom && now < availableFrom) {
      return {
        available: false,
        message: t.notYetAvailable,
        timeInfo: `${t.from} ${formatDateTime(availableFrom, language)}`
      };
    }

    if (availableTo && now > availableTo) {
      return {
        available: false,
        message: t.noLongerAvailable,
        timeInfo: `${t.to} ${formatDateTime(availableTo, language)}`
      };
    }
  }

  // Check daily time availability
  if (food.dailyAvailability?.enabled) {
    const { timeFrom, timeTo } = food.dailyAvailability;
    
    if (timeFrom && timeTo) {
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const isAvailable = currentTime >= timeFrom && currentTime <= timeTo;
      
      return {
        available: isAvailable,
        message: isAvailable ? t.available : t.noLongerAvailable,
        timeInfo: `${timeFrom} - ${timeTo}`
      };
    }
  }

  return {
    available: true,
    message: t.available,
    timeInfo: null
  };
};

/**
 * Format date time for display
 * @param {Date} date
 * @param {String} language
 * @returns {String}
 */
const formatDateTime = (date, language = 'vi') => {
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : language === 'sk' ? 'sk-SK' : 'en-US', options).format(date);
};

/**
 * Format time string (HH:MM)
 * @param {String} timeString - "HH:MM" format
 * @returns {String} - Formatted time
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString;
};

/**
 * Calculate time remaining until available or until no longer available
 * @param {Object} food
 * @returns {Object} - {minutes: Number, isStarting: Boolean}
 */
export const getTimeRemaining = (food) => {
  const now = new Date();

  // Check daily availability
  if (food.dailyAvailability?.enabled) {
    const { timeFrom, timeTo } = food.dailyAvailability;
    
    if (timeFrom) {
      const [hours, minutes] = timeFrom.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);

      if (now < targetTime) {
        // Starting soon
        const diffMs = targetTime - now;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return { minutes: diffMinutes, isStarting: true };
      }
    }

    if (timeTo) {
      const [hours, minutes] = timeTo.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);

      if (now < targetTime) {
        // Ending soon
        const diffMs = targetTime - now;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return { minutes: diffMinutes, isStarting: false };
      }
    }
  }

  return null;
};

