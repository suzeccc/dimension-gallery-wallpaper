import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const apiSource = readFileSync(new URL('../src/api/wallpaperApi.js', import.meta.url), 'utf8')
const homeSource = readFileSync(new URL('../src/pages/index/index.vue', import.meta.url), 'utf8')
const homePresets = homeSource.match(/const sourcePresets = \{[\s\S]*?\n\}/)?.[0] ?? ''

function loadApi() {
  const source = `${apiSource.replace(/^import .+$/gm, '').replace(/\bexport\s+/g, '')}
module.exports = {
  fetchElainaMobileWallpapers: typeof fetchElainaMobileWallpapers === 'function' ? fetchElainaMobileWallpapers : undefined,
  fetchElainaPcWallpapers: typeof fetchElainaPcWallpapers === 'function' ? fetchElainaPcWallpapers : undefined,
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

test('Elaina random sources create mobile and pc wallpapers', () => {
  const { fetchElainaMobileWallpapers, fetchElainaPcWallpapers } = loadApi()

  const mobile = fetchElainaMobileWallpapers({ count: 1 })
  const pc = fetchElainaPcWallpapers({ count: 1 })

  assert.equal(mobile[0].source, 'elaina')
  assert.equal(mobile[0].orientation, 'portrait')
  assert.match(mobile[0].url, /^https:\/\/api\.elaina\.cat\/random\/mobile\?i=1700000000000-0&_=1700000000000$/)
  assert.equal(pc[0].source, 'elaina')
  assert.equal(pc[0].orientation, 'landscape')
  assert.match(pc[0].url, /^https:\/\/api\.elaina\.cat\/random\/pc\?i=1700000000000-0&_=1700000000000$/)
})

test('home removes mp and moemp presets and uses Elaina by orientation', () => {
  assert.doesNotMatch(homePresets, /'mp'/)
  assert.doesNotMatch(homePresets, /'moemp'/)
  assert.match(homePresets, /\u63a8\u8350:\s*\{\s*landscape:\s*\['pc', 'moe', 'ys'\],\s*portrait:\s*\['ysmp'\]\s*\}/)
  assert.match(homePresets, /\u52a8\u6f2b:\s*\{\s*landscape:\s*\['pc', 'moe', 'ys'\],\s*portrait:\s*\['ysmp'\]\s*\}/)
  assert.match(homePresets, /\u6cbb\u6108:\s*\{\s*landscape:\s*\['moe', 'fj'\],\s*portrait:\s*\[\]\s*\}/)
  assert.match(homePresets, /\u7b80\u7ea6:\s*\{\s*landscape:\s*\['pc'\],\s*portrait:\s*\[\]\s*\}/)
  assert.match(homePresets, /\u66f4\u591a:\s*\{\s*landscape:\s*\['pc', 'moe', 'fj', 'ys'\],\s*portrait:\s*\['ysmp'\]\s*\}/)
  assert.match(homeSource, /fetchElainaMobileGroup\(activeCategory\.value, 2\)/)
  assert.match(homeSource, /fetchElainaPcGroup\(activeCategory\.value, 2\)/)
  assert.doesNotMatch(homeSource, /elainaPcCategories/)
})
