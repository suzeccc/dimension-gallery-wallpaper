<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchAlcyWallpapers, fetchYeqingWallpapers } from '../../api/wallpaperApi.js'
import BottomNav from '../../components/BottomNav.vue'
import WallpaperCard from '../../components/WallpaperCard.vue'

const segmentOptions = [
  { label: '横屏壁纸', value: 'landscape' },
  { label: '竖屏壁纸', value: 'portrait' },
]
const categoryChips = ['推荐', '动漫', '风景', '插画', '治愈', '简约', '更多']
const sourcePresets = {
  推荐: { landscape: ['pc', 'moe', 'fj', 'ys', 'ai'], portrait: ['mp', 'moemp', 'ysmp', 'aimp'] },
  动漫: { landscape: ['pc', 'moe', 'ys'], portrait: ['mp', 'moemp', 'ysmp'] },
  风景: { landscape: ['fj', 'pc'], portrait: ['mp'] },
  插画: { landscape: ['ai', 'moe'], portrait: ['aimp', 'moemp'] },
  治愈: { landscape: ['moe', 'fj'], portrait: ['moemp', 'mp'] },
  简约: { landscape: ['pc'], portrait: ['mp'] },
  更多: { landscape: ['pc', 'moe', 'fj', 'ys', 'ai'], portrait: ['mp', 'moemp', 'ysmp', 'aimp'] },
}

const activeType = ref('landscape')
const activeCategory = ref('推荐')
const searchText = ref('')
const landscapeWallpapers = ref([])
const portraitWallpapers = ref([])
const loading = ref(false)
const error = ref('')
const hasContent = computed(() => landscapeWallpapers.value.length || portraitWallpapers.value.length)
const sections = computed(() => {
  const list = [
    { key: 'landscape', title: '横屏精选', variant: 'landscape', wallpapers: landscapeWallpapers.value },
    { key: 'portrait', title: '竖屏精选', variant: 'portrait', wallpapers: portraitWallpapers.value },
  ]
  return activeType.value === 'portrait' ? list.reverse() : list
})

function dedupe(items) {
  const seen = new Set()
  return items.filter(item => item?.url && !seen.has(item.url) && seen.add(item.url))
}

async function fetchAlcyGroup(categories, orientation) {
  const items = []
  for (const category of categories) {
    try {
      const result = await fetchAlcyWallpapers({ category, count: 4 })
      items.push(...result.map(item => ({ ...item, orientation })))
    } catch {
      // Keep other free API categories usable when one fails.
    }
  }
  return items
}

async function loadGallery() {
  loading.value = true
  error.value = ''
  const preset = sourcePresets[activeCategory.value] || sourcePresets.推荐
  try {
    const landscape = [
      ...(await fetchAlcyGroup(preset.landscape, 'landscape')),
      ...(await fetchYeqingWallpapers({ orientation: 'landscape', count: 8 })),
    ]
    const portrait = [
      ...(await fetchAlcyGroup(preset.portrait, 'portrait')),
      ...(await fetchYeqingWallpapers({ orientation: 'portrait', count: 8 })),
    ]
    landscapeWallpapers.value = dedupe(landscape).slice(0, 16)
    portraitWallpapers.value = dedupe(portrait).slice(0, 14)
    if (!hasContent.value) error.value = '图片跑丢了，换个分类再试试吧'
  } catch {
    error.value = '图片源暂时不可用，请稍后再试'
  } finally {
    loading.value = false
  }
}

function changeCategory(category) {
  activeCategory.value = category
  loadGallery()
}

function updateLoadedMeta({ wallpaper, meta }) {
  const update = item => (item.url === wallpaper.url ? { ...item, ...meta } : item)
  landscapeWallpapers.value = landscapeWallpapers.value.map(update)
  portraitWallpapers.value = portraitWallpapers.value.map(update)
}

function openWallpaper(wallpaper) {
  uni.setStorageSync('moe-wallpaper-current', wallpaper)
  uni.navigateTo({ url: `/pages/detail/detail?id=${encodeURIComponent(wallpaper.id)}` })
}

onLoad(loadGallery)
</script>

