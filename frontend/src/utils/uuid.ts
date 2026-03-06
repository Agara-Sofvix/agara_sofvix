/**
 * Generates a unique UUID (v4).
 * Uses crypto.randomUUID() if available (Secure Contexts: HTTPS/localhost).
 * Falls back to a math-based implementation otherwise.
 */
export const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback implementation for non-secure contexts (HTTP)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
