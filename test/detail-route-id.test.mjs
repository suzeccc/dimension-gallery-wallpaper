import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/pages/detail/detail.vue', import.meta.url), 'utf8')

test('detail page decodes route id before restoring wallpaper', () => {
  assert.match(source, /const id = params\?\.id \? decodeURIComponent\(params\.id\) : ''/)
  assert.match(source, /wallpaper\.value = restore\(id\)/)
})
