/**
 * API Configuration Utility
 * Handles API URLs for both development and production environments
 */

/**
 * Get the base API URL based on environment
 * @returns {string} The base API URL
 */
export const getAPIBaseURL = () => {
  // In production, use relative URLs (same domain)
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // In development, use the environment variable or localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

/**
 * Get the health check URL
 * @returns {string} The health check URL
 */
export const getHealthURL = () => {
  // In production, use relative URL
  if (process.env.NODE_ENV === 'production') {
    return '/health';
  }
  // In development, use localhost
  return 'http://localhost:5000/health';
};

/**
 * Get the full API endpoint URL
 * @param {string} endpoint - The API endpoint (e.g., '/demo/query')
 * @returns {string} The full API URL
 */
export const getAPIURL = (endpoint) => {
  const baseURL = getAPIBaseURL();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseURL}/${cleanEndpoint}`;
};

/**
 * Check if we're in production environment
 * @returns {boolean} True if in production
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if we're in development environment
 * @returns {boolean} True if in development
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

export default {
  getAPIBaseURL,
  getHealthURL,
  getAPIURL,
  isProduction,
  isDevelopment
};
