<script setup>
import { useFavorites } from '../../composables/useFavorites.js'
import { useHistory } from '../../composables/useHistory.js'
import { useSettings } from '../../composables/useSettings.js'
import { clearAppCache } from '../../utils/cache.js'
import BottomNav from '../../components/BottomNav.vue'

const { settings, updateSettings, resetSettings } = useSettings()
const { clearFavorites } = useFavorites()
const { clearHistory } = useHistory()

function confirm(title, action) {
  uni.showModal({
    title,
    content: '此操作不可撤销',
    success: result => {
      if (result.confirm) {
        action()
        uni.showToast({ title: '已完成', icon: 'none' })
      }
    },
  })
}
</script>

<template>
  <view class="settings-page">
    <text class="title">我的</text>

    <view class="panel">
      <text class="panel-title">偏好设置</text>
      <label class="row">
        <text>默认数据源</text>
        <picker :value="['mixed', 'alcy', 'yeqing'].indexOf(settings.defaultSource)" :range="['mixed', 'alcy', 'yeqing']" @change="updateSettings({ defaultSource: ['mixed', 'alcy', 'yeqing'][$event.detail.value] })">
          <text>{{ settings.defaultSource }}</text>
        </picker>
      </label>
      <label class="row">
        <text>默认方向</text>
        <picker :value="['auto', 'landscape', 'portrait'].indexOf(settings.defaultOrientation)" :range="['auto', 'landscape', 'portrait']" @change="updateSettings({ defaultOrientation: ['auto', 'landscape', 'portrait'][$event.detail.value] })">
          <text>{{ settings.defaultOrientation }}</text>
        </picker>
      </label>
      <label class="row">
        <text>显示 AI</text>
        <switch :checked="settings.showAi" @change="updateSettings({ showAi: $event.detail.value })" />
      </label>
      <label class="row">
        <text>安全模式</text>
        <switch :checked="settings.safeMode" @change="updateSettings({ safeMode: $event.detail.value })" />
      </label>
    </view>

    <view class="panel actions">
      <button @tap="confirm('清空收藏', clearFavorites)">清空收藏</button>
      <button @tap="confirm('清空历史', clearHistory)">清空历史</button>
      <button @tap="confirm('清空缓存', clearAppCache)">清空缓存</button>
      <button @tap="resetSettings">恢复默认设置</button>
      <button @tap="uni.navigateTo({ url: '/pages/about/about' })">关于与版权</button>
    </view>

    <BottomNav active="settings" />
  </view>
</template>

<style scoped>
.settings-page {
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

.panel {
  display: grid;
  gap: 22rpx;
  margin-bottom: 24rpx;
  padding: 30rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 36rpx;
  background: rgba(15, 23, 42, 0.72);
}

.panel-title {
  font-size: 32rpx;
  font-weight: 900;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(213, 226, 242, 0.86);
}

.actions button {
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(121, 169, 255, 0.26);
  color: #f8fbff;
}

button::after {
  border: 0;
}
</style>
