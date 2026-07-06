import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/pages/detail/detail.vue', import.meta.url), 'utf8')

test('missing wallpaper error returns to the previous page first', () => {
  assert.match(source, /function goBack\(\)[\s\S]*getCurrentPages[\s\S]*uni\.navigateBack\(\)[\s\S]*uni\.reLaunch\(\{ url: '\/pages\/index\/index' \}\)/)
  assert.match(source, /<view v-if="error" class="state-card">[\s\S]*<button @tap="goBack">返回上级<\/button>/)
})

test('normal detail back button returns to the previous page first', () => {
  assert.match(source, /<template v-else-if="wallpaper">[\s\S]*<button class="back-button" @tap="goBack">返回<\/button>/)
})
