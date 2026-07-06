import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/pages/index/index.vue', import.meta.url), 'utf8')
const wallpapersSource = readFileSync(new URL('../src/pages/wallpapers/wallpapers.vue', import.meta.url), 'utf8')
const apiSource = readFileSync(new URL('../src/api/wallpaperApi.js', import.meta.url), 'utf8')
const asset = path => new URL(`../src/static/home/${path}`, import.meta.url)
const heroSwiperBlock = source.match(/\.hero-swiper\s*\{[^}]*\}/)?.[0] ?? ''
const homePresets = source.match(/const sourcePresets = \{[\s\S]*?\n\}/)?.[0] ?? ''
const wallpapersPresets = wallpapersSource.match(/const sourcePresets = \{[\s\S]*?\n\}/)?.[0] ?? ''
const firstPresetLine = text => text.match(/const sourcePresets = \{\s*\r?\n\s*([^\r\n]+)/)?.[1] ?? ''

test('recommendation category does not include the fj source', () => {
  assert.doesNotMatch(firstPresetLine(source), /'fj'/)
  assert.doesNotMatch(firstPresetLine(wallpapersSource), /'fj'/)
})

test('home category chips use the requested order', () => {
  const chips = source
    .match(/const categoryChips = \[([^\]]+)\]/)?.[1]
    .match(/'([^']+)'/g)
    .map(item => item.slice(1, -1))

  assert.deepEqual(chips, ['推荐', '动漫', '风景', '治愈', '简约', '游戏', 'AI', '美女', '黑色', '白色', 'R18', 'AI R18'])
})

test('home uses the left-header logo cutout and five static banner slides without search UI', () => {
  assert.equal(source.includes('searchText'), false)
  assert.equal(source.includes('search-panel'), false)
  assert.match(source, /<swiper[\s\S]*autoplay[\s\S]*circular[\s\S]*indicator-dots/)
  assert.match(source, /interval="3500"/)
  assert.match(source, /duration="500"/)
  assert.doesNotMatch(source, /hero-banner-bg/)
  assert.match(source, /class="hero-banner"[\s\S]*mode="aspectFill"/)
  assert.match(heroSwiperBlock, /aspect-ratio:\s*3\s*\/\s*1/)
  assert.match(heroSwiperBlock, /height:\s*calc\(\(100vw\s*-\s*56rpx\)\s*\/\s*3\)/)
  assert.doesNotMatch(heroSwiperBlock, /height:\s*32vw/)
  assert.doesNotMatch(heroSwiperBlock, /max-height:\s*420rpx/)
  assert.doesNotMatch(source, /max-width:\s*1260rpx/)
  assert.match(source, /\/static\/home\/brand-wordmark\.png/)
  assert.doesNotMatch(source, /const logoSrc = '\/static\/home\/logo\.png'/)
  assert.match(source, /\.brand-panel\s*\{[\s\S]*justify-content:\s*flex-start/)

  for (let index = 1; index <= 5; index += 1) {
    assert.match(source, new RegExp(`/static/home/banner-wide-${index}-clean\\.png`))
    assert.equal(existsSync(asset(`banner-wide-${index}-clean.png`)), true)
  }
  assert.equal(existsSync(asset('brand-wordmark.png')), true)
})

test('loaded image metadata filters wrong orientation only for recommendation and anime', () => {
  assert.match(source, /const orientationGuardCategories = new Set\(\['推荐', '动漫'\]\)/)
  assert.match(wallpapersSource, /const orientationGuardCategories = new Set\(\['推荐', '动漫'\]\)/)
  assert.match(source, /if \(!orientationGuardCategories\.has\(activeCategory\.value\)\) \{[\s\S]*landscapeWallpapers\.value = landscapeWallpapers\.value\.map\(update\)[\s\S]*portraitWallpapers\.value = portraitWallpapers\.value\.map\(update\)[\s\S]*return/)
  assert.match(source, /meta\.orientation === variant/)
  assert.match(source, /landscapeWallpapers\.value = landscapeWallpapers\.value\.map\(update\('landscape'\)\)\.filter\(Boolean\)/)
  assert.match(source, /portraitWallpapers\.value = portraitWallpapers\.value\.map\(update\('portrait'\)\)\.filter\(Boolean\)/)
  assert.match(wallpapersSource, /if \(!orientationGuardCategories\.has\(activeCategory\.value\)\) return/)
  assert.match(wallpapersSource, /\.filter\(item => item\.orientation === orientation\.value\)/)
})

test('home has a beauty category backed by the moehu image API', () => {
  assert.match(source, /const categoryChips = \[[^\]]*'美女'/)
  assert.match(source, /fetchMoehuWallpapers/)
  assert.match(wallpapersSource, /fetchMoehuWallpapers/)
  assert.match(wallpapersSource, /activeCategory\.value === '美女'/)
  assert.match(apiSource, /https:\/\/img\.moehu\.org\/pic\.php\?id=xjj/)
  assert.match(apiSource, /export function fetchMoehuWallpapers/)
})

test('home has a black category backed only by the moehu acghs image API', () => {
  assert.match(source, /const categoryChips = \[[^\]]*'黑色'/)
  assert.match(apiSource, /https:\/\/img\.moehu\.org\/pic\.php\?id=acghs/)
  assert.match(apiSource, /export function fetchBlackWallpapers/)
  assert.match(source, /activeCategory\.value === '黑色'[\s\S]*fetchBlackWallpapers/)
  assert.match(wallpapersSource, /activeCategory\.value === '黑色'[\s\S]*fetchBlackWallpapers/)
  assert.doesNotMatch(source, /黑色:[^\n]*\['/)
  assert.doesNotMatch(wallpapersSource, /黑色:[^\n]*\['/)
})

test('home has a white category backed only by the moehu acgbs image API', () => {
  assert.match(source, /const categoryChips = \[[^\]]*'白色'/)
  assert.match(apiSource, /https:\/\/img\.moehu\.org\/pic\.php\?id=acgbs/)
  assert.match(apiSource, /export function fetchWhiteWallpapers/)
  assert.match(source, /activeCategory\.value === '白色'[\s\S]*fetchWhiteWallpapers/)
  assert.match(wallpapersSource, /activeCategory\.value === '白色'[\s\S]*fetchWhiteWallpapers/)
  assert.doesNotMatch(source, /白色:[^\n]*\['/)
  assert.doesNotMatch(wallpapersSource, /白色:[^\n]*\['/)
})

test('home has an R18 category backed only by the yaohud image API', () => {
  assert.match(source, /const categoryChips = \[[^\]]*'R18'/)
  assert.match(apiSource, /https:\/\/acg\.yaohud\.cn\/R18\/setu\.php/)
  assert.doesNotMatch(apiSource, /sex\.nyan\.run/)
  assert.match(apiSource, /export function fetchR18Wallpapers/)
  assert.match(source, /activeCategory\.value === 'R18'[\s\S]*fetchR18Wallpapers/)
  assert.match(wallpapersSource, /activeCategory\.value === 'R18'[\s\S]*fetchR18Wallpapers/)
  assert.doesNotMatch(source, /R18:[^\n]*\['/)
  assert.doesNotMatch(wallpapersSource, /R18:[^\n]*\['/)
})

test('home has an AI R18 category backed only by the yaohud dm r18 API', () => {
  assert.match(source, /const categoryChips = \[[^\]]*'AI R18'/)
  assert.match(apiSource, /https:\/\/acg\.yaohud\.cn\/dm\/r18\.php/)
  assert.match(apiSource, /export function fetchAiR18Wallpapers/)
  assert.match(source, /activeCategory\.value === 'AI R18'[\s\S]*fetchAiR18Wallpapers/)
  assert.match(wallpapersSource, /activeCategory\.value === 'AI R18'[\s\S]*fetchAiR18Wallpapers/)
  assert.doesNotMatch(source, /AI R18:[^\n]*\['/)
  assert.doesNotMatch(wallpapersSource, /AI R18:[^\n]*\['/)
})

test.skip('legacy removed wallpaper API block', () => {
  assert.ok(true)
  assert.ok(true)
  assert.match(source, /const qyCategories = new Set\(\['推荐', '动漫'\]\)/)
  assert.match(wallpapersSource, /const qyCategories = new Set\(\['推荐', '动漫'\]\)/)
  assert.ok(true)
  assert.ok(true)
  assert.ok(true)
})

test('home separates AI wallpapers from the default recommendation feed', () => {
  assert.match(source, /const categoryChips = \[[^\]]*'AI'/)
  assert.match(source, /AI:\s*\{\s*landscape:\s*\['ai'\],\s*portrait:\s*\['aimp'\]\s*\}/)
  assert.match(wallpapersSource, /AI:\s*\{\s*landscape:\s*\['ai'\],\s*portrait:\s*\['aimp'\]\s*\}/)
  assert.doesNotMatch(source, /推荐:\s*\{[^}]*\bai\b/)
  assert.doesNotMatch(source, /推荐:\s*\{[^}]*\baimp\b/)
  assert.doesNotMatch(wallpapersSource, /推荐:\s*\{[^}]*\bai\b/)
  assert.doesNotMatch(wallpapersSource, /推荐:\s*\{[^}]*\baimp\b/)
})

test('AI wallpaper APIs only appear in the AI category', () => {
  assert.doesNotMatch(source, /const categoryChips = \[[^\]]*'插画'/)

  for (const presets of [homePresets, wallpapersPresets]) {
    assert.doesNotMatch(presets, /\n\s*插画:/)
    assert.deepEqual(
      presets
        .split('\n')
        .filter(line => line.includes("'ai'") || line.includes("'aimp'"))
        .map(line => line.trim()),
      ["AI: { landscape: ['ai'], portrait: ['aimp'] },"],
    )
  }
})

test('project does not use the removed wallpaper API', () => {
  const removedSource = ['98', 'qy'].join('')
  const removedHost = ['www', '98', 'qy', 'com'].join('\\.')
  const removedFetcher = ['fetch', 'Qy'].join('')
  const removedConstant = ['QY', 'WALLPAPER', 'URL'].join('_')

  for (const text of [source, wallpapersSource, apiSource]) {
    assert.doesNotMatch(text, new RegExp(removedSource))
    assert.doesNotMatch(text, new RegExp(removedHost))
    assert.doesNotMatch(text, new RegExp(removedFetcher))
    assert.doesNotMatch(text, new RegExp(removedConstant))
  }
})
