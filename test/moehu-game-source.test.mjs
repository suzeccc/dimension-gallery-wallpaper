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
  fetchMoehuGameWallpapers: typeof fetchMoehuGameWallpapers === 'function' ? fetchMoehuGameWallpapers : undefined,
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

test('Moehu game source creates landscape wallpapers from ys and mrfz only', () => {
  const { fetchMoehuGameWallpapers } = loadApi()

  assert.equal(typeof fetchMoehuGameWallpapers, 'function')

  const wallpapers = fetchMoehuGameWallpapers({ count: 4 })

  assert.equal(wallpapers.length, 4)
  assert.equal(wallpapers[0].source, 'moehu')
  assert.equal(wallpapers[0].category, '游戏')
  assert.equal(wallpapers[0].title, '游戏横屏壁纸')
  assert.equal(wallpapers[0].orientation, 'landscape')
  assert.match(wallpapers[0].url, /^https:\/\/img\.moehu\.org\/pic\.php\?id=ys&i=1700000000000-0&_=1700000000000$/)
  assert.match(wallpapers[1].url, /^https:\/\/img\.moehu\.org\/pic\.php\?id=mrfz&i=1700000000000-1&_=1700000000000$/)
  assert.match(wallpapers[2].url, /^https:\/\/img\.moehu\.org\/pic\.php\?id=ys&i=1700000000000-2&_=1700000000000$/)
})

test('home adds game immediately before AI and uses only the game source', () => {
  const chips = homeSource
    .match(/const categoryChips = \[([^\]]+)\]/)?.[1]
    .match(/'([^']+)'/g)
    .map(item => item.slice(1, -1))

  assert.equal(chips.indexOf('游戏'), chips.indexOf('AI') - 1)
  assert.match(homeSource, /游戏:\s*\{\s*landscape:\s*\[\],\s*portrait:\s*\[\]\s*\}/)
  assert.match(homeSource, /fetchMoehuGameWallpapers/)
  assert.match(homeSource, /activeCategory\.value === '游戏'[\s\S]*landscapeWallpapers\.value = fetchMoehuGameWallpapers\(\{ count: HOME_SECTION_LIMIT \}\)[\s\S]*portraitWallpapers\.value = \[\]/)
  assert.match(homeSource, /activeCategory\.value === '游戏'[\s\S]*if \(variant === 'portrait'\) \{[\s\S]*portraitWallpapers\.value = \[\][\s\S]*return[\s\S]*fetchMoehuGameWallpapers\(\{ count: HOME_SECTION_LIMIT \}\)/)
})

test('wallpaper list accepts game and loads it only for landscape pages', () => {
  assert.match(listSource, /游戏:\s*\{\s*landscape:\s*\[\],\s*portrait:\s*\[\]\s*\}/)
  assert.match(listSource, /fetchMoehuGameWallpapers/)
  assert.match(listSource, /activeCategory\.value === '游戏'[\s\S]*orientation\.value === 'landscape'[\s\S]*fetchMoehuGameWallpapers\(\{ count: WALLPAPER_BATCH_SIZE \}\)/)
})
