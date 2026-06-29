import { getCache, setCache } from '../utils/cache.js'
import { shuffle } from '../utils/shuffle.js'

const ALCY_BASE = 'https://t.alcy.cc'
const YEQING_BASE = 'https://api.yppp.net'
const YE_QING_CACHE_TTL = 1000 * 60 * 60 * 6

const categoryOrientation = {
  pc: 'landscape',
  ai: 'landscape',
  moe: 'landscape',
  fj: 'landscape',
  ys: 'landscape',
  mp: 'portrait',
  aimp: 'portrait',
  moemp: 'portrait',
  ysmp: 'portrait',
  pe: 'portrait',
}

function request(url, responseType = 'json') {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'GET',
      timeout: 10000,
      responseType: responseType === 'text' ? 'text' : undefined,
      success: response => {
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(response.data)
        else reject(new Error(`请求失败：${response.statusCode}`))
      },
      fail: reject,
    })
  })
}

function clampCount(count, max) {
  const value = Number.parseInt(count, 10)
  return Math.min(Math.max(Number.isFinite(value) ? value : 12, 1), max)
}

function cacheBust(url) {
  return `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`
}

function inferExt(url) {
  const file = String(url).split(/[?#]/)[0]
  const ext = file.includes('.') ? file.split('.').pop().toLowerCase() : ''
  return ext && ext.length <= 5 && !ext.includes('/') ? ext : ''
}

function orientationOf(value) {
  if (value.orientation) return value.orientation
  if (categoryOrientation[value.category]) return categoryOrientation[value.category]
  if (value.height > value.width) return 'portrait'
  return 'landscape'
}

export function normalizeWallpaper(input) {
  const value = typeof input === 'string' ? { url: input } : input || {}
  const url = String(value.url || value.link || value.acgurl || '').trim()
  if (!url) return null

  const source = value.source || 'unknown'
  const category = value.category || ''
  const width = Number.parseInt(value.width, 10) || 0
  const height = Number.parseInt(value.height, 10) || 0
  const orientation = orientationOf({ ...value, width, height, category })

  return {
    id: `${source}-${category || orientation}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url,
    source,
    category,
    title: value.title || `${source === 'alcy' ? '栗次元' : '夜轻'} ${category || '壁纸'}`,
    orientation,
    width,
    height,
    ext: String(value.ext || value.size || inferExt(url)).replace(/^\./, '').toLowerCase(),
    createdAt: Date.now(),
  }
}

export async function fetchAlcyWallpapers({ category = 'pc', count = 12 } = {}) {
  const safeCount = clampCount(count, 30)
  const payload = await request(`${ALCY_BASE}/json?${encodeURIComponent(category)}=${safeCount}`)
  const data = Array.isArray(payload?.data) ? payload.data : payload?.data ? [payload.data] : []
  return data
    .map(item => normalizeWallpaper({ ...(typeof item === 'string' ? { url: item } : item), source: 'alcy', category }))
    .filter(Boolean)
}

export async function fetchYeqingWallpapers({ orientation = 'landscape', count = 12 } = {}) {
  const isPortrait = orientation === 'portrait'
  const endpoint = isPortrait ? `${YEQING_BASE}/pe.php` : `${YEQING_BASE}/pc.php`
  const category = isPortrait ? 'pe' : 'pc'
  const cacheKey = isPortrait ? 'moe-wallpaper-yeqing-pe-list' : 'moe-wallpaper-yeqing-pc-list'
  let urls = getCache(cacheKey)

  if (!urls) {
    const text = await request(cacheBust(`${endpoint}?return=all`), 'text')
    urls = [...new Set(String(text).split(/\s+/).map(url => url.trim()).filter(url => /^https?:\/\//.test(url)))]
    setCache(cacheKey, urls, YE_QING_CACHE_TTL)
  }

  return shuffle(urls)
    .slice(0, clampCount(count, 30))
    .map(url => normalizeWallpaper({ url, source: 'yeqing', category, orientation }))
    .filter(Boolean)
}
