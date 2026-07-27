# CLAUDE.md

本文档为 Claude Code（claude.ai/code）在本仓库中工作时提供指导。

## 命令

```bash
npm run dev      # 启动 Next.js 开发服务器（默认端口 3000）
npm run build    # 静态导出到 out/（output: 'export'）
npm run start    # 启动生产服务器
npm run lint     # next lint
```

> 迁移说明：本项目已从 Svelte 5 + Vite 架构迁移为 **Next.js 14（App Router）**。旧的 Svelte 代码保留在 `old/` 目录（含其独立的 CLAUDE.md），当前工作请勿改动它。

## 技术栈

- **Next.js 14.2.5** — App Router，`next.config.js` 中 `output: 'export'`，纯静态导出到 `out/`。**无服务端 / API 路由**，所有外部数据均在客户端 fetch。
- **TypeScript**（strict）— 路径别名 `@/* -> ./*`
- **React 18**
- **Tailwind CSS 3.4** + **shadcn/ui**（style `base-nova`，`components/ui/`）
- **framer-motion 11** — 全站动画
- **lucide-react** — 主图标库；品牌图标（Github/Bilibili/QQ/Rss）用 `components/BrandIcons.tsx` 内联 SVG 补充
- 深色单色美学：近黑背景 `#050505`，`darkMode: "class"`，大量 `rounded-none`、细描边、`backdrop-blur`

## 核心架构

### App Router 路由

根：`app/layout.tsx`（RootLayout，导出 `metadata` + `viewport`，`<html lang="zh-CN" class="dark">`，引入 `globals.css`，用 `ToastProvider` → `MusicProvider` 包裹 children 并挂 `ServiceWorkerRegister`）；`app/page.tsx`（`HomePage` 客户端外壳）。`app/robots.ts`、`app/sitemap.ts` 使用站点域名 `https://re.zh.kg`。`app/not-found.tsx` 为单色 404 页，`app/error.tsx` 为运行时错误边界（重试 + 回首页）。新增路由记得同步 `app/sitemap.ts`（手工维护的列表）。

> ⚠️ 静态导出坑：**不要**用动态 `app/manifest.ts`（Next 14 `output:'export'` 已知 bug，会导致构建报 `/sitemap.xml/route` + `_document` 连锁错误）。PWA manifest 用静态 `public/manifest.webmanifest`，在 layout metadata 里以 `manifest: '/manifest.webmanifest'` 引用。

各功能页为独立文件夹（工具页多含一个薄 `layout.tsx` 用于 per-page metadata）：
- `app/posts/` — 博客列表，构建期 fetch `https://flygeon.top/post.json`；交互（搜索/分类筛选）在 `features/posts/PostsExplorer.tsx`（client）
- `app/nav/` — 配置化个人导航站：编辑 `data/nav.ts`（分组/链接/图标，文件头有使用说明）即可定制并分享
- `app/guestbook/` — 留言板（giscus / GitHub Discussions）：配置在 `data/guestbook.ts`（四个参数从 giscus.app 获取），未配置时页面显示接入指引
- `app/fortune/` — 每日运势抽签
- `app/cipher/` — 文本加解密（密码 / Base64 / 兽音译者）
- `app/convert/` — 浏览器内图片格式转换（PNG/JPG/WebP）
- `app/md/` — Markdown 编辑 / 预览分栏，带实时字数统计、格式工具栏（选中包裹/行前缀）与行首 `/` 斜杠命令菜单（光标定位用 `features/md/caret.ts` 镜像 div 技术）
- `app/color/` — 颜色工具：HEX/RGB/HSL 互转 + WCAG 对比度检测
- `app/lottery/` — 随机抽奖
- `app/sponsors/` — 赞助者 + 支付宝二维码

### 首页结构

`app/page.tsx` 已解耦为轻量编排组件（约 150 行），首页 UI 拆到 `features/home/*`：
- `HomeHeader.tsx`（桌面导航 + 音乐/工具下拉，下拉支持键盘 focus 展开 / Esc 关闭）、`MobileNav.tsx`（移动抽屉）
- `MusicControls.tsx` — 桌面下拉与移动抽屉**共用**的音乐控制块（`compact` / `card` 变体）
- `CommandPalette.tsx` — 全局命令面板（`⌘K`/`Ctrl+K`），聚合导航/工具/探索 + 动作（复制本页链接、切换深浅色、赞助、设置）
- `HomeHero.tsx`、`HomeContent.tsx`（工具网格、探索、小部件网格、时间线）、`HomeEffects.tsx`（特效选择器）、`HomeSettingsDialog.tsx`
- `home-data.ts` — `navItems`、`toolItems`、`exploreItems`、`homeTags`（新增工具项在此登记，命令面板与工具下拉会自动收录）

