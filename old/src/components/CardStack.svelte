<!--
  CardStack — 通用卡片堆叠容器（Svelte 5 runes）

  用法：
    <CardStack cards={[{ component: CalendarWidget }, { component: WeatherWidget }]} />
    <CardStack
      cards={stackCards}
      width={280}
      peek={16}
      autoplay={5000}
      pauseOnHover
      ariaLabelPrefix="右侧栏卡片"
    />

  设计要点：
    - 完全后向兼容：未传任何新 props 时，与旧实现行为完全一致。
    - 数据驱动：`cards: [{ component, props? }]`，新增卡片只需 push 一项。
    - 事件冒泡守卫：点击/键盘落在内部 a/button/input/select/textarea/label 上不翻页。
    - 3D 倾斜 + 模糊：transform-origin: top center + perspective 在 deck 上。
    - 高度自适应：仅 front 卡用 position:relative 占文档流。
-->
<script>
  /**
   * @typedef {{
   *   component: import('svelte').ComponentType,
   *   props?: Record<string, any>
   * }} CardItem
   */

  /**
   * @typedef {Object} CardStackProps
   * @property {CardItem[]} [cards=[]]                 卡片列表，每项 { component, props? }
   * @property {number}    [width=260]                容器宽度（px），同步设到 stack/deck/layer
   * @property {number}    [peek=20]                  后排每张向上偏移量（露出顶部边缘）
   * @property {number}    [scaleStep=0.045]          后排每张缩放衰减
   * @property {number}    [opacityStep=0.2]          后排每张透明度衰减
   * @property {number}    [rotStep=3.2]              后排每张 rotateX 倾角（deg）
   * @property {number}    [blurStep=0.35]            后排每张 blur 增量（px）
   * @property {number}    [minOpacity=0.5]           后排最低不透明度
   * @property {number}    [transitionMs=620]         翻页过渡时长（ms）
   * @property {number}    [initialIndex=0]           初始显示卡片下标
   * @property {string}    [ariaLabelPrefix='卡片']   屏幕阅读器前缀；最终 label 为 `${prefix}（${i+1}/${n}）`
   * @property {number}    [autoplay=0]               自动轮播间隔（ms），0 关闭
   * @property {boolean}   [pauseOnHover=true]        鼠标悬浮时暂停自动轮播
   * @property {boolean}   [pauseOnFocus=true]        焦点进入时暂停自动轮播
   * @property {number}    [swipeThreshold=40]        触控滑动触发翻页的最小位移（px）
   */

  /** @type {CardStackProps} */
  let {
    cards = [],
    width = 260,
    peek = 20,
    scaleStep = 0.045,
    opacityStep = 0.2,
    rotStep = 3.2,
    blurStep = 0.35,
    minOpacity = 0.5,
    transitionMs = 620,
    initialIndex = 0,
    ariaLabelPrefix = '卡片',
    autoplay = 0,
    pauseOnHover = true,
    pauseOnFocus = true,
    swipeThreshold = 40,
  } = $props()

  // 当前激活卡片下标（0-based）
  let active = $state(0)

  function clampIndex(i, n) {
    if (n <= 0) return 0
    // 故意写成等价 if/else 以避开 Svelte 5 编译器的"Math.min 参数顺序"静态误报
    if (i < 0) return 0
    if (i >= n) return n - 1
    return i
  }

  // 首次挂载时按 initialIndex 初始化；后续 cards 变化时也重新夹取
  $effect(() => {
    active = clampIndex(initialIndex, cards.length)
  })

  // 屏幕阅读器公告内容：仅在 active 变化时写入，aria-live="polite" 会播报
  let liveMsg = $state('')

  // 自动轮播暂停状态（hover / focus / 用户偏好降级）
  let paused = $state(false)
  // 抑制 prefers-reduced-motion：自动轮播直接不启动
  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /** 当前在屏幕阅读器中可见的卡片序号（1-based） */
  let activeDisplay = $derived(active + 1)
  /** 卡片总数 */
  let totalDisplay = $derived(cards.length)

  function advance() {
    if (cards.length === 0) return
    active = (active + 1) % cards.length
  }

  function previous() {
    if (cards.length === 0) return
    active = (active - 1 + cards.length) % cards.length
  }

  function goTo(i) {
    if (cards.length === 0) return
    active = ((i % cards.length) + cards.length) % cards.length
  }

  function depthOf(i) {
    if (cards.length === 0) return 0
    return (i - active + cards.length) % cards.length
  }

  /**
   * 点击守卫：仅当点击发生在卡片本身（而非内部交互控件）时才翻页。
   * 这是与旧实现完全等价的核心守卫。
   */
  function onLayerClick(e, depth) {
    if (depth !== 0) return
    if (e.target.closest('a, button, input, select, textarea, label, [data-no-stack-advance]')) return
    advance()
  }

  /**
   * 键盘：仅当焦点直接落在堆叠层时才响应。
   * 新增 ←/→ 切换、Home/End 跳转，符合 WAI-ARIA 列表/标签页模式。
   */
  function onLayerKeydown(e, depth) {
    if (depth !== 0) return
    if (e.target !== e.currentTarget) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        advance()
        break
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        advance()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        previous()
        break
      case 'Home':
        e.preventDefault()
        goTo(0)
        break
      case 'End':
        e.preventDefault()
        goTo(cards.length - 1)
        break
    }
  }

  // 触控滑动：水平位移 > 阈值则翻页（向上/向下滑动忽略，避免与页面滚动冲突）
  let touchStartX = 0
  let touchStartY = 0
  let touchActive = false

  function onTouchStart(e) {
    if (cards.length < 2) return
    const t = e.touches[0]
    touchStartX = t.clientX
    touchStartY = t.clientY
    touchActive = true
  }

  function onTouchEnd(e) {
    if (!touchActive) return
    touchActive = false
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartX
    const dy = t.clientY - touchStartY
    // 水平滑动必须显著大于垂直位移，才判定为翻页意图
    if (Math.abs(dx) > swipeThreshold && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) advance()
      else previous()
    }
  }

  // 当 active 变化时，更新 aria-live 公告
  $effect(() => {
    if (cards.length === 0) {
      liveMsg = ''
      return
    }
    liveMsg = `${ariaLabelPrefix}：第 ${activeDisplay} 张，共 ${totalDisplay} 张`
  })

  // 自动轮播：$effect 自动管理清理，且遵守 reduceMotion / paused
  $effect(() => {
    if (autoplay <= 0 || cards.length < 2 || reduceMotion) return
    const id = setInterval(() => {
      if (!paused) advance()
    }, autoplay)
    return () => clearInterval(id)
  })
