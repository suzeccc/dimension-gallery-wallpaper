import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/pages/wallpapers/wallpapers.vue', import.meta.url), 'utf8')

test('wallpapers page uses a polished compact back button', () => {
  assert.match(source, /<button class="back-button" @tap="goBack">[\s\S]*class="back-icon"[\s\S]*class="back-label"[\s\S]*<\/button>/)
  assert.match(source, /\.back-button\s*\{[\s\S]*display:\s*inline-flex/)
  assert.match(source, /\.back-button\s*\{[\s\S]*min-width:\s*108rpx/)
  assert.match(source, /\.back-button\s*\{[\s\S]*height:\s*64rpx/)
  assert.match(source, /\.back-icon\s*\{/)
  assert.match(source, /\.back-label\s*\{/)
})
