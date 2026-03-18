import { InvestigationResponse } from "./types";

/**
 * Simple in-memory LRU cache for investigation results.
 * Works for single-instance deployment (Vercel serverless functions are ephemeral,
 * so this mainly helps with burst traffic on the same instance).
 * 
 * For production scale, swap this with Vercel KV or Upstash Redis.
 */

interface CacheEntry {
  data: InvestigationResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 500;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function normalizeKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getCached(name: string): InvestigationResponse | null {
  const key = normalizeKey(name);
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCache(name: string, data: InvestigationResponse): void {
  const key = normalizeKey(name);
  
  // Evict oldest entries if at capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlMs: CACHE_TTL_MS,
  };
}
