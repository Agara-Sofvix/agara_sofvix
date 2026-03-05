const _v = import.meta.env.VITE_API_URL;
// Use relative path '/api' by default if no URL provided (works for EC2 + proxy)
const API_BASE_URL = _v === '' ? '/api' : (_v || '/api');

export const ADMIN_API_URL = `${API_BASE_URL}/admin`;
export const PUBLIC_API_URL = API_BASE_URL;
export const SOCKET_ORIGIN = _v === '' ? (typeof window !== 'undefined' ? window.location.origin : '') : (_v ? _v.replace(/\/api\/?$/, '') : '');

/** Base URL for serving uploaded assets. Ensure it uses origin if using relative API paths. */
export const getUploadBaseUrl = () => {
    return (_v && _v !== '') ? _v.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : '');
};

export default API_BASE_URL;