### 组件（`components/`）

- **特效**（通过 `effectMode` 互斥）：`FibonacciSpiral.tsx`（Canvas2D，dynamic import ssr:false）、`Snowflakes.tsx`、`CherryBlossom.tsx`
- **音乐**：`MusicPlayer.tsx` — forwardRef 播放器，经 Meting API（`https://meting.mikus.ink/api?server=netease`）加载网易云歌单，双语 LRC 歌词，列表 / 单曲 / 随机模式；暴露 `MusicPlayerHandle` / `MusicPlayerState`。播放索引/模式/进度持久化到 localStorage（`music_index`/`music_mode`/`music_time`），刷新后恢复（暂停态，不自动播放）
- **小部件**：`ClockWidget`、`CalendarWidget`、`TodoWidget`、`NoticeBoard`、`SayingWidget`（fetch `uapis.cn/api/v1/saying`）、`WeatherWidget`（fetch `uapis.cn/api/v1/misc/weather`）、`FortuneWidget`
- **链接与过渡**：`SocialButtons.tsx` / `ToolButtons.tsx`（接收 `onNavigate`）、`LinkTransitionOverlay.tsx`（外链跳转前全屏动画）
- 其他：`ScrollReveal.tsx`（滚动进出场淡入/模糊）、`CookieConsent.tsx`、`Footer.tsx`（含 RSS 链接 `flygeon.top/rss.xml`）、`BioSection.tsx`、`Timeline.tsx`（静态数据，非 fetch）、`BrandIcons.tsx`、`Skeleton.tsx`（加载占位）
- **shadcn/ui**（`components/ui/`）：`button, card, dialog, tabs, switch, slider, checkbox`

### 全局 Provider（`features/*`，挂在根布局）

- `features/music/MusicProvider.tsx` — 常驻挂载 `MusicPlayer`，经 Context 暴露 `{ musicState, playerRef, currentNavSong }`；因 layout 跨路由不卸载，**切到工具页音乐持续播放**。页面用 `useMusic()` 读取。
- `features/toast/ToastProvider.tsx` — 全局轻提示，`useToast()` 触发，统一样式（各工具页勿再自造 toast）。
- `features/pwa/ServiceWorkerRegister.tsx` — 仅生产环境注册 `public/sw.js`（同源应用外壳缓存 + 离线兜底；跨域的音乐/天气/封面走网络）。

### 数据 / 配置 / 工具库

- `data/config.ts` — 中心配置：`music[]`（网易云 ID）、`timeline[]`、`notices[]`、`todos[]`、`linkTransition{enabled,delayMs,particleCount}`、`fortune`、`devices`、`skills`，含 TS 接口与 `SITE_START`
- `data/sponsors.ts` — `Donor` 接口、`donors[]`、`alipayQrCode`
- `lib/utils.ts` — `cn()`（clsx + tailwind-merge）
- `lib/cookie.ts` — `setCookie/getCookie/deleteCookie/hasCookie`
- `lib/storage.ts` — `Settings` 接口与默认值、`getSettings/saveSettings`（Cookie key `user_settings`，365 天，SameSite=Lax），及通用 `getLocalStorage/setLocalStorage`

### 状态与持久化

页面状态主要用 React hooks 局部管理并逐层传 props；跨路由常驻的音乐与全局 Toast 用 Context（`MusicProvider` / `ToastProvider`，见上）。用户设置经 `lib/storage`（Cookie `user_settings`）持久化；`saveSettings` 会派发 `SETTINGS_EVENT` 全局事件——挂在根布局、够不到首页 state 的组件（`ClickEffect`、`Live2DWidget`）借此响应设置面板开关（`clickEffectEnabled` / `live2dEnabled`），新增此类"布局级组件的设置项"沿用该模式。设置面板为 `HomeSettingsDialog`（接收整个 `settings` + `onChange`）。`lib/storage` 亦提供 localStorage 通用读写（播放器状态、部分小部件缓存）。`app/page.tsx` 通过切换 `html.light` 类实现浅色模式（默认深色）。

### 样式

