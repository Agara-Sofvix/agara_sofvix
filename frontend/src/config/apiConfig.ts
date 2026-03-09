const base = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL
  ? ((import.meta as any).env.VITE_API_URL as string)
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '80' ? 'http://localhost:5001' : '');

export const API_BASE = base ? `${base.replace(/\/$/, '')}/api` : '/api';
export const SOCKET_ORIGIN = base || (typeof window !== 'undefined' ? window.location.origin : '');

/** Base URL for serving uploaded assets (e.g. logo). Use this so uploads load when API is on a different port than the app. */
export const getUploadBaseUrl = () => {
  const b = base ? base.replace(/\/$/, '') : '';
  // If no base specified, use origin so relative /uploads/ paths work correctly via Nginx proxy
  return b || (typeof window !== 'undefined' ? window.location.origin : '');
};

export const getFullProfileUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = getUploadBaseUrl().replace(/\/$/, '');

  let cleanPath = path || '';
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // Fallback for old records that missing the /avatars/ or /uploads/ prefix
  if (!cleanPath.includes('/', 1)) {
    if (cleanPath.includes('male') || cleanPath.includes('female')) {
      cleanPath = `/avatars${cleanPath}`;
    } else {
      cleanPath = `/uploads${cleanPath}`;
    }
  }

  return `${baseUrl}${cleanPath}`;
};
