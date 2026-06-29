export function readStorage(key, fallback) {
  try {
    const value = uni.getStorageSync(key)
    return value === '' || value == null ? fallback : value
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch {
    // Storage can fail in private or low-space modes; keep the page usable.
  }
}
