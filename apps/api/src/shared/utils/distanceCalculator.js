/**
 * Distance Calculator Utility
 * Calculates delivery fees based on distance
 */

/**
 * Calculate premium delivery fee based on distance (in km)
 * Pricing structure:
 * - 0-2 km: ₹20
 * - 2-4 km: ₹30
 * - 4-6 km: ₹40
 * - 6-8 km: ₹50
 * - 8-10 km: ₹60
 * - 10+ km: ₹70
 */
export const calculatePremiumDeliveryFee = (distance) => {
  if (!distance || distance <= 0) return 0;
  
  if (distance <= 2) return 20;
  if (distance <= 4) return 30;
  if (distance <= 6) return 40;
  if (distance <= 8) return 50;
  if (distance <= 10) return 60;
  return 70; // Maximum fee for 10+ km
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate delivery fee for one-time orders
 * Normal delivery (1 hour): Free
 * Premium delivery (30 min): Based on distance
 */
export const calculateOneTimeDeliveryFee = (deliveryType, distance) => {
  if (deliveryType === 'normal') {
    return 0; // Free for normal delivery
  }
  
  if (deliveryType === 'premium') {
    return calculatePremiumDeliveryFee(distance);
  }
  
  return 0;
};

/**
 * Calculate delivery fee for subscription orders
 * Always free for subscriptions
 */
export const calculateSubscriptionDeliveryFee = () => {
  return 0; // Always free
};

/**
 * Get delivery time estimate based on type
 */
export const getDeliveryTimeEstimate = (deliveryType) => {
  if (deliveryType === 'premium') {
    return '30 minutes';
  }
  return '1 hour';
};

export default {
  calculatePremiumDeliveryFee,
  calculateDistance,
  calculateOneTimeDeliveryFee,
  calculateSubscriptionDeliveryFee,
  getDeliveryTimeEstimate,
};

