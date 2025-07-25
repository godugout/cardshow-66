/**
 * CSRF Protection Utilities
 * Provides Cross-Site Request Forgery protection for forms and API calls
 */

// Generate a secure random CSRF token
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Store CSRF token in sessionStorage (more secure than localStorage)
export const storeCSRFToken = (token: string): void => {
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch (error) {
    console.warn('Failed to store CSRF token:', error);
  }
};

// Retrieve CSRF token from sessionStorage
export const getCSRFToken = (): string | null => {
  try {
    return sessionStorage.getItem('csrf_token');
  } catch (error) {
    console.warn('Failed to retrieve CSRF token:', error);
    return null;
  }
};

// Validate CSRF token
export const validateCSRFToken = (providedToken: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === providedToken;
};

// Initialize CSRF protection for the session
export const initializeCSRFProtection = (): string => {
  let token = getCSRFToken();
  
  if (!token) {
    token = generateCSRFToken();
    storeCSRFToken(token);
  }
  
  return token;
};

// Add CSRF token to form data
export const addCSRFTokenToFormData = (formData: FormData): FormData => {
  const token = getCSRFToken();
  if (token) {
    formData.append('csrf_token', token);
  }
  return formData;
};

// Add CSRF token to request headers
export const addCSRFTokenToHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getCSRFToken();
  if (token) {
    headers['X-CSRF-Token'] = token;
  }
  return headers;
};

// React hook for CSRF protection
export const useCSRFProtection = () => {
  const token = initializeCSRFProtection();
  
  return {
    token,
    addToFormData: addCSRFTokenToFormData,
    addToHeaders: addCSRFTokenToHeaders,
    validate: validateCSRFToken
  };
};