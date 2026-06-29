<script setup>
const props = defineProps({
  active: {
    type: String,
    default: 'home',
  },
})

const items = [
  { key: 'home', label: '发现', url: '/pages/index/index' },
  { key: 'favorites', label: '收藏', url: '/pages/favorites/favorites' },
  { key: 'settings', label: '我的', url: '/pages/settings/settings' },
]

function go(url) {
  uni.reLaunch({ url })
}
</script>

<template>
  <view class="bottom-nav">
    <button
      v-for="item in items"
      :key="item.key"
      class="nav-item"
      :class="{ active: item.key === props.active }"
      @tap="go(item.url)"
    >
      {{ item.label }}
    </button>
  </view>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  right: 32rpx;
  bottom: calc(32rpx + env(safe-area-inset-bottom));
  left: 32rpx;
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 840rpx;
  margin: 0 auto;
  padding: 14rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 999px;
  background: rgba(10, 18, 30, 0.76);
  box-shadow: 0 24rpx 74rpx rgba(2, 8, 23, 0.48);
  backdrop-filter: blur(24px);
}

.nav-item {
  margin: 0;
  padding: 22rpx 12rpx;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(213, 226, 242, 0.66);
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.nav-item::after {
  border: 0;
}

.nav-item.active {
  color: #f8fbff;
  background: rgba(91, 151, 255, 0.24);
  box-shadow: inset 0 0 0 1px rgba(147, 197, 253, 0.28), 0 8rpx 24rpx rgba(59, 130, 246, 0.22);
}
</style>
