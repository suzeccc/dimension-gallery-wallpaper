<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  wallpaper: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: 'landscape',
  },
  removable: {
    type: Boolean,
    default: false,
  },
  paddedPreview: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open', 'remove'])

const imageLoaded = ref(false)
const previewing = ref(false)
const imageExts = new Set(['avif', 'bmp', 'gif', 'jpg', 'jpeg', 'png', 'webp'])

watch(() => props.wallpaper.url, () => {
  imageLoaded.value = false
  previewing.value = false
})

function finishLoading() {
  imageLoaded.value = true
}

function hasImageExt(value) {
  return imageExts.has(String(value || '').replace(/^\./, '').toLowerCase())
}

function urlHasImageExt(url) {
  return hasImageExt(String(url || '').split(/[?#]/)[0].split('.').pop())
}

function refreshesOnTap(wallpaper) {
  // ponytail: extensionless/non-image API endpoints are the refresh-on-tap cases; add explicit metadata if stable extensionless URLs appear.
  return !hasImageExt(wallpaper?.ext) && !urlHasImageExt(wallpaper?.url)
}

function previewImage() {
  if (!props.wallpaper?.url) return
  uni.previewImage({
    urls: [props.wallpaper.url],
    current: props.wallpaper.url,
  })
}

function openCard() {
  if (props.paddedPreview) {
    if (imageLoaded.value) {
      previewing.value = true
    }
    return
  }
  if (refreshesOnTap(props.wallpaper)) {
    if (imageLoaded.value) {
      previewing.value = true
    }
    return
  }
  previewImage()
}
</script>

<template>
  <view class="wallpaper-card" :class="[`${variant}-card`, { 'previewing-card': previewing }]">
    <button class="media-button" :class="{ previewing }" @tap="openCard">
      <view v-if="!imageLoaded" class="image-loader">
        <view class="scan-photo">
          <view class="scan-spin"></view>
          <view class="scan-mask"></view>
        </view>
      </view>
      <image
        class="image"
        :class="{ loaded: imageLoaded }"
        :src="wallpaper.url"
        :alt="wallpaper.title"
        :mode="previewing ? 'aspectFit' : 'aspectFill'"
        lazy-load
        @load="finishLoading"
      />
      <text v-if="previewing" class="preview-close" @tap.stop="previewing = false">×</text>
      <text v-if="imageLoaded" class="quality-pill">{{ wallpaper.width >= 3840 || wallpaper.height >= 2160 ? '4K' : 'HD' }}</text>
    </button>

    <button v-if="removable" class="remove-button" @tap.stop="emit('remove', wallpaper)">取消收藏</button>
  </view>
</template>

<style scoped>
.wallpaper-card {
  position: relative;
  display: inline-block;
  margin-right: 28rpx;
  overflow: hidden;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 36rpx;
  background: rgba(17, 26, 44, 0.78);
  box-shadow: 0 18rpx 54rpx rgba(2, 8, 23, 0.34);
}

.landscape-card {
  width: 82vw;
  max-width: 840rpx;
  aspect-ratio: 16 / 9;
}

.wallpaper-card.previewing-card {
  overflow: visible;
}

.portrait-card {
  width: 62vw;
  min-width: 360rpx;
  max-width: 520rpx;
  aspect-ratio: 9 / 16;
}

.media-button {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
}

.media-button::after {
  border: 0;
}

.media-button.previewing {
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 12rpx;
  background: rgba(2, 6, 23, 0.96);
}

.image {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(121, 169, 255, 0.26));
  opacity: 0;
  transition: opacity 0.22s ease;
}

.image.loaded {
  opacity: 1;
}

.media-button.previewing .image {
  border-radius: 28rpx;
}

.image-loader {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(30, 41, 59, 0.88), rgba(15, 23, 42, 0.78)),
    radial-gradient(circle at 50% 42%, rgba(96, 165, 250, 0.18), transparent 42%);
}

.scan-photo {
  position: relative;
  width: 118rpx;
  height: 152rpx;
  overflow: hidden;
  border: 1px solid rgba(191, 219, 254, 0.2);
  border-radius: 24rpx;
  background:
    linear-gradient(150deg, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.92)),
    linear-gradient(45deg, transparent 54%, rgba(191, 219, 254, 0.18) 55%);
  box-shadow: 0 18rpx 46rpx rgba(2, 8, 23, 0.3);
}

.scan-photo::before {
  content: "";
  position: absolute;
  left: 22rpx;
  right: 22rpx;
  bottom: 28rpx;
  height: 40rpx;
  border-radius: 999px 999px 0 0;
  background: rgba(147, 197, 253, 0.22);
}

.scan-photo::after {
  content: "";
  position: absolute;
  right: 22rpx;
  top: 28rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.78);
}

.scan-spin {
  position: absolute;
  inset: -42%;
  background: conic-gradient(from 0deg, transparent, rgba(147, 197, 253, 0.88), transparent 26%);
  animation: scanSpin 1.35s linear infinite;
}

.scan-mask {
  position: absolute;
  inset: 8rpx;
  border-radius: 18rpx;
  background: rgba(15, 23, 42, 0.9);
}

@keyframes scanSpin {
  to {
    transform: rotate(360deg);
  }
}

.quality-pill {
  position: absolute;
  z-index: 3;
  right: 20rpx;
  bottom: 20rpx;
  padding: 10rpx 16rpx;
  border: 1px solid rgba(191, 219, 254, 0.24);
  border-radius: 999px;
  background: rgba(2, 8, 23, 0.62);
  color: #dff6ff;
  font-size: 22rpx;
  font-weight: 900;
}

.media-button.previewing .quality-pill {
  display: none;
}

.preview-close {
  position: fixed;
  z-index: 10000;
  top: 28rpx;
  right: 28rpx;
  display: grid;
  place-items: center;
  width: 72rpx;
  height: 72rpx;
  border: 1px solid rgba(191, 219, 254, 0.24);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1;
}

.remove-button {
  position: absolute;
  left: 20rpx;
  bottom: 20rpx;
  margin: 0;
  padding: 10rpx 16rpx;
  border: 1px solid rgba(191, 219, 254, 0.24);
  border-radius: 999px;
  background: rgba(2, 8, 23, 0.62);
  color: #f8fbff;
  font-size: 22rpx;
}

.remove-button::after {
  border: 0;
}
</style>
