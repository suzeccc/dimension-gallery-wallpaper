# 次元绘境 / Dimension Gallery

## 项目介绍

次元绘境是一个移动端优先的二次元高清壁纸 Web App / PWA。项目接入公开免费图片 API，用于浏览、分类筛选、查看详情、收藏、历史记录、复制链接、打开原图和下载辅助。项目名为 `dimension-gallery`。

本项目仅用于学习展示，不提供登录、云同步、社区、上传、支付或后台管理能力。

## 技术栈

- Vue 3
- JavaScript
- Vite
- Vue Router
- Vue Composition API 与 `<script setup>`
- 原生 CSS / CSS Variables
- vite-plugin-pwa

## 功能列表

- 首页瀑布流壁纸浏览，支持推荐、横图、竖图、AI、萌系、风景、原神、头像、夜轻分类。
- 支持刷新当前分类和加载更多，加载中、空状态、错误状态有基础提示。
- 详情页支持大图预览、来源信息、收藏/取消收藏、复制图片链接、打开原图和下载辅助。
- 收藏页使用本地收藏数据展示壁纸，并支持取消收藏、打开原图和进入详情。
- 设置页支持默认数据源、默认方向、显示 AI、安全模式等设置持久化。
- 支持清空收藏、清空历史、清空 API 缓存。
- PWA 配置已接入，构建时生成基础离线资源，不预缓存远程图片或第三方 API 响应。

## 本地运行

```bash
npm install
npm run dev
npm test
npm run build
```

构建产物输出到 `dist/`。本项目没有配置 lint script，因此当前交付不运行 `npm run lint`，也不额外引入 lint 依赖。

## API 数据源

开发环境通过 Vite dev proxy 转发第三方接口：

```txt
/alcy -> https://t.alcy.cc
/yppp -> https://api.yppp.net
```

当前数据源：

- 栗次元：优先使用 `/alcy/json?pc=12`、`/alcy/json?mp=12`、`/alcy/json?ai=12`、`/alcy/json?moe=12` 等 JSON 接口。
- 夜轻：优先使用 `/yppp/pc.php?return=all` 与 `/yppp/pe.php?return=all` 列表接口，`return=json` 只作为顺序备用请求，不做高并发滥刷。

所有第三方接口返回会在 `src/api/wallpaperApi.js` 中统一转换为项目内部 Wallpaper 数据结构。

## PWA、缓存与本地存储

- 收藏数据保存在 `localStorage` key：`moe-wallpaper-favorites`。
- 历史数据保存在 `localStorage` key：`moe-wallpaper-history`。
- 设置数据保存在 `localStorage` key：`moe-wallpaper-settings`。
- 夜轻横图列表缓存 key：`moe-wallpaper-yeqing-pc-list`。
- 夜轻竖图列表缓存 key：`moe-wallpaper-yeqing-pe-list`。
- localStorage 读取失败或 JSON 损坏时会自动恢复为空数据或默认设置，避免页面崩溃。
- PWA 图标目前按 `public/icons/README.md` 的占位说明引用，正式发布前建议替换为真实应用图标。

## 生产部署

详细部署说明见 `DEPLOY.md`。

注意：Vite dev proxy 只在开发环境可用，生产环境不会自动代理 `/alcy` 或 `/yppp`。生产部署时可以直接请求第三方 API，也可以使用 Serverless Proxy 转发请求，并保留友好的 API 失败提示。

跨域图片下载受浏览器和第三方站点策略影响，前端无法保证所有远程图片都能强制下载。下载失败时请打开原图后保存，或在生产环境使用服务端代理图片流。

## 版权声明

本应用仅用于学习展示。图片来源于公开 API，版权归原作者或来源网站所有。如有侵权，请联系删除。请不要将第三方图片描述为项目自有版权资源，不要用于非法用途，也不要高频请求免费 API。

## 已知限制

- 第三方免费 API 的稳定性、速度和可访问性不受本项目控制。
- 收藏、历史和设置仅保存在当前浏览器本地，不支持跨设备同步。
- PWA 图标仍需在正式发布前替换为真实图标。
- 跨域图片下载不保证成功。
