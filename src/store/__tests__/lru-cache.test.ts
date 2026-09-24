import { describe, it, expect } from 'vitest';
import { LruCache } from '../lru-cache';

describe('LRU Cache', () => {
  it('stores and retrieves values', () => {
    const cache = new LruCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBeUndefined();
  });

  it('evicts the least recently used item when capacity is exceeded', () => {
    const cache = new LruCache<string, string>(3);
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    cache.set('k3', 'v3');

    // Access k1 so k2 becomes the least recently used
    cache.get('k1');

    // Add k4, which should evict k2
    cache.set('k4', 'v4');

    expect(cache.get('k1')).toBe('v1');
    expect(cache.get('k2')).toBeUndefined(); // Evicted!
    expect(cache.get('k3')).toBe('v3');
    expect(cache.get('k4')).toBe('v4');
  });

  it('updates existing keys without increasing size', () => {
    const cache = new LruCache<string, number>(2);
    cache.set('a', 10);
    cache.set('b', 20);
    cache.set('a', 30); // update

    expect(cache.get('a')).toBe(30);
    expect(cache.size).toBe(2);

    cache.set('c', 40); // should evict b, because a was recently updated
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(30);
    expect(cache.get('c')).toBe(40);
  });
});
