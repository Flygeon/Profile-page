# CLAUDE.md

本文档为 Claude Code（claude.ai/code）在本仓库中工作时提供指导。

## 命令

```bash
npm run dev      # 启动开发服务器，端口 5173
npm run build    # 生产构建到 dist/
npm run preview  # 预览生产构建
```

## 技术栈

- **Svelte 5** 运行 runes 模式 — 使用 `$state()`、`$derived()`、`$effect()`，不能使用 `$:` 响应式声明
- **Vite 6** — 构建工具
- **Font Awesome 7** — 图标（在 `main.js` 中通过 `@fortawesome/fontawesome-free/css/all.min.css` 全局引入）
- **无 TypeScript** — 全程使用纯 JavaScript

## 核心架构

### 单页应用 —— 无路由

只有一个页面（`/`），通过 `TabSwitcher` 切换两个标签页（`projects` / `bio`），控制 `SocialButtons` + `ToolButtons` 与 `BioSection` 的显隐。

### 组件树

```
main.js — 挂载 App.svelte
App.svelte — 协调全局状态、设置持久化、特效切换、音乐播放器、链接过渡
├── Snowflakes / CherryBlossom — 粒子特效（通过 effectMode 互斥）
├── HeaderSection — 头像、打字机个性签名、设置面板
├── TabSwitcher — 项目/简介标签栏
├── SocialButtons — 社交链接（B站/QQ/Github），使用 onNavigate 属性
├── ToolButtons — 工具链接（博客/云盘等），使用 onNavigate 属性
├── BioSection — 个人简介标签内容
├── DeviceSection — 设备列表
├── SkillsSection — 技能网格
├── Timeline — RSS 博客信息流 + 静态时间线条目，支持展开/收起
├── MusicPlayer — 音乐播放器，带进度条、音量、播放模式（列表/单曲/随机）
├── ClockWidget / CalendarWidget / TodoWidget / NoticeBoard — 侧边栏小部件
├── LinkTransitionOverlay — 外部跳转前的全屏过渡动画
├── CookieConsent — GDPR 风格的同意横幅
└── Footer
```

### 状态管理

所有状态作为 `$state()` 变量存放在 `App.svelte` 中，通过 `export let` 属性传递给子组件。设置项（小部件显隐、特效模式、主题、链接过渡开关）通过 `src/lib/cookie.js` 的 `setCookie`/`getCookie` 持久化到 Cookie。

### 数据文件

`src/data/config.js` — 包含所有配置数据（JS 模块，可直接添加注释）：
- `music` — 歌曲列表（网易云 ID、标题、艺术家、封面 URL）
- `timeline` — 静态时间线条目（与 RSS 博客条目合并）
- `notices` — 公告栏内容
- `todos` — 待办事项列表
- `linkTransition` — 过渡动画配置（delayMs、particleCount、enabled）
- `skills` / `devices` — 技能与设备板块

### 链接导航与过渡

外部链接通过 `App.svelte` 中的 `handleExternalNavigate()` 处理：
1. 若 `linkTransitionEnabled` 为 false，直接 `window.location.assign()`
2. 否则显示 `LinkTransitionOverlay`，展示暗黑科技风动画，在 `delayMs` 后跳转
3. `SocialButtons` 和 `ToolButtons` 接收 `onNavigate={handleExternalNavigate}` 属性

### RSS 整合

`Timeline.svelte` 请求 `https://flygeon.top/rss.xml`，解析 RSS 2.0（带 Atom 格式降级），与静态条目按日期合并后展示。通过 `api.allorigins.win` 提供 CORS 代理降级。使用 localStorage 缓存，有效期 1 小时。

### Svelte 特有模式

- **事件处理**：使用 `onclick={handler}`（而非 `on:click`）。handler 不能为 `undefined` —— 属性默认值使用无操作（no-op）函数。
- **过渡**：模态框和遮罩层中使用 `svelte/transition` 的 `fade`、`fly`。
- **CSS**：每个组件通过 `<style>` 标签实现作用域样式。暗色主题使用 `#0a0a0a` 背景。卡片使用 `rgba(26,26,26,0.55)` 配合 `backdrop-filter: blur()`。
- **动画**：使用 CSS `@keyframes` 结合 `--i` 自定义属性实现交错入场动画。

### 注意事项
1.后续输出中不需要使用npm run build进行构建。
