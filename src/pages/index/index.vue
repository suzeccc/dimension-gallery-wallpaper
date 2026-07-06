<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchAiR18Wallpapers, fetchAlcyWallpapers, fetchBlackWallpapers, fetchElainaMobileWallpapers, fetchElainaPcWallpapers, fetchMoehuGameWallpapers, fetchMoehuPcWallpapers, fetchMoehuWallpapers, fetchR18Wallpapers, fetchWhiteWallpapers, fetchYeqingWallpapers } from '../../api/wallpaperApi.js'
import BottomNav from '../../components/BottomNav.vue'
import WallpaperCard from '../../components/WallpaperCard.vue'

const categoryChips = ['推荐', '动漫', '风景', '治愈', '简约', '游戏', 'AI', '美女', '黑色', '白色', 'R18', 'AI R18']
const sourcePresets = {
  推荐: { landscape: ['pc', 'moe', 'ys'], portrait: ['ysmp'] },
  动漫: { landscape: ['pc', 'moe', 'ys'], portrait: ['ysmp'] },
  风景: { landscape: ['fj', 'pc'], portrait: [] },
  治愈: { landscape: ['moe', 'fj'], portrait: [] },
  简约: { landscape: ['pc'], portrait: [] },
  游戏: { landscape: [], portrait: [] },
  AI: { landscape: ['ai'], portrait: ['aimp'] },
  美女: { landscape: [], portrait: [] },
  黑色: { landscape: [], portrait: [] },
  白色: { landscape: [], portrait: [] },
  R18: { landscape: [], portrait: [] },
  'AI R18': { landscape: [], portrait: [] },
  更多: { landscape: ['pc', 'moe', 'fj', 'ys'], portrait: ['ysmp'] },
}
const HOME_SECTION_LIMIT = 4
const elainaLandscapeCategories = new Set(['推荐', '动漫', '风景', '治愈', '简约', '更多'])
const elainaPortraitCategories = new Set(['推荐', '动漫', '治愈', '简约', '更多'])
const moehuPcCategories = new Set(['动漫'])

const logoSrc = '/static/home/brand-wordmark.png'
const bannerImages = [
  '/static/home/banner-wide-1-clean.png',
  '/static/home/banner-wide-2-clean.png',
  '/static/home/banner-wide-3-clean.png',
  '/static/home/banner-wide-4-clean.png',
  '/static/home/banner-wide-5-clean.png',
]
const activeCategory = ref('推荐')
const isSceneryCategory = computed(() => activeCategory.value === '风景')
const landscapeWallpapers = ref([])
const portraitWallpapers = ref([])
const loading = ref(false)
const refreshing = ref({ landscape: false, portrait: false })
const error = ref('')
const hasContent = computed(() => landscapeWallpapers.value.length || portraitWallpapers.value.length)
const sections = computed(() => {
  return [
    { key: 'landscape', title: '横屏精选', variant: 'landscape', wallpapers: landscapeWallpapers.value },
    { key: 'portrait', title: '竖屏精选', variant: 'portrait', wallpapers: portraitWallpapers.value },
  ]
})

function dedupe(items) {
  const seen = new Set()
  return items.filter(item => item?.url && !seen.has(item.url) && seen.add(item.url))
}

async function fetchAlcyGroup(categories, orientation) {
  if (!categories.length) return []
  const perCategory = Math.max(1, Math.ceil(HOME_SECTION_LIMIT / categories.length))
  const groups = await Promise.all(categories.map(async category => {
    try {
      const result = await fetchAlcyWallpapers({ category, count: perCategory })
      return result.map(item => ({ ...item, orientation }))
    } catch {
      // Keep other free API categories usable when one fails.
      return []
    }
  }))
  return groups.flat()
}

function fetchMoehuPcGroup(category, count) {
  return moehuPcCategories.has(category) ? fetchMoehuPcWallpapers({ category, count }) : []
}

function fetchElainaPcGroup(category, count) {
  return elainaLandscapeCategories.has(category) ? fetchElainaPcWallpapers({ count }) : []
}

function fetchElainaMobileGroup(category, count) {
  return elainaPortraitCategories.has(category) ? fetchElainaMobileWallpapers({ count }) : []
}

function fetchYeqingGroup(preset, orientation, count) {
  return preset[orientation]?.length ? fetchYeqingWallpapers({ orientation, count }) : []
}

