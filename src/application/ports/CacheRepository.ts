export interface CacheRepository {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlHours?: number): void;
  isExpired(key: string): boolean;
  clear(key: string): void;
}
