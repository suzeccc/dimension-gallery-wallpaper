import { getCache, setCache } from '../utils/cache.js'
import { shuffle } from '../utils/shuffle.js'

const ALCY_BASE = 'https://t.alcy.cc'
const YEQING_BASE = 'https://api.yppp.net'
const ELAINA_MOBILE_URL = 'https://api.elaina.cat/random/mobile'
const ELAINA_PC_URL = 'https://api.elaina.cat/random/pc'
const MOEHU_PC_URL = 'https://img.moehu.org/pic.php?id=pc'
const MOEHU_BEAUTY_URL = 'https://img.moehu.org/pic.php?id=xjj'
const MOEHU_BLACK_URL = 'https://img.moehu.org/pic.php?id=acghs'
const MOEHU_WHITE_URL = 'https://img.moehu.org/pic.php?id=acgbs'
const MOEHU_GAME_URLS = [
  'https://img.moehu.org/pic.php?id=ys',
  'https://img.moehu.org/pic.php?id=mrfz',
]
const YAOHUD_R18_URL = 'https://acg.yaohud.cn/R18/setu.php'
const YAOHUD_AI_R18_URL = 'https://acg.yaohud.cn/dm/r18.php'
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

export function fetchElainaMobileWallpapers({ count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${ELAINA_MOBILE_URL}?i=${now}-${index}`),
      source: 'elaina',
      category: '竖屏',
      title: 'Elaina 竖屏壁纸',
      orientation: 'portrait',
    })
  }).filter(Boolean)
}

export function fetchElainaPcWallpapers({ count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${ELAINA_PC_URL}?i=${now}-${index}`),
      source: 'elaina',
      category: '横屏',
      title: 'Elaina 横屏壁纸',
      orientation: 'landscape',
    })
  }).filter(Boolean)
}

export function fetchMoehuWallpapers({ orientation = 'portrait', count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${MOEHU_BEAUTY_URL}&i=${now}-${index}`),
      source: 'moehu',
      category: '美女',
      title: '美女壁纸',
      orientation,
    })
  }).filter(Boolean)
}

export function fetchMoehuPcWallpapers({ category = '推荐', count = 4 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${MOEHU_PC_URL}&i=${now}-${index}`),
      source: 'moehu',
      category,
      title: 'Moehu 横屏壁纸',
      orientation: 'landscape',
    })
  }).filter(Boolean)
}

export function fetchMoehuGameWallpapers({ count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    const endpoint = MOEHU_GAME_URLS[index % MOEHU_GAME_URLS.length]
    return normalizeWallpaper({
      url: cacheBust(`${endpoint}&i=${now}-${index}`),
      source: 'moehu',
      category: '游戏',
      title: '游戏横屏壁纸',
      orientation: 'landscape',
    })
  }).filter(Boolean)
}

export function fetchBlackWallpapers({ orientation = 'portrait', count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${MOEHU_BLACK_URL}&i=${now}-${index}`),
      source: 'moehu',
      category: '黑色',
      title: '黑色壁纸',
      orientation,
    })
  }).filter(Boolean)
}

export function fetchWhiteWallpapers({ orientation = 'portrait', count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${MOEHU_WHITE_URL}&i=${now}-${index}`),
      source: 'moehu',
      category: '白色',
      title: '白色壁纸',
      orientation,
    })
  }).filter(Boolean)
}

export function fetchR18Wallpapers({ orientation = 'portrait', count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${YAOHUD_R18_URL}?i=${now}-${index}`),
      source: 'yaohud',
      category: 'R18',
      title: 'R18 壁纸',
      orientation,
    })
  }).filter(Boolean)
}

export function fetchAiR18Wallpapers({ orientation = 'portrait', count = 12 } = {}) {
  const now = Date.now()
  return Array.from({ length: clampCount(count, 30) }, (_, index) => {
    return normalizeWallpaper({
      url: cacheBust(`${YAOHUD_AI_R18_URL}?i=${now}-${index}`),
      source: 'yaohud',
      category: 'AI R18',
      title: 'AI R18 壁纸',
      orientation,
    })
  }).filter(Boolean)
}
