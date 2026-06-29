import { readStorage, writeStorage } from './storage.js'

const API_CACHE_KEYS = ['moe-wallpaper-yeqing-pc-list', 'moe-wallpaper-yeqing-pe-list']

export function getCache(key, fallback = null) {
  const cached = readStorage(key, null)
  if (!cached || typeof cached !== 'object') return fallback
  if (cached.expiresAt && cached.expiresAt < Date.now()) {
    uni.removeStorageSync(key)
    return fallback
  }
  return cached.data ?? fallback
}

export function setCache(key, data, ttlMs) {
  writeStorage(key, {
    data,
    expiresAt: ttlMs ? Date.now() + ttlMs : 0,
  })
}

export function clearAppCache() {
  API_CACHE_KEYS.forEach(key => uni.removeStorageSync(key))
}
