import { CacheRepository } from "../../application/ports/CacheRepository";
import { config } from "../../config/env";

export class LocalStorageCacheRepository implements CacheRepository {
  private readonly TTL_KEY_SUFFIX = "_ttl";

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T, ttlHours: number = config.cacheTTLHours): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      const expirationTime = Date.now() + ttlHours * 60 * 60 * 1000;
      localStorage.setItem(
        key + this.TTL_KEY_SUFFIX,
        expirationTime.toString()
      );
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }

  isExpired(key: string): boolean {
    const ttlKey = key + this.TTL_KEY_SUFFIX;
    const expirationTime = localStorage.getItem(ttlKey);

    if (!expirationTime) return true;

    return Date.now() > parseInt(expirationTime, 10);
  }

  clear(key: string): void {
    localStorage.removeItem(key);
    localStorage.removeItem(key + this.TTL_KEY_SUFFIX);
  }
}
