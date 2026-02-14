const base = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL != null
  ? (import.meta.env.VITE_API_URL as string)
  : 'http://localhost:5001';
export const API_BASE = base ? `${base.replace(/\/$/, '')}/api` : '/api';
export const SOCKET_ORIGIN = base || (typeof window !== 'undefined' ? window.location.origin : '');

/** Base URL for serving uploaded assets (e.g. logo). Use this so uploads load when API is on a different port than the app. */
export const getUploadBaseUrl = () => {
  const b = base ? base.replace(/\/$/, '') : '';
  return b || (typeof window !== 'undefined' ? window.location.origin : '');
};
