import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/pages/detail/detail.vue', import.meta.url), 'utf8')

test('detail image opens the native zoomable preview on tap', () => {
  assert.match(source, /<image[^>]*class="preview"[^>]*@tap="previewImage"/s)
  assert.match(source, /function previewImage\(\)[\s\S]*uni\.previewImage\(\{[\s\S]*urls:\s*\[wallpaper\.value\.url\]/)
})
