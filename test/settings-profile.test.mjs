import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/pages/settings/settings.vue', import.meta.url), 'utf8')

test('settings page starts from stats and keeps localized controls', () => {
  for (const text of ['数据概览', '偏好设置', '显示与体验', '数据管理', '关于应用']) {
    assert.match(source, new RegExp(text))
  }

  for (const text of ['混合推荐', '栗次元', '夜轻', '自动识别', '横屏优先', '竖屏优先']) {
    assert.match(source, new RegExp(text))
  }

  assert.doesNotMatch(source, /hero-card/)
  assert.doesNotMatch(source, /avatar-mark/)
  assert.doesNotMatch(source, /hero-subtitle/)
  assert.doesNotMatch(source, /tag-row/)
  assert.doesNotMatch(source, /profileTags/)

  assert.doesNotMatch(source, /\{\{\s*settings\.defaultSource\s*\}\}/)
  assert.doesNotMatch(source, /\{\{\s*settings\.defaultOrientation\s*\}\}/)
  assert.doesNotMatch(source, /<switch\b/)
  assert.match(source, /\.toggle-control/)
  assert.match(source, /\.toggle-control\.active/)

  assert.match(source, /class="settings-shell"/)
  assert.match(source, /width:\s*min\(100%\s*-\s*32px,\s*980px\)/)
  assert.match(source, /padding-bottom:\s*120px/)
  assert.match(source, /@media\s*\(min-width:\s*860px\)/)

  assert.match(source, /class="stats-strip"/)
  assert.doesNotMatch(source, /class="glass-card/)
  assert.doesNotMatch(source, /backdrop-filter/)
  assert.match(source, /class="action-button danger"/)
  assert.match(source, /class="action-button warning"/)
  assert.match(source, /class="section-card panel-card data-panel"/)
  assert.match(source, /class="action-list"/)
  assert.match(source, /class="action-hint"/)
  assert.match(source, /class="action-arrow"/)
  assert.match(source, /\.data-panel\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/)
  assert.match(source, /\.action-list\s*\{[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(source, /confirmAction\('清空收藏'/)
  assert.match(source, /confirmAction\('恢复默认设置'/)
  assert.match(source, /clearFavorites/)
  assert.match(source, /clearHistory/)
  assert.match(source, /clearAppCache/)
})
