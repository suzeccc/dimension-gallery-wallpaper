<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useFavorites } from '../../composables/useFavorites.js'
import { useHistory } from '../../composables/useHistory.js'
import { copyText, downloadImage, openOriginal } from '../../utils/platform.js'

const wallpaper = ref(null)
const error = ref('')
const { favorites, isFavorite, toggleFavorite } = useFavorites()
const { history, addHistory } = useHistory()
const favorited = computed(() => wallpaper.value?.url && isFavorite(wallpaper.value.url))

function restore(id) {
  const current = uni.getStorageSync('moe-wallpaper-current')
  if (current?.url && (!id || current.id === id)) return current
  return [...favorites.value, ...history.value].find(item => item.id === id)
}

function onImageLoad(event) {
  const width = Number(event.detail?.width) || 0
  const height = Number(event.detail?.height) || 0
  if (!wallpaper.value || !width || !height) return
  wallpaper.value = {
    ...wallpaper.value,
    width,
    height,
    orientation: height > width ? 'portrait' : 'landscape',
  }
  addHistory(wallpaper.value)
}

function previewImage() {
  if (!wallpaper.value?.url) return
  uni.previewImage({
    urls: [wallpaper.value.url],
    current: wallpaper.value.url,
  })
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goBack() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  uni.reLaunch({ url: '/pages/index/index' })
}

function toggle() {
  toggleFavorite(wallpaper.value)
}

async function copyUrl() {
  uni.showToast({ title: await copyText(wallpaper.value.url) ? '已复制链接' : '复制失败', icon: 'none' })
}

async function saveImage() {
  const ok = await downloadImage(wallpaper.value.url)
  uni.showToast({ title: ok ? '已保存到相册' : '保存失败，请打开原图后长按保存', icon: 'none' })
}

onLoad(params => {
  const id = params?.id ? decodeURIComponent(params.id) : ''
  wallpaper.value = restore(id)
  if (!wallpaper.value) {
    error.value = '这张壁纸暂时找不到了'
    return
  }
  addHistory(wallpaper.value)
})
</script>

<template>
  <view class="detail-page">
    <view v-if="error" class="state-card">
      <text>{{ error }}</text>
      <button @tap="goBack">返回上级</button>
    </view>

    <template v-else-if="wallpaper">
      <button class="back-button" @tap="goBack">返回</button>
      <image class="preview" :src="wallpaper.url" mode="aspectFit" @tap="previewImage" @load="onImageLoad" />

      <view class="info-panel">
        <text class="title">{{ wallpaper.title }}</text>
        <text class="meta">{{ wallpaper.source }} · {{ wallpaper.category }} · {{ wallpaper.orientation }}</text>
        <text class="meta">{{ wallpaper.width || 0 }} × {{ wallpaper.height || 0 }}</text>
        <view class="actions">
          <button @tap="toggle">{{ favorited ? '取消收藏' : '收藏' }}</button>
          <button @tap="copyUrl">复制链接</button>
          <button @tap="openOriginal(wallpaper.url)">打开原图</button>
          <button @tap="saveImage">保存图片</button>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding: 28rpx 28rpx 70rpx;
  background: #030712;
  color: #f8fbff;
}

.back-button,
.actions button,
.state-card button {
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
  margin-bottom: 22rpx;
  padding: 16rpx 28rpx;
}

.preview {
  width: 100%;
  height: 70vh;
  border-radius: 36rpx;
  background: rgba(15, 23, 42, 0.72);
}

.info-panel,
.state-card {
  display: grid;
  gap: 18rpx;
  margin-top: 24rpx;
  padding: 28rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 36rpx;
  background: rgba(15, 23, 42, 0.72);
}

.title {
  font-size: 36rpx;
  font-weight: 900;
}

.meta {
  color: rgba(213, 226, 242, 0.68);
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}
</style>
