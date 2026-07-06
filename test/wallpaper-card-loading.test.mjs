import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/components/WallpaperCard.vue', import.meta.url), 'utf8')

test('wallpaper cards show the selected scan spinner while images load', () => {
  assert.match(source, /import \{ ref, watch \} from 'vue'/)
  assert.match(source, /const imageLoaded = ref\(false\)/)
  assert.match(source, /watch\(\(\) => props\.wallpaper\.url[\s\S]*imageLoaded\.value = false/)
  assert.match(source, /function finishLoading\(\)[\s\S]*imageLoaded\.value = true/)
  assert.match(source, /v-if="!imageLoaded"[^>]*class="image-loader"/)
  assert.match(source, /class="scan-photo"/)
  assert.match(source, /class="scan-spin"/)
  assert.match(source, /@load="finishLoading"/)
  assert.doesNotMatch(source, /@error="finishLoading"/)
  assert.match(source, /@keyframes scanSpin/)
  assert.match(source, /animation:\s*scanSpin[^;]*infinite/)
})

test('random image sources are detected from non-image endpoints and preview in place', () => {
  assert.match(source, /const previewing = ref\(false\)/)
  assert.match(source, /const imageExts = new Set\(\[/)
  assert.match(source, /function hasImageExt\(value\)/)
  assert.match(source, /function urlHasImageExt\(url\)/)
  assert.match(source, /function refreshesOnTap\(wallpaper\)/)
  assert.doesNotMatch(source, /img\\\.moehu|acg\\\.yaohud|api\\\.elaina/)
  assert.doesNotMatch(source, /refreshesOnTap\(props\.wallpaper\)\s*&&\s*imageLoaded\.value/)
  assert.doesNotMatch(source, /props\.variant === 'portrait' && refreshesOnTap\(props\.wallpaper\)/)
  assert.match(source, /function openCard\(\)[\s\S]*if \(refreshesOnTap\(props\.wallpaper\)\) \{[\s\S]*if \(imageLoaded\.value\) \{[\s\S]*previewing\.value = true[\s\S]*return[\s\S]*previewImage\(\)/)
  assert.match(source, /:class="\{ previewing \}"/)
  assert.match(source, /:mode="previewing \? 'aspectFit' : 'aspectFill'"/)
  assert.match(source, /class="preview-close"/)
})

test('stable image sources open the native preview directly from the card', () => {
  assert.match(source, /function previewImage\(\)[\s\S]*uni\.previewImage\(\{[\s\S]*urls:\s*\[props\.wallpaper\.url\]/)
  assert.match(source, /function openCard\(\)[\s\S]*if \(refreshesOnTap\(props\.wallpaper\)\) \{[\s\S]*return[\s\S]*previewImage\(\)/)
  assert.doesNotMatch(source, /function openCard\(\)[\s\S]*emit\('open', props\.wallpaper\)/)
})

test('home can force padded in-app preview for image sources', () => {
  const homeSource = readFileSync(new URL('../src/pages/index/index.vue', import.meta.url), 'utf8')

  assert.match(source, /paddedPreview:\s*\{[\s\S]*type:\s*Boolean[\s\S]*default:\s*false/)
  assert.match(source, /function openCard\(\)[\s\S]*if \(props\.paddedPreview\) \{[\s\S]*previewing\.value = true[\s\S]*return/)
  assert.match(source, /'previewing-card':\s*previewing/)
  assert.match(source, /\.wallpaper-card\.previewing-card\s*\{[\s\S]*overflow:\s*visible/)
  assert.match(source, /\.media-button\.previewing\s*\{[\s\S]*box-sizing:\s*border-box[\s\S]*padding:\s*12rpx/)
  assert.match(homeSource, /<WallpaperCard[\s\S]*padded-preview/)
  assert.doesNotMatch(homeSource, /direct-preview/)
})