async function loadGallery() {
  loading.value = true
  error.value = ''
  const preset = sourcePresets[activeCategory.value] || sourcePresets.推荐
  try {
    if (activeCategory.value === '美女') {
      landscapeWallpapers.value = fetchMoehuWallpapers({ orientation: 'landscape', count: HOME_SECTION_LIMIT })
      portraitWallpapers.value = fetchMoehuWallpapers({ orientation: 'portrait', count: HOME_SECTION_LIMIT })
      if (!hasContent.value) error.value = '图片跑丢了，换个分类再试试吧'
      return
    }

    if (activeCategory.value === '黑色') {
      landscapeWallpapers.value = fetchBlackWallpapers({ orientation: 'landscape', count: HOME_SECTION_LIMIT })
      portraitWallpapers.value = fetchBlackWallpapers({ orientation: 'portrait', count: HOME_SECTION_LIMIT })
      if (!hasContent.value) error.value = '图片跑丢了，换个分类再试试吧'
      return
    }

    if (activeCategory.value === '白色') {
      landscapeWallpapers.value = fetchWhiteWallpapers({ orientation: 'landscape', count: HOME_SECTION_LIMIT })
      portraitWallpapers.value = fetchWhiteWallpapers({ orientation: 'portrait', count: HOME_SECTION_LIMIT })
      if (!hasContent.value) error.value = '图片跑丢了，换个分类再试试吧'
      return
    }

    if (activeCategory.value === 'R18') {
      landscapeWallpapers.value = fetchR18Wallpapers({ orientation: 'landscape', count: HOME_SECTION_LIMIT })
      portraitWallpapers.value = fetchR18Wallpapers({ orientation: 'portrait', count: HOME_SECTION_LIMIT })
      if (!hasContent.value) error.value = '图片跑丢了，换个分类再试试吧'
      return
    }

    if (activeCategory.value === '游戏') {
      landscapeWallpapers.value = fetchMoehuGameWallpapers({ count: HOME_SECTION_LIMIT })
      portraitWallpapers.value = []
      if (!hasContent.value) error.value = '图片跑丢了，换个分类再试试吧'
      return
    }

    if (activeCategory.value === 'AI R18') {
      landscapeWallpapers.value = fetchAiR18Wallpapers({ orientation: 'landscape', count: HOME_SECTION_LIMIT })
      portraitWallpapers.value = fetchAiR18Wallpapers({ orientation: 'portrait', count: HOME_SECTION_LIMIT })
      if (!hasContent.value) error.value = '图片跑丢了，换个分类再试试吧'
      return
    }

    const [landscapeAlcy, landscapeYeqing, portraitAlcy, portraitYeqing] = await Promise.all([
      fetchAlcyGroup(preset.landscape, 'landscape'),
      fetchYeqingGroup(preset, 'landscape', HOME_SECTION_LIMIT),
      fetchAlcyGroup(preset.portrait, 'portrait'),
      fetchYeqingGroup(preset, 'portrait', HOME_SECTION_LIMIT),
    ])
    const landscape = [
      ...fetchElainaPcGroup(activeCategory.value, 2),
      ...fetchMoehuPcGroup(activeCategory.value, 2),
      ...landscapeAlcy,
      ...landscapeYeqing,
    ]
    const portrait = [
      ...fetchElainaMobileGroup(activeCategory.value, 2),
      ...portraitAlcy,
      ...portraitYeqing,
    ]
    landscapeWallpapers.value = dedupe(landscape).slice(0, HOME_SECTION_LIMIT)
    portraitWallpapers.value = dedupe(portrait).slice(0, HOME_SECTION_LIMIT)
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

async function refreshSection(variant) {
  if (refreshing.value[variant]) return
  refreshing.value = { ...refreshing.value, [variant]: true }
  const preset = sourcePresets[activeCategory.value] || sourcePresets.推荐
  try {
    if (activeCategory.value === '美女') {
      const next = fetchMoehuWallpapers({ orientation: variant, count: HOME_SECTION_LIMIT })
      if (variant === 'portrait') portraitWallpapers.value = next
      else landscapeWallpapers.value = next
      return
    }

    if (activeCategory.value === '黑色') {
      const next = fetchBlackWallpapers({ orientation: variant, count: HOME_SECTION_LIMIT })
      if (variant === 'portrait') portraitWallpapers.value = next
      else landscapeWallpapers.value = next
      return
    }

    if (activeCategory.value === '白色') {
      const next = fetchWhiteWallpapers({ orientation: variant, count: HOME_SECTION_LIMIT })
      if (variant === 'portrait') portraitWallpapers.value = next
      else landscapeWallpapers.value = next
      return
    }

    if (activeCategory.value === 'R18') {
      const next = fetchR18Wallpapers({ orientation: variant, count: HOME_SECTION_LIMIT })
      if (variant === 'portrait') portraitWallpapers.value = next
      else landscapeWallpapers.value = next
      return
    }

    if (activeCategory.value === '游戏') {
      if (variant === 'portrait') {
        portraitWallpapers.value = []
        return
      }
      landscapeWallpapers.value = fetchMoehuGameWallpapers({ count: HOME_SECTION_LIMIT })
      return
    }

    if (activeCategory.value === 'AI R18') {
      const next = fetchAiR18Wallpapers({ orientation: variant, count: HOME_SECTION_LIMIT })
      if (variant === 'portrait') portraitWallpapers.value = next
      else landscapeWallpapers.value = next
      return
    }

    const next = [
      ...(variant === 'landscape' ? fetchElainaPcGroup(activeCategory.value, 2) : []),
      ...(variant === 'landscape' ? fetchMoehuPcGroup(activeCategory.value, 2) : []),
      ...(variant === 'portrait' ? fetchElainaMobileGroup(activeCategory.value, 2) : []),
      ...(await fetchAlcyGroup(preset[variant], variant)),
      ...(await fetchYeqingGroup(preset, variant, HOME_SECTION_LIMIT)),
    ]
    if (variant === 'portrait') portraitWallpapers.value = dedupe(next).slice(0, HOME_SECTION_LIMIT)
    else landscapeWallpapers.value = dedupe(next).slice(0, HOME_SECTION_LIMIT)
  } catch {
    uni.showToast({ title: '刷新失败，请稍后再试', icon: 'none' })
  } finally {
    refreshing.value = { ...refreshing.value, [variant]: false }
  }
}

function openMorePage(variant) {
  uni.navigateTo({
    url: `/pages/wallpapers/wallpapers?orientation=${variant}&category=${encodeURIComponent(activeCategory.value)}`,
  })
}

function openWallpaper(wallpaper) {
  uni.setStorageSync('moe-wallpaper-current', wallpaper)
  uni.navigateTo({ url: `/pages/detail/detail?id=${encodeURIComponent(wallpaper.id)}` })
}

onLoad(loadGallery)
</script>

<template>
  <view class="home-page">
    <view class="brand-panel">
      <image class="brand-logo" :src="logoSrc" mode="aspectFit" />
    </view>

    <swiper class="hero-swiper" autoplay circular indicator-dots interval="3500" duration="500">
      <swiper-item v-for="image in bannerImages" :key="image">
        <image class="hero-banner" :src="image" mode="aspectFill" />
      </swiper-item>
    </swiper>

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
          <text class="section-title">{{ section.title }}</text>
          <view class="section-actions">
            <button
              class="section-refresh"
              :disabled="refreshing[section.variant]"
              @tap="refreshSection(section.variant)"
            >
              ↻
            </button>
            <button
              class="section-more"
              @tap="openMorePage(section.variant)"
            >
              <text>查看更多</text>
              <text class="section-more-arrow">&gt;</text>
            </button>
          </view>
        </view>
        <view
          v-if="isSceneryCategory && section.variant === 'landscape'"
          class="scenery-wallpaper-stack"
        >
          <WallpaperCard
            v-for="wallpaper in section.wallpapers"
                :key="wallpaper.id"
                :wallpaper="wallpaper"
                :variant="section.variant"
                padded-preview
                @open="openWallpaper"
              />
        </view>
        <scroll-view v-else scroll-x class="wallpaper-strip">
          <WallpaperCard
            v-for="wallpaper in section.wallpapers"
                :key="wallpaper.id"
                :wallpaper="wallpaper"
                :variant="section.variant"
                padded-preview
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

.hero-swiper,
.wallpaper-section,
.state-card {
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 44rpx;
  background: rgba(15, 23, 42, 0.62);
  box-shadow: 0 24rpx 80rpx rgba(2, 8, 23, 0.34);
  backdrop-filter: blur(22px);
}

.brand-panel {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  height: 86rpx;
  margin-bottom: 12rpx;
  padding: 0;
}

.brand-logo {
  display: block;
  width: 236rpx;
  height: 78rpx;
  filter: drop-shadow(0 0 18rpx rgba(139, 92, 246, 0.32));
}

.hero-swiper {
  width: 100%;
  aspect-ratio: 3 / 1;
  height: calc((100vw - 56rpx) / 3);
  min-height: 220rpx;
  margin: 0;
  overflow: hidden;
}

.hero-banner {
  display: block;
  width: 100%;
  height: 100%;
}

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
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.section-title {
  flex: 1;
  min-width: 0;
  font-size: 34rpx;
  font-weight: 900;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-refresh,
.section-more {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  border: 1px solid rgba(147, 197, 253, 0.24);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.72), rgba(59, 130, 246, 0.2));
  color: #bfdbfe;
  font-size: 26rpx;
  font-weight: 900;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 12rpx 28rpx rgba(2, 8, 23, 0.26);
}

.section-refresh {
  width: 56rpx;
  padding: 0;
}

.section-more {
  gap: 6rpx;
  min-width: 164rpx;
  padding: 0 22rpx;
}

.section-refresh[disabled],
.section-more[disabled] {
  opacity: 0.64;
}

.section-more-arrow {
  font-size: 28rpx;
}

.wallpaper-strip {
  white-space: nowrap;
}

.scenery-wallpaper-stack {
  display: grid;
  gap: 22rpx;
}

.scenery-wallpaper-stack :deep(.wallpaper-card) {
  display: block;
  width: 100%;
  max-width: none;
  margin-right: 0;
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
