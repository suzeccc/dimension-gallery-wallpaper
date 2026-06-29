<script setup>
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
})

const emit = defineEmits(['open', 'remove', 'loaded'])

function onLoad(event) {
  const width = Number(event.detail?.width) || 0
  const height = Number(event.detail?.height) || 0
  if (!width || !height) return
  emit('loaded', {
    wallpaper: props.wallpaper,
    meta: {
      width,
      height,
      orientation: height > width ? 'portrait' : 'landscape',
    },
  })
}
</script>

<template>
  <view class="wallpaper-card" :class="`${variant}-card`">
    <button class="media-button" @tap="emit('open', wallpaper)">
      <image
        class="image"
        :src="wallpaper.url"
        :alt="wallpaper.title"
        mode="aspectFill"
        lazy-load
        @load="onLoad"
      />
      <text class="quality-pill">{{ wallpaper.width >= 3840 || wallpaper.height >= 2160 ? '4K' : 'HD' }}</text>
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

.portrait-card {
  width: 62vw;
  min-width: 360rpx;
  max-width: 520rpx;
  aspect-ratio: 9 / 16;
}

.media-button {
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

.image {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(121, 169, 255, 0.26));
}

.quality-pill {
  position: absolute;
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
