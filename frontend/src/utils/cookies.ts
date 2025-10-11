/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Expiration in days
 */
export const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

/**
 * Get a cookie by name
 * @param name - Cookie name
 * @returns Cookie value or empty string
 */
export const getCookie = (name: string): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return '';
};

/**
 * Remove a cookie
 * @param name - Cookie name
 */
export const removeCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
};