import { ref } from 'vue'
import { readStorage, writeStorage } from '../utils/storage.js'

const KEY = 'moe-wallpaper-favorites'

function readFavorites() {
  const value = readStorage(KEY, [])
  return Array.isArray(value) ? value : []
}

const favorites = ref(readFavorites())

function persist(items) {
  favorites.value = items
  writeStorage(KEY, items)
}

export function useFavorites() {
  function isFavorite(url) {
    return favorites.value.some(item => item.url === url)
  }

  function toggleFavorite(wallpaper) {
    if (!wallpaper?.url) return favorites.value
    if (isFavorite(wallpaper.url)) {
      persist(favorites.value.filter(item => item.url !== wallpaper.url))
    } else {
      persist([wallpaper, ...favorites.value.filter(item => item.url !== wallpaper.url)])
    }
    return favorites.value
  }

  function removeFavorite(url) {
    persist(favorites.value.filter(item => item.url !== url))
  }

  function clearFavorites() {
    persist([])
  }

  function reloadFavorites() {
    favorites.value = readFavorites()
  }

  return { favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites, reloadFavorites }
}
