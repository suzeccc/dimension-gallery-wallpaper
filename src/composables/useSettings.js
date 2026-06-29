import { ref } from 'vue'
import { readStorage, writeStorage } from '../utils/storage.js'

const KEY = 'moe-wallpaper-settings'
const DEFAULTS = {
  defaultSource: 'mixed',
  defaultOrientation: 'auto',
  showAi: true,
  safeMode: true,
}

function readSettings() {
  const value = readStorage(KEY, {})
  return { ...DEFAULTS, ...(value && typeof value === 'object' ? value : {}) }
}

const settings = ref(readSettings())
writeStorage(KEY, settings.value)

export function useSettings() {
  function updateSettings(patch) {
    settings.value = { ...settings.value, ...patch }
    writeStorage(KEY, settings.value)
  }

  function resetSettings() {
    settings.value = { ...DEFAULTS }
    writeStorage(KEY, settings.value)
  }

  return { settings, updateSettings, resetSettings }
}
