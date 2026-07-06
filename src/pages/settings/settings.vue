<script setup>
import { computed } from 'vue'
import { useFavorites } from '../../composables/useFavorites.js'
import { useHistory } from '../../composables/useHistory.js'
import { useSettings } from '../../composables/useSettings.js'
import { clearAppCache } from '../../utils/cache.js'
import BottomNav from '../../components/BottomNav.vue'

const sourceOptions = [
  { value: 'mixed', label: '混合', fullLabel: '混合推荐' },
  { value: 'alcy', label: '栗次元', fullLabel: '栗次元' },
  { value: 'yeqing', label: '夜轻', fullLabel: '夜轻' },
]

const orientationOptions = [
  { value: 'auto', label: '自动', fullLabel: '自动识别' },
  { value: 'landscape', label: '横屏', fullLabel: '横屏优先' },
  { value: 'portrait', label: '竖屏', fullLabel: '竖屏优先' },
]

const experienceItems = [
  { label: '首页布局', value: '横竖分区' },
  { label: '图片质量', value: '高清优先' },
  { label: '动画效果', value: '开启' },
  { label: '毛玻璃强度', value: '标准' },
]

const { settings, updateSettings, resetSettings } = useSettings()
const { clearFavorites } = useFavorites()
const { clearHistory } = useHistory()

const selectedSource = computed(() => sourceOptions.find(option => option.value === settings.value.defaultSource) || sourceOptions[0])
const selectedOrientation = computed(() => orientationOptions.find(option => option.value === settings.value.defaultOrientation) || orientationOptions[0])

function selectSource(value) {
  updateSettings({ defaultSource: value })
}

function selectOrientation(value) {
  updateSettings({ defaultOrientation: value })
}

function toggleSetting(key) {
  updateSettings({ [key]: !settings.value[key] })
}

function clearCache() {
  clearAppCache()
}

function confirmAction(title, action) {
  uni.showModal({
    title,
    content: '此操作不可撤销，请确认后继续',
    confirmColor: '#ef4444',
    success: result => {
      if (!result.confirm) return
      action()
      uni.showToast({ title: '已完成', icon: 'none' })
    },
  })
}

function goAbout() {
  uni.navigateTo({ url: '/pages/about/about' })
}
</script>

<template>
  <view class="settings-page">
    <view class="settings-shell">
      <view class="settings-grid">
        <view class="section-card panel-card">
          <text class="panel-title">偏好设置</text>

          <view class="setting-block">
            <view class="setting-copy">
              <text class="setting-label">默认数据源</text>
              <text class="setting-value">{{ selectedSource.fullLabel }}</text>
            </view>
            <view class="pill-group">
              <button
                v-for="option in sourceOptions"
                :key="option.value"
                class="option-pill"
                :class="{ active: option.value === settings.defaultSource }"
                @tap="selectSource(option.value)"
              >
                {{ option.label }}
              </button>
            </view>
          </view>

          <view class="setting-block">
            <view class="setting-copy">
              <text class="setting-label">默认方向</text>
              <text class="setting-value">{{ selectedOrientation.fullLabel }}</text>
            </view>
            <view class="pill-group">
              <button
                v-for="option in orientationOptions"
                :key="option.value"
                class="option-pill"
                :class="{ active: option.value === settings.defaultOrientation }"
                @tap="selectOrientation(option.value)"
              >
                {{ option.label }}
              </button>
            </view>
          </view>

          <view class="setting-row">
            <view class="setting-copy">
              <text class="setting-label">显示 AI 图片</text>
              <text class="setting-value">{{ settings.showAi ? '开启' : '关闭' }}</text>
            </view>
            <button class="toggle-control" :class="{ active: settings.showAi }" @tap="toggleSetting('showAi')">
              <view class="toggle-thumb" />
            </button>
          </view>

          <view class="setting-row">
            <view class="setting-copy">
              <text class="setting-label">安全模式</text>
              <text class="setting-value">{{ settings.safeMode ? '开启' : '关闭' }}</text>
            </view>
            <button class="toggle-control" :class="{ active: settings.safeMode }" @tap="toggleSetting('safeMode')">
              <view class="toggle-thumb" />
            </button>
          </view>

          <view class="info-group">
            <text class="subsection-title">显示与体验</text>
            <view v-for="item in experienceItems" :key="item.label" class="info-row">
              <text>{{ item.label }}</text>
              <text>{{ item.value }}</text>
            </view>
          </view>
        </view>

        <view class="section-card panel-card data-panel">
          <view class="panel-heading">
            <text class="panel-title">数据管理</text>
            <text class="panel-desc">清理本地记录、接口缓存与偏好配置</text>
          </view>
          <view class="action-list">
            <button class="action-button" @tap="confirmAction('清空收藏', clearFavorites)">
              <view class="action-copy">
                <text class="action-title">清空收藏</text>
                <text class="action-hint">删除已保存壁纸</text>
              </view>
              <text class="action-arrow">&gt;</text>
            </button>
            <button class="action-button" @tap="confirmAction('清空历史', clearHistory)">
              <view class="action-copy">
                <text class="action-title">清空历史</text>
                <text class="action-hint">清除最近浏览</text>
              </view>
              <text class="action-arrow">&gt;</text>
            </button>
            <button class="action-button" @tap="confirmAction('清空缓存', clearCache)">
              <view class="action-copy">
                <text class="action-title">清空缓存</text>
                <text class="action-hint">刷新接口缓存</text>
              </view>
              <text class="action-arrow">&gt;</text>
            </button>
            <button class="action-button" @tap="confirmAction('恢复默认设置', resetSettings)">
              <view class="action-copy">
                <text class="action-title">恢复默认设置</text>
                <text class="action-hint">重置偏好选项</text>
              </view>
              <text class="action-arrow">&gt;</text>
            </button>
          </view>
        </view>

        <view class="section-card panel-card about-panel">
          <text class="panel-title">关于应用</text>
          <button class="about-link" @tap="goAbout">关于与版权</button>
          <view class="info-row">
            <text>API 来源说明</text>
            <text>公开接口</text>
          </view>
          <view class="info-row">
            <text>当前版本</text>
            <text>v0.1.0</text>
          </view>
          <text class="about-note">图片来源于公开 API，仅做学习展示</text>
        </view>
      </view>
    </view>

    <BottomNav active="settings" />
  </view>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding-top: 32px;
  background:
    radial-gradient(circle at 18% 0%, rgba(96, 165, 250, 0.16), transparent 28%),
    radial-gradient(circle at 90% 22%, rgba(59, 130, 246, 0.12), transparent 26%),
    linear-gradient(180deg, #101a2d 0%, #050914 42%, #02040a 100%);
  color: #f8fafc;
}

