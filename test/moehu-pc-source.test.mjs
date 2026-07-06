import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const apiSource = readFileSync(new URL('../src/api/wallpaperApi.js', import.meta.url), 'utf8')
const homeSource = readFileSync(new URL('../src/pages/index/index.vue', import.meta.url), 'utf8')
const listSource = readFileSync(new URL('../src/pages/wallpapers/wallpapers.vue', import.meta.url), 'utf8')

function loadApi() {
  const source = `${apiSource.replace(/^import .+$/gm, '').replace(/\bexport\s+/g, '')}
module.exports = {
  fetchMoehuPcWallpapers: typeof fetchMoehuPcWallpapers === 'function' ? fetchMoehuPcWallpapers : undefined,
}`
  const sandbox = {
    module: { exports: {} },
    Date: class extends Date {
      static now() {
        return 1700000000000
      }
    },
    Math,
    Number,
    String,
    Array,
    Set,
    Error,
  }

  vm.runInNewContext(source, sandbox)
  return sandbox.module.exports
}

test('Moehu pc source creates landscape wallpapers when explicitly used', () => {
  const { fetchMoehuPcWallpapers } = loadApi()

  assert.equal(typeof fetchMoehuPcWallpapers, 'function')

  const wallpapers = fetchMoehuPcWallpapers({ category: '推荐', count: 4 })

  assert.equal(wallpapers.length, 4)
  assert.equal(wallpapers[0].source, 'moehu')
  assert.equal(wallpapers[0].category, '推荐')
  assert.equal(wallpapers[0].title, 'Moehu 横屏壁纸')
  assert.equal(wallpapers[0].orientation, 'landscape')
  assert.match(wallpapers[0].url, /^https:\/\/img\.moehu\.org\/pic\.php\?id=pc&i=1700000000000-0&_=1700000000000$/)
})

test('home and list pages keep Moehu pc out of the default recommendation flow', () => {
  assert.match(homeSource, /moehuPcCategories\s*=\s*new Set\(\['动漫'\]\)/)
  assert.match(listSource, /moehuPcCategories\s*=\s*new Set\(\['动漫'\]\)/)
  assert.match(homeSource, /const landscape = \[[\s\S]*fetchMoehuPcGroup\(activeCategory\.value, 2\)[\s\S]*const portrait = \[/)
  assert.match(listSource, /const next = \[[\s\S]*fetchMoehuPcGroup\(activeCategory\.value, orientation\.value, 2\)[\s\S]*fetchYeqingGroup/)
})
