/**
 * Validation utilities for Location forms
 */

/**
 * Validates a city name to ensure it contains only letters, spaces, and hyphens
 * @param cityName - The city name to validate
 * @returns true if valid, false otherwise
 */
export const isValidCityName = (cityName: string): boolean => {
  if (!cityName || !cityName.trim()) {
    return false;
  }

  // allow letters, spaces, hyphens, and apostrophes
  const cityNameRegex =
    /^[a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/;

  return cityNameRegex.test(cityName.trim());
};

/**
 * Normalizes a city name for consistent storage and comparison
 * @param cityName - The city name to normalize
 * @returns normalized city name
 */
export const normalizeCityName = (cityName: string): string => {
  return cityName
    .trim()
    .replace(/\s+/g, " ") // replace multiple spaces with single space
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Extracts the city name from a location name that follows format "Location Name - City"
 * @param locationName - The full location name
 * @returns the city name or the original location name if no city is found
 */
export const extractCityFromLocationName = (locationName: string): string => {
  if (!locationName) return "";

  const dashIndex = locationName.lastIndexOf(" - ");
  if (dashIndex !== -1) {
    return locationName.substring(dashIndex + 3).trim();
  }

  // if no city format found, return the original name
  return locationName;
};
