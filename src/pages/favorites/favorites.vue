<script setup>
import { onShow } from '@dcloudio/uni-app'
import { useFavorites } from '../../composables/useFavorites.js'
import BottomNav from '../../components/BottomNav.vue'
import WallpaperCard from '../../components/WallpaperCard.vue'

const { favorites, removeFavorite, reloadFavorites } = useFavorites()

function openWallpaper(wallpaper) {
  uni.setStorageSync('moe-wallpaper-current', wallpaper)
  uni.navigateTo({ url: `/pages/detail/detail?id=${encodeURIComponent(wallpaper.id)}` })
}

onShow(reloadFavorites)
</script>

<template>
  <view class="favorites-page">
    <text class="title">收藏</text>

    <view v-if="!favorites.length" class="state-card">还没有收藏壁纸</view>

    <view v-else class="grid">
      <WallpaperCard
        v-for="wallpaper in favorites"
        :key="wallpaper.url"
        :wallpaper="wallpaper"
        :variant="wallpaper.orientation === 'portrait' ? 'portrait' : 'landscape'"
        removable
        @open="openWallpaper"
        @remove="removeFavorite($event.url)"
      />
    </view>

    <BottomNav active="favorites" />
  </view>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  padding: 32rpx 28rpx 170rpx;
  background: #030712;
  color: #f8fbff;
}

.title {
  display: block;
  margin-bottom: 28rpx;
  font-size: 46rpx;
  font-weight: 900;
}

.grid {
  display: grid;
  gap: 24rpx;
}

.state-card {
  padding: 40rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 36rpx;
  background: rgba(15, 23, 42, 0.72);
  color: rgba(213, 226, 242, 0.76);
}
</style>
