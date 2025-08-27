// Utility functions for authentication state management

/**
 * Sets the authentication token and notifies all components about the auth state change
 * @param {string} token - The authentication token
 */
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
  window.dispatchEvent(new Event('authStateChanged'));
};

/**
 * Removes the authentication token and notifies all components about the auth state change
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('expiresAt');
  window.dispatchEvent(new Event('authStateChanged'));
};

/**
 * Gets the current authentication token
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Checks if the user is currently authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Sets up a listener for authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Cleanup function to remove the listener
 */
export const onAuthStateChange = (callback) => {
  const handleAuthChange = () => callback();
  
  window.addEventListener('storage', handleAuthChange);
  window.addEventListener('authStateChanged', handleAuthChange);
  
  return () => {
    window.removeEventListener('storage', handleAuthChange);
    window.removeEventListener('authStateChanged', handleAuthChange);
  };
};
