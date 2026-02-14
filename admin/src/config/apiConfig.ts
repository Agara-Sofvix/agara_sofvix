const _v = import.meta.env.VITE_API_URL;
// Use relative path '/api' by default so it works on both localhost (via proxy) and external IPs (via Nginx)
const API_BASE_URL = _v === '' ? '/api' : (_v || '/api');

export const ADMIN_API_URL = `${API_BASE_URL}/admin`;
export const PUBLIC_API_URL = API_BASE_URL;
// Socket origin should also infer from window.location if not specified, or use relative
export const SOCKET_ORIGIN = _v === '' ? (typeof window !== 'undefined' ? window.location.origin : '') : (_v ? _v.replace(/\/api\/?$/, '') : '');

export default API_BASE_URL;