- `tailwind.config.js` — content globs 含 `./features/**`；`darkMode: "class"`；自定义颜色（`background #050505`、`dark.*`、`neon.*` 灰阶）与动画（entrance/shimmer/float/pulse-glow/grid-dots）
- `postcss.config.js` — tailwindcss + autoprefixer
- `app/globals.css` — 全局样式 / CSS 变量
- `components.json` — shadcn 配置（style `base-nova`，rsc/tsx true，baseColor neutral，iconLibrary lucide，别名 `@/components`、`@/lib/utils`、`@/components/ui`）

### 动效与性能约定

写动画/特效时遵循以下约定（均已在现有代码落实，新代码保持一致）：

- **Canvas 粒子特效**：`requestAnimationFrame` 的 id 必须保存并在 useEffect cleanup 中 `cancelAnimationFrame`（否则切换特效会叠加泄漏的死循环）。帧循环内不要新建对象（如 `CanvasGradient`）——只依赖初始参数的对象在初始化时创建并缓存（见 `CherryBlossom.tsx`）。
- **逐帧动画只用 opacity/transform**（合成器友好）：滚动联动禁止逐帧 `filter: blur()`（整层重绘，`ScrollReveal.tsx` 已移除）；无限循环动画禁止改 `height`/`width`（布局重排），用 `scaleY` + `origin-*` 代替（见 HomeHeader 播放跳动条）。
- **`prefers-reduced-motion`**：粒子特效（`HomeEffects` 用 framer 的 `useReducedMotion` 统一拦截，返回 null）与滚动动效（`ScrollReveal` 退化为静态 div）都须尊重该系统设置。
- **音频进度**：用原生 `timeupdate` 事件（约 4Hz、暂停时零开销），不要用 `setInterval` 轮询。
- **Web Audio 频谱**：`MusicPlayer` 以 CORS 渐进增强接入 `AnalyserNode`——audio 先带 `crossOrigin="anonymous"` 加载，onError 且未建图时判定音源不支持 CORS，摘掉属性重载并永不建图（`corsBlocked`）。**切勿**在未确认 CORS 前调用 `createMediaElementSource`（失败会静音整条播放链路）。频谱经 handle 的 `getAnalyser()` 暴露，`SpectrumCanvas` 消费（降级时画静态占位条）。
- **点击特效**：`components/ClickEffect.tsx` 全局挂载（根布局），粒子耗尽即停 rAF。
- **彩蛋**：`components/KonamiEgg.tsx` 全局监听 ↑↑↓↓←→←→BA（输入框内不触发），复用 `CherryBlossom` 做 10 秒全屏樱吹雪（父层 `isolate` 提升层叠上下文）；reduced-motion 时只弹 Toast。
- **Live2D 看板娘（框架，默认关闭）**：配置 `data/live2d.ts`（文件头有接入步骤），`components/Live2DWidget.tsx` 经 `new Function('u','return import(u)')` 从 CDN 动态加载 oh-my-live2d 运行时（绕过打包器、enabled=false 零开销），禁用其自带 UI，由组件自研菜单（打招呼/换模型/收起）接管；收起状态存 localStorage `live2d_hidden`。
- 待办优化（未做）：framer-motion 换 `LazyMotion`+`m` 可再减约 20 kB 首屏 JS，但需全站改写 `motion.` 引用；雪花画布未做 DPR 适配（高分屏略糊）。

### 外部数据一览（均客户端 fetch，静态导出无后端）

- 博客文章：`https://flygeon.top/post.json`
- 音乐：Meting API `https://meting.mikus.ink/api?server=netease`（歌单 + url + lrc）
- 天气 / 一言：`uapis.cn`
- 图片域名白名单：`next.config.js` 的 `remotePatterns` 放行 `p1/p2.music.126.net`（专辑封面），`images.unoptimized: true`

## 注意事项

1. 后续输出中一般不需要 `npm run build`；但改动 layout / metadata 路由 / service worker 时建议真跑一次 `next build` 验证静态导出（部分 bug 只在导出阶段暴露）。
2. `old/` 是迁移前的 Svelte 项目，仅作存档，勿在其上工作。
3. 图标统一用 lucide-react；品牌图标（Github/Bilibili/QQ/Rss）用 `components/BrandIcons.tsx` 内联 SVG。Font Awesome 依赖已移除。
4. `components/ToolButtons.tsx` / `SocialButtons.tsx` 为迁移遗留，当前首页与 Footer 未渲染它们。