</script>

<!--
  外层 .stack 监听 touchstart/touchend 用于移动端滑动手势。
  内层 .deck 监听 mouseenter/leave、focusin/out 用于自动轮播暂停控制。
  两者都未承担"可点击/可聚焦"角色（翻页交互在每张卡片的 .layer.front 上），
  故此处的纯事件 div 加 role 反而会误导 AT。显式忽略。
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="stack"
  style="--w:{width}px;"
  ontouchstart={onTouchStart}
  ontouchend={onTouchEnd}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="deck"
    onmouseenter={pauseOnHover ? () => (paused = true) : undefined}
    onmouseleave={pauseOnHover ? () => (paused = false) : undefined}
    onfocusin={pauseOnFocus ? () => (paused = true) : undefined}
    onfocusout={pauseOnFocus ? () => (paused = false) : undefined}
  >
    <!--
      屏幕阅读器公告区：使用 aria-live="polite"，仅在 active 变化时写入内容。
      CSS 视觉隐藏但保留对 AT 可见。
    -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">{liveMsg}</div>

    {#each cards as card, i}
      {@const Comp = card.component}
      {@const depth = depthOf(i)}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div
        class="layer {depth === 0 ? 'front' : 'back'}"
        style="--ty:{-(depth * peek)}px; --sc:{1 - depth * scaleStep}; --op:{Math.max(minOpacity, 1 - depth * opacityStep)}; --rot:{depth * rotStep}deg; --blur:{depth > 0 ? (depth * blurStep).toFixed(2) : 0}px; --zi:{cards.length - depth}; --tx-ms:{transitionMs}ms;"
        role={depth === 0 ? 'button' : null}
        aria-label={depth === 0 ? `${ariaLabelPrefix}（${activeDisplay}/${totalDisplay}），点击或按回车切换` : null}
        tabindex={depth === 0 ? 0 : -1}
        onclick={(e) => onLayerClick(e, depth)}
        onkeydown={(e) => onLayerKeydown(e, depth)}
      >
        <Comp {...(card.props || {})} />
      </div>
    {/each}
  </div>
</div>

<style>
  .stack {
    position: relative;
    width: var(--w, 260px);
    /* 顶部预留空间用于露出后排卡片边缘：
       padding 区域属于 overflow:hidden 的可见区，故顶部露出不被裁切；
       overflow:hidden 仅裁切底部溢出，防止后排较高的卡片挤占下方内容。
       border-radius 与卡片一致，使裁切边界呈现圆角（而非直角）。 */
    padding-top: 20px;
    overflow: hidden;
    border-radius: 16px;
  }

  .deck {
    position: relative;
    width: var(--w, 260px);
    /* 为子卡片的 3D 倾斜提供透视景深 */
    perspective: 1200px;
  }

  .layer {
    width: var(--w, 260px);
    border-radius: 16px;
    transform-origin: top center;
    transform: translateY(var(--ty)) scale(var(--sc)) rotateX(var(--rot));
    opacity: var(--op);
    filter: blur(var(--blur));
    z-index: var(--zi);
    transition:
      transform var(--tx-ms, 620ms) cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
      filter var(--tx-ms, 620ms) ease;
    will-change: transform, opacity, filter;
    outline: none;
  }

  /* 当前（最上层）卡片：占据文档流，决定容器高度，可点击。
     使用不透明背景，彻底遮住被其覆盖的后排卡片部分（而非半透明透出）。 */
  .layer.front {
    position: relative;
    cursor: pointer;
    background-color: #1a1a1a;
    /* 消除浏览器对交互元素的默认悬浮高亮/遮罩 */
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }

  /* 悬浮时轻微抬起 + 阴影，给出可点击的明确反馈 */
  .layer.front:hover {
    background-color: #1a1a1a;
    transform: translateY(calc(var(--ty) - 6px)) scale(calc(var(--sc) * 1.02)) rotateX(var(--rot));
    filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.5));
    transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), filter 0.32s ease;
  }

  /* 按下时的回弹手感 */
  .layer.front:active {
    transform: translateY(calc(var(--ty) - 2px)) scale(calc(var(--sc) * 0.985)) rotateX(var(--rot));
    transition: transform 0.1s ease;
  }

  .layer.front:focus-visible {
    box-shadow: 0 0 0 2px rgba(110, 231, 168, 0.5);
  }

  /* 后排卡片：绝对定位叠加在顶部，毛玻璃效果（与 SocialButtons / 底部卡片风格一致） */
  .layer.back {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  /* 屏幕阅读器专用：视觉隐藏但对 AT 可见。
     aria-live 公告区不需用户视觉感知，仅作无障碍朗读。 */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