<template>
  <view class="home-page">
    <view class="topbar">
      <view>
        <text class="title">次元壁纸</text>
        <text class="subtitle">发现高质量动漫壁纸</text>
      </view>
      <view class="search-panel">
        <input v-model="searchText" placeholder="搜索壁纸、角色、场景" />
        <button @tap="loadGallery">筛选</button>
      </view>
    </view>

    <view class="segmented">
      <button
        v-for="option in segmentOptions"
        :key="option.value"
        :class="{ active: option.value === activeType }"
        @tap="activeType = option.value"
      >
        {{ option.label }}
      </button>
    </view>

    <scroll-view scroll-x class="chips">
      <button
        v-for="category in categoryChips"
        :key="category"
        :class="{ active: category === activeCategory }"
        @tap="changeCategory(category)"
      >
        {{ category }}
      </button>
    </scroll-view>

    <view v-if="error" class="state-card">
      <text>{{ error }}</text>
      <button @tap="loadGallery">重试</button>
    </view>

    <view v-if="loading && !hasContent" class="loading-grid">
      <view />
      <view />
      <view />
    </view>

    <template v-else>
      <view v-for="section in sections" v-show="section.wallpapers.length" :key="section.key" class="wallpaper-section">
        <view class="section-head">
          <text>{{ section.title }}</text>
          <button>查看更多 &gt;</button>
        </view>
        <scroll-view scroll-x class="wallpaper-strip">
          <WallpaperCard
            v-for="wallpaper in section.wallpapers"
            :key="wallpaper.id"
            :wallpaper="wallpaper"
            :variant="section.variant"
            @loaded="updateLoadedMeta"
            @open="openWallpaper"
          />
        </scroll-view>
      </view>

      <view v-if="!loading && !error && !hasContent" class="state-card">
        <text>暂时没有壁纸，换个分类再试试吧。</text>
      </view>
    </template>

    <BottomNav active="home" />
  </view>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 28rpx 28rpx 170rpx;
  background:
    radial-gradient(circle at 26% 16%, rgba(105, 139, 255, 0.22), transparent 36%),
    radial-gradient(circle at 88% 9%, rgba(148, 163, 184, 0.13), transparent 34%),
    linear-gradient(140deg, rgba(10, 18, 32, 0.94), rgba(3, 7, 18, 0.98));
  color: #f8fbff;
}

.topbar,
.wallpaper-section,
.state-card {
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 44rpx;
  background: rgba(15, 23, 42, 0.62);
  box-shadow: 0 24rpx 80rpx rgba(2, 8, 23, 0.34);
  backdrop-filter: blur(22px);
}

.topbar {
  display: grid;
  gap: 24rpx;
  padding: 28rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 900;
  color: #dcecff;
}

.subtitle {
  display: block;
  margin-top: 10rpx;
  color: rgba(213, 226, 242, 0.68);
  font-size: 28rpx;
}

.search-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14rpx;
  padding: 12rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 999px;
  background: rgba(17, 26, 44, 0.78);
}

.search-panel input {
  min-width: 0;
  height: 68rpx;
  padding: 0 20rpx;
  color: #f8fbff;
}

.search-panel button,
.segmented button,
.chips button,
.section-head button,
.state-card button {
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(121, 169, 255, 0.26);
  color: #f8fbff;
  font-size: 26rpx;
}

button::after {
  border: 0;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10rpx;
  margin-top: 28rpx;
  padding: 10rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 999px;
  background: rgba(17, 26, 44, 0.78);
}

.segmented button {
  background: transparent;
  color: rgba(213, 226, 242, 0.68);
}

.segmented button.active {
  color: #f8fbff;
  background: rgba(121, 169, 255, 0.26);
  box-shadow: inset 0 0 0 1px rgba(191, 219, 254, 0.34);
}

.chips {
  margin: 24rpx 0;
  white-space: nowrap;
}

.chips button {
  display: inline-block;
  margin-right: 16rpx;
  padding: 16rpx 26rpx;
  background: rgba(15, 23, 42, 0.62);
  color: rgba(213, 226, 242, 0.68);
}

.chips button.active {
  color: #f8fbff;
  background: rgba(121, 169, 255, 0.26);
}

.wallpaper-section {
  margin-top: 26rpx;
  padding: 24rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.section-head text {
  font-size: 34rpx;
  font-weight: 900;
}

.section-head button {
  background: transparent;
  color: #a7c7ff;
  font-weight: 800;
}

.wallpaper-strip {
  white-space: nowrap;
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

.state-card {
  display: grid;
  gap: 18rpx;
  margin-top: 28rpx;
  padding: 32rpx;
  color: rgba(213, 226, 242, 0.76);
}
</style>