.settings-shell {
  width: min(100% - 32px, 980px);
  margin: 0 auto;
  padding-bottom: 120px;
}

.section-card {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.58);
}

.setting-copy {
  display: grid;
  min-width: 0;
}

.option-pill,
.about-link {
  margin: 0;
  border: 0;
  border-radius: 999px;
  color: #f8fafc;
}

.settings-grid {
  display: grid;
  gap: 12px;
}

.setting-label,
.info-row text:first-child {
  color: rgba(203, 213, 225, 0.68);
  font-size: 13px;
}

.setting-value,
.info-row text:last-child {
  color: #bfdbfe;
  font-size: 13px;
  font-weight: 800;
}

.panel-card {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.panel-title {
  color: #f8fafc;
  font-size: 18px;
  font-weight: 900;
}

.panel-heading {
  display: grid;
  gap: 6px;
}

.panel-desc {
  color: rgba(203, 213, 225, 0.62);
  font-size: 13px;
}

.setting-block,
.setting-row,
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.setting-block {
  align-items: flex-start;
  flex-direction: column;
}

.setting-row,
.info-row {
  min-height: 36px;
}

.info-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.subsection-title {
  grid-column: 1 / -1;
  color: #f8fafc;
  font-size: 15px;
  font-weight: 900;
}

.info-group .info-row {
  display: grid;
  gap: 2px;
  min-height: 0;
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.option-pill {
  padding: 8px 14px;
  background: rgba(15, 23, 42, 0.74);
  color: rgba(203, 213, 225, 0.78);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}

.option-pill.active {
  background: rgba(59, 130, 246, 0.34);
  color: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(191, 219, 254, 0.28);
}

.toggle-control {
  position: relative;
  width: 54px;
  height: 30px;
  padding: 3px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.72);
}

.toggle-control.active {
  background: rgba(59, 130, 246, 0.42);
  box-shadow: inset 0 0 0 1px rgba(191, 219, 254, 0.24);
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #e2e8f0;
  transition: transform 0.18s ease;
}

.toggle-control.active .toggle-thumb {
  transform: translateX(24px);
  background: #f8fafc;
}

.data-panel {
  gap: 16px;
}

.action-list {
  display: grid;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.action-button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  margin: 0;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 0;
  background: transparent;
  color: #dbeafe;
  text-align: left;
}

.action-copy {
  display: grid;
  gap: 4px;
}

.action-title {
  font-size: 14px;
  font-weight: 900;
  line-height: 1.2;
}

.action-hint {
  color: rgba(203, 213, 225, 0.58);
  font-size: 12px;
  line-height: 1.2;
}

.action-arrow {
  color: rgba(191, 219, 254, 0.62);
  font-size: 16px;
  font-weight: 900;
}

.about-link {
  padding: 10px 14px;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
}

.about-link {
  justify-self: flex-start;
  background: rgba(59, 130, 246, 0.22);
  color: #bfdbfe;
}

.about-panel .panel-title {
  color: #cbd5e1;
}

.about-note {
  color: rgba(203, 213, 225, 0.68);
  font-size: 13px;
  line-height: 1.6;
}

button::after {
  border: 0;
}

@media (min-width: 860px) {
  .settings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .data-panel {
    grid-column: 1 / -1;
  }

  .action-list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .about-panel {
    grid-column: 1 / -1;
  }
}
</style>
