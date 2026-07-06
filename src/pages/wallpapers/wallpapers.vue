<script setup>
import { computed, ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { fetchAiR18Wallpapers, fetchAlcyWallpapers, fetchBlackWallpapers, fetchMoehuGameWallpapers, fetchMoehuPcWallpapers, fetchMoehuWallpapers, fetchR18Wallpapers, fetchWhiteWallpapers, fetchYeqingWallpapers } from '../../api/wallpaperApi.js'
import WallpaperCard from '../../components/WallpaperCard.vue'

const defaultCategory = '推荐'
const sourcePresets = {
  推荐: { landscape: ['pc', 'moe', 'ys'], portrait: ['mp', 'moemp', 'ysmp'] },
  动漫: { landscape: ['pc', 'moe', 'ys'], portrait: ['mp', 'moemp', 'ysmp'] },
  风景: { landscape: ['fj', 'pc'], portrait: [] },
  治愈: { landscape: ['moe', 'fj'], portrait: ['moemp', 'mp'] },
  简约: { landscape: ['pc'], portrait: ['mp'] },
  游戏: { landscape: [], portrait: [] },
  AI: { landscape: ['ai'], portrait: ['aimp'] },
  美女: { landscape: [], portrait: [] },
  黑色: { landscape: [], portrait: [] },
  白色: { landscape: [], portrait: [] },
  R18: { landscape: [], portrait: [] },
  'AI R18': { landscape: [], portrait: [] },
  更多: { landscape: ['pc', 'moe', 'fj', 'ys'], portrait: ['mp', 'moemp', 'ysmp'] },
}
const WALLPAPER_BATCH_SIZE = 8
const moehuPcCategories = new Set(['动漫'])

const orientation = ref('landscape')
const activeCategory = ref(defaultCategory)
const wallpapers = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const isSceneryFill = computed(() => orientation.value === 'landscape' && activeCategory.value === '风景')

function dedupe(items) {
  const seen = new Set()
  return items.filter(item => item?.url && !seen.has(item.url) && seen.add(item.url))
}

async function fetchAlcyGroup(categories) {
  if (!categories.length) return []
  const perCategory = Math.max(1, Math.ceil(WALLPAPER_BATCH_SIZE / categories.length))
  const groups = await Promise.all(categories.map(async category => {
    try {
      const result = await fetchAlcyWallpapers({ category, count: perCategory })
      return result.map(item => ({ ...item, orientation: orientation.value }))
    } catch {
      // Keep the page useful when one free source fails.
      return []
    }
  }))
  return groups.flat()
}

function fetchMoehuPcGroup(category, orientation, count) {
  return orientation === 'landscape' && moehuPcCategories.has(category) ? fetchMoehuPcWallpapers({ category, count }) : []
}

function fetchYeqingGroup(preset, orientation, count) {
  return preset[orientation]?.length ? fetchYeqingWallpapers({ orientation, count }) : []
}

async function loadWallpapers(append = false) {
  if (loading.value || loadingMore.value) return
  const flag = append ? loadingMore : loading
  flag.value = true
  error.value = ''

  const preset = sourcePresets[activeCategory.value] || sourcePresets[defaultCategory]
  try {
    if (activeCategory.value === '美女') {
      const next = fetchMoehuWallpapers({ orientation: orientation.value, count: 8 })
      wallpapers.value = append ? dedupe([...wallpapers.value, ...next]) : dedupe(next)
      if (!wallpapers.value.length) error.value = '暂时没有壁纸，稍后再试试吧'
      return
    }

    if (activeCategory.value === '黑色') {
      const next = fetchBlackWallpapers({ orientation: orientation.value, count: 8 })
      wallpapers.value = append ? dedupe([...wallpapers.value, ...next]) : dedupe(next)
      if (!wallpapers.value.length) error.value = '暂时没有壁纸，稍后再试试吧'
      return
    }

    if (activeCategory.value === '白色') {
      const next = fetchWhiteWallpapers({ orientation: orientation.value, count: 8 })
      wallpapers.value = append ? dedupe([...wallpapers.value, ...next]) : dedupe(next)
      if (!wallpapers.value.length) error.value = '暂时没有壁纸，稍后再试试吧'
      return
    }

    if (activeCategory.value === 'R18') {
      const next = fetchR18Wallpapers({ orientation: orientation.value, count: 8 })
      wallpapers.value = append ? dedupe([...wallpapers.value, ...next]) : dedupe(next)
      if (!wallpapers.value.length) error.value = '暂时没有壁纸，稍后再试试吧'
      return
    }

    if (activeCategory.value === '游戏') {
      const next = orientation.value === 'landscape'
        ? fetchMoehuGameWallpapers({ count: WALLPAPER_BATCH_SIZE })
        : []
      wallpapers.value = append ? dedupe([...wallpapers.value, ...next]) : dedupe(next)
      if (!wallpapers.value.length) error.value = '暂时没有壁纸，稍后再试试吧'
      return
    }

    if (activeCategory.value === 'AI R18') {
      const next = fetchAiR18Wallpapers({ orientation: orientation.value, count: 8 })
      wallpapers.value = append ? dedupe([...wallpapers.value, ...next]) : dedupe(next)
      if (!wallpapers.value.length) error.value = '暂时没有壁纸，稍后再试试吧'
      return
    }

    const next = [
      ...fetchMoehuPcGroup(activeCategory.value, orientation.value, 2),
      ...(await fetchAlcyGroup(preset[orientation.value] || preset.landscape)),
      ...(await fetchYeqingGroup(preset, orientation.value, WALLPAPER_BATCH_SIZE)),
    ]
    const batch = dedupe(next).slice(0, WALLPAPER_BATCH_SIZE)
    wallpapers.value = append ? dedupe([...wallpapers.value, ...batch]) : batch
    if (!wallpapers.value.length) error.value = '暂时没有壁纸，稍后再试试吧'
  } catch {
    if (append) uni.showToast({ title: '加载失败，请稍后再试', icon: 'none' })
    else error.value = '图片源暂时不可用，请稍后再试'
  } finally {
    flag.value = false
  }
}

function openWallpaper(wallpaper) {
  uni.setStorageSync('moe-wallpaper-current', wallpaper)
  uni.navigateTo({ url: `/pages/detail/detail?id=${encodeURIComponent(wallpaper.id)}` })
}

function goBack() {
  uni.navigateBack()
}

onLoad(params => {
  orientation.value = params?.orientation === 'portrait' ? 'portrait' : 'landscape'
  const category = decodeURIComponent(params?.category || defaultCategory)
  activeCategory.value = sourcePresets[category] ? category : defaultCategory
  loadWallpapers()
})

onReachBottom(() => loadWallpapers(true))
</script>

<template>
  <view class="wallpapers-page" :class="{ 'scenery-fill-page': isSceneryFill }">
    <view class="page-head">
      <button class="back-button" @tap="goBack">
        <text class="back-icon">&lt;</text>
        <text class="back-label">返回</text>
      </button>
      <view>
        <text class="title">{{ orientation === 'portrait' ? '竖屏壁纸' : '横屏壁纸' }}</text>
        <text class="subtitle">{{ activeCategory }}</text>
      </view>
    </view>

    <view v-if="error" class="state-card">
      <text>{{ error }}</text>
      <button @tap="loadWallpapers()">重试</button>
    </view>

    <view v-else-if="loading" class="loading-grid">
      <view />
      <view />
      <view />
    </view>

    <view v-else class="wallpaper-list" :class="`${orientation}-list`">
      <WallpaperCard
        v-for="wallpaper in wallpapers"
        :key="wallpaper.id"
        :wallpaper="wallpaper"
        :variant="orientation"
        @open="openWallpaper"
      />
    </view>

    <view v-if="loadingMore" class="loading-more">加载中...</view>
  </view>
</template>

<style scoped>
.wallpapers-page {
  min-height: 100vh;
  padding: 28rpx 28rpx 60rpx;
  background:
    radial-gradient(circle at 26% 16%, rgba(105, 139, 255, 0.18), transparent 36%),
    linear-gradient(140deg, rgba(10, 18, 32, 0.96), rgba(3, 7, 18, 0.99));
  color: #f8fbff;
}

.scenery-fill-page {
  padding-right: 0;
  padding-left: 0;
}

.page-head {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.scenery-fill-page .page-head {
  padding-right: 28rpx;
  padding-left: 28rpx;
}

.state-card button {
  flex: 0 0 auto;
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(121, 169, 255, 0.26);
  color: #f8fbff;
}

button::after {
  border: 0;
}

.back-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  min-width: 108rpx;
  height: 64rpx;
  margin: 0;
  padding: 0 22rpx 0 18rpx;
  border: 1px solid rgba(191, 219, 254, 0.22);
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: #e5eefc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 12rpx 30rpx rgba(2, 8, 23, 0.24);
}

.back-icon {
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1;
}

.back-label {
  font-size: 25rpx;
  font-weight: 800;
  line-height: 1;
}

.title {
  display: block;
  font-size: 42rpx;
  font-weight: 900;
}

.subtitle {
  display: block;
  margin-top: 6rpx;
  color: rgba(213, 226, 242, 0.68);
  font-size: 26rpx;
}

.wallpaper-list {
  display: grid;
  justify-items: center;
  gap: 28rpx;
}

.wallpaper-list :deep(.wallpaper-card) {
  width: 100%;
  min-width: 0;
  max-width: none;
  margin-right: 0;
}

.landscape-list {
  grid-template-columns: 1fr;
}

.scenery-fill-page .landscape-list :deep(.wallpaper-card) {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.portrait-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.state-card {
  display: grid;
  gap: 18rpx;
  padding: 32rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 36rpx;
  background: rgba(15, 23, 42, 0.62);
  color: rgba(213, 226, 242, 0.76);
}

.loading-grid {
  display: grid;
  gap: 20rpx;
}

.loading-grid view {
  height: 260rpx;
  border-radius: 32rpx;
  background: linear-gradient(110deg, rgba(30, 41, 59, 0.8), rgba(59, 130, 246, 0.18), rgba(30, 41, 59, 0.8));
}

.loading-more {
  padding: 30rpx 0 10rpx;
  color: rgba(213, 226, 242, 0.68);
  text-align: center;
  font-size: 26rpx;
}

</style>
