export function copyText(text) {
  return new Promise(resolve => {
    uni.setClipboardData({
      data: text || '',
      success: () => resolve(true),
      fail: () => resolve(false),
    })
  })
}

export function openOriginal(url) {
  if (typeof plus !== 'undefined') {
    plus.runtime.openURL(url)
    return true
  }
  return copyText(url)
}

export function downloadImage(url) {
  return new Promise(resolve => {
    uni.downloadFile({
      url,
      success: result => {
        if (result.statusCode !== 200) return resolve(false)
        uni.saveImageToPhotosAlbum({
          filePath: result.tempFilePath,
          success: () => resolve(true),
          fail: () => resolve(false),
        })
      },
      fail: () => resolve(false),
    })
  })
}

export function getImageMeta(url) {
  return new Promise(resolve => {
    uni.getImageInfo({
      src: url,
      success: info => {
        const width = Number(info.width) || 0
        const height = Number(info.height) || 0
        resolve({
          width,
          height,
          orientation: height > width ? 'portrait' : 'landscape',
        })
      },
      fail: () => resolve({ width: 0, height: 0, orientation: 'landscape' }),
    })
  })
}
