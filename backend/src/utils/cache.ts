/**
 * Simple in-memory cache with TTL (Time-To-Live).
 * Suitable for caching leaderboard results, dashboard stats,
 * and other frequently accessed but infrequently changing data.
 */
interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class MemoryCache {
    private store = new Map<string, CacheEntry<any>>();
    private maxSize: number;

    constructor(maxSize = 500) {
        this.maxSize = maxSize;

        // Periodic cleanup every 5 minutes to prevent memory buildup
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Get a cached value by key.
     * Returns undefined if key doesn't exist or has expired.
     */
    get<T>(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }

        return entry.data as T;
    }

    /**
     * Set a cached value with a TTL in seconds.
     */
    set<T>(key: string, data: T, ttlSeconds: number): void {
        // Evict oldest entries if cache is full
        if (this.store.size >= this.maxSize) {
            const firstKey = this.store.keys().next().value;
            if (firstKey) this.store.delete(firstKey);
        }

        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    /**
     * Invalidate a specific cache key or all keys matching a prefix.
     */
    invalidate(keyOrPrefix: string): void {
        if (this.store.has(keyOrPrefix)) {
            this.store.delete(keyOrPrefix);
            return;
        }

        // Prefix-based invalidation
        for (const key of this.store.keys()) {
            if (key.startsWith(keyOrPrefix)) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Remove all expired entries.
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }

    /** Current cache size */
    get size(): number {
        return this.store.size;
    }
}

// Singleton cache instance
export const cache = new MemoryCache();
