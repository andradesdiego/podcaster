import { describe, it, expect } from 'vitest';
import { config } from '../env';

describe('env.ts', () => {
  it('should export config object with all required properties', () => {
    expect(config).toHaveProperty('topPodcastsUrl');
    expect(config).toHaveProperty('lookupUrl');
    expect(config).toHaveProperty('cacheTTLHours');
    expect(config).toHaveProperty('useCorsProxy');
  });

  it('should have correct property types', () => {
    expect(typeof config.topPodcastsUrl).toBe('string');
    expect(typeof config.lookupUrl).toBe('string');
    expect(typeof config.cacheTTLHours).toBe('number');
    expect(typeof config.useCorsProxy).toBe('boolean');
  });

  it('should have valid topPodcastsUrl format', () => {
    expect(config.topPodcastsUrl).toContain('toppodcasts');
    expect(config.topPodcastsUrl).toContain('genre=1310');
    expect(config.topPodcastsUrl).toMatch(/\/json$/);
  });

  it('should have valid lookupUrl', () => {
    const validUrls = ['/lookup', '/api/episodes'];
    expect(validUrls).toContain(config.lookupUrl);
  });

  it('should have reasonable cacheTTLHours', () => {
    expect(config.cacheTTLHours).toBeGreaterThan(0);
    expect(config.cacheTTLHours).toBeLessThanOrEqual(8760);
  });
});