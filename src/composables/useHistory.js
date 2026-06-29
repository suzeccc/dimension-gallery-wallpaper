import { ref } from 'vue'
import { readStorage, writeStorage } from '../utils/storage.js'

const KEY = 'moe-wallpaper-history'

function readHistory() {
  const value = readStorage(KEY, [])
  return Array.isArray(value) ? value : []
}

const history = ref(readHistory())

function persist(items) {
  history.value = items
  writeStorage(KEY, items)
}

export function useHistory() {
  function addHistory(wallpaper) {
    if (!wallpaper?.url) return
    persist([wallpaper, ...history.value.filter(item => item.url !== wallpaper.url)].slice(0, 100))
  }

  function clearHistory() {
    persist([])
  }

  return { history, addHistory, clearHistory }
}
