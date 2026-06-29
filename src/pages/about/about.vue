<template>
  <view class="about-page">
    <button class="back" @tap="uni.navigateBack()">返回</button>
    <view class="panel">
      <text class="title">次元绘境</text>
      <text>Dimension Gallery</text>
      <text>本应用仅用于学习与展示。</text>
      <text>图片来源于公开随机图片 API，版权归原作者或来源网站所有。</text>
      <text>第三方 API 不保证长期可用，请勿高频请求或用于非法用途。</text>
      <text>下载和保存图片请遵守原作者或来源网站版权要求。</text>
    </view>
  </view>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  padding: 32rpx 28rpx;
  background: #030712;
  color: #f8fbff;
}

.back {
  margin: 0 0 24rpx;
  border: 0;
  border-radius: 999px;
  background: rgba(121, 169, 255, 0.26);
  color: #f8fbff;
}

button::after {
  border: 0;
}

.panel {
  display: grid;
  gap: 20rpx;
  padding: 34rpx;
  border: 1px solid rgba(180, 202, 230, 0.18);
  border-radius: 36rpx;
  background: rgba(15, 23, 42, 0.72);
  color: rgba(213, 226, 242, 0.82);
}

.title {
  color: #f8fbff;
  font-size: 44rpx;
  font-weight: 900;
}
</style>
