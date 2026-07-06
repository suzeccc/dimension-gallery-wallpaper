import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const homeSource = readFileSync(new URL('../src/pages/index/index.vue', import.meta.url), 'utf8')
const listSource = readFileSync(new URL('../src/pages/wallpapers/wallpapers.vue', import.meta.url), 'utf8')

test('home renders only four wallpapers per section on mobile', () => {
  assert.match(homeSource, /const HOME_SECTION_LIMIT = 4/)
  assert.doesNotMatch(homeSource, /slice\(0, 6\)/)
  assert.match(homeSource, /slice\(0, HOME_SECTION_LIMIT\)/)
})

test('recommended feeds skip the slow Moehu pc direct image source', () => {
  const homeLine = homeSource.match(/const moehuPcCategories = [^\r\n]+/)?.[0] ?? ''
  const listLine = listSource.match(/const moehuPcCategories = [^\r\n]+/)?.[0] ?? ''

  assert.doesNotMatch(homeLine, /推荐/)
  assert.doesNotMatch(listLine, /推荐/)
  assert.match(homeLine, /动漫/)
  assert.match(listLine, /动漫/)
})

test('alcy category requests run in parallel', () => {
  assert.match(homeSource, /Promise\.all\(\s*categories\.map/)
  assert.match(listSource, /Promise\.all\(\s*categories\.map/)
  assert.doesNotMatch(homeSource, /for \(const category of categories\) \{[\s\S]*await fetchAlcyWallpapers/)
  assert.doesNotMatch(listSource, /for \(const category of categories\) \{[\s\S]*await fetchAlcyWallpapers/)
})

test('wallpaper list caps each normal batch before rendering', () => {
  assert.match(listSource, /const WALLPAPER_BATCH_SIZE = 8/)
  assert.match(listSource, /const batch = dedupe\(next\)\.slice\(0, WALLPAPER_BATCH_SIZE\)/)
  assert.match(listSource, /wallpapers\.value = append \? dedupe\(\[\.\.\.wallpapers\.value, \.\.\.batch\]\) : batch/)
})

test('landscape category does not render generic portrait wallpapers', () => {
  const homeLandscapeLine = homeSource.match(/landscape:\s*\['fj', 'pc'\][^\r\n]+/)?.[0] ?? ''
  const listLandscapeLine = listSource.match(/landscape:\s*\['fj', 'pc'\][^\r\n]+/)?.[0] ?? ''

  assert.match(homeLandscapeLine, /portrait:\s*\[\]/)
  assert.match(listLandscapeLine, /portrait:\s*\[\]/)
  assert.match(homeSource, /function fetchYeqingGroup\(preset, orientation, count\)/)
  assert.match(listSource, /function fetchYeqingGroup\(preset, orientation, count\)/)
})
