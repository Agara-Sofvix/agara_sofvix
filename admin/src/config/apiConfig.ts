const _v = import.meta.env.VITE_API_URL;
// Use relative path '/api' by default if no URL provided (works for EC2 + proxy)
const API_BASE_URL = _v === '' ? '/api' : (_v || '/api');

export const ADMIN_API_URL = `${API_BASE_URL}/admin`;
export const PUBLIC_API_URL = API_BASE_URL;
export const SOCKET_ORIGIN = _v === '' ? (typeof window !== 'undefined' ? window.location.origin : '') : (_v ? _v.replace(/\/api\/?$/, '') : '');

/** Base URL for serving uploaded assets. Ensure it uses origin if using relative API paths or empty strings to prevent sub-path (e.g. /admin/) resolution issues. */
export const getUploadBaseUrl = () => {
    const rawBase = (_v && _v !== '') ? _v.replace(/\/api\/?$/, '') : '';
    // If we have a hardcoded base (like a different domain/port) use it, otherwise use current origin
    return rawBase || (typeof window !== 'undefined' ? window.location.origin : '');
};

export default API_BASE_URL;
