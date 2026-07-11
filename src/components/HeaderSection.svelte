<script>
  import { onMount, onDestroy } from 'svelte'

  let {
    avatarUrl = '/avatar.webp',
    name = 'Flygeon',
    effectMode = 'snow',
    onSetEffectMode = () => {},
    isDarkMode = true,
    onToggleTheme = () => {},
    musicVisible = true,
    onToggleMusic = () => {},
    showClock = true,
    showNotice = true,
    showCalendar = true,
    showTodo = true,
    onToggleCard = () => {},
    linkTransitionEnabled = true,
    onToggleLinkTransition = () => {}
  } = $props()

  const greetings = [
    { range: [0, 5],  icon: '🌙', text: '夜深了，早点休息' },
    { range: [5, 8],  icon: '🌅', text: '早上好，新的一天' },
    { range: [8, 12], icon: '☀️', text: '上午好，元气满满' },
    { range: [12, 14], icon: '🌤️', text: '中午好，记得吃饭' },
    { range: [14, 18], icon: '☀️', text: '下午好，继续加油' },
    { range: [18, 21], icon: '🌆', text: '傍晚好，放松一下' },
    { range: [21, 24], icon: '🌙', text: '晚上好，享受夜晚' }
  ]

  function getGreeting() {
    const hour = new Date().getHours()
    return greetings.find(g => hour >= g.range[0] && hour < g.range[1]) || greetings[0]
  }

  let greeting = $derived(getGreeting())

  const taglines = [
    '音无结弦之时，悦动天使之心',
    '立于浮华之世，奏响天籁之音',
    '我喜欢你'
  ]

  let displayText = $state('')
  let cursorVisible = $state(true)
  let taglineIndex = $state(0)
  let charIndex = $state(0)
  let isDeleting = $state(false)
  let timer = null

  const TYPE_SPEED = 120
  const DELETE_SPEED = 60
  const PAUSE_AFTER_TYPE = 2000
  const PAUSE_AFTER_DELETE = 400

  function typeLoop() {
    const current = taglines[taglineIndex]

    if (!isDeleting) {
      if (charIndex < current.length) {
        displayText = current.slice(0, charIndex + 1)
        charIndex++
        timer = setTimeout(typeLoop, TYPE_SPEED)
      } else {
        isDeleting = true
        timer = setTimeout(typeLoop, PAUSE_AFTER_TYPE)
      }
    } else {
      if (charIndex > 0) {
        displayText = current.slice(0, charIndex - 1)
        charIndex--
        timer = setTimeout(typeLoop, DELETE_SPEED)
      } else {
        isDeleting = false
        taglineIndex = (taglineIndex + 1) % taglines.length
        timer = setTimeout(typeLoop, PAUSE_AFTER_DELETE)
      }
    }
  }

  let cursorTimer = null
  function blinkCursor() {
    cursorTimer = setInterval(() => {
      cursorVisible = !cursorVisible
    }, 530)
  }

  onMount(() => {
    typeLoop()
    blinkCursor()
  })

  onDestroy(() => {
    clearTimeout(timer)
    clearInterval(cursorTimer)
  })

  let showSettings = $state(false)
  let effectDropdownOpen = $state(false)

  const effectOptions = [
    { value: 'sakura', label: '樱花', icon: '🌸' },
    { value: 'snow', label: '雪花', icon: '❄️' },
    { value: 'none', label: '关闭', icon: '🚫' },
  ]

  let currentEffect = $derived(effectOptions.find(o => o.value === effectMode) || effectOptions[1])

  function toggleSettings() {
    showSettings = !showSettings
    if (!showSettings) effectDropdownOpen = false
  }

  function closeSettings(e) {
    if (e.target === e.currentTarget) {
      showSettings = false
    }
  }
</script>

<section class="header-section">
  <div class="avatar-wrapper">
    <img src={avatarUrl} alt="头像" class="avatar" />
  </div>

  <h1 class="name">{name}</h1>

  <p class="greeting">
    <span class="greeting-icon">{greeting.icon}</span>
    {greeting.text}
  </p>

  <p class="tagline">
    {displayText}<span class="cursor" class:blink={cursorVisible}>|</span>
  </p>
</section>

<div class="top-btns">
  <button class="theme-btn" onclick={onToggleTheme} aria-label={isDarkMode ? '切换浅色模式' : '切换深色模式'}>
    <i class="fa-solid fa-{isDarkMode ? 'sun' : 'moon'}"></i>
  </button>
  <button class="settings-btn" onclick={toggleSettings} aria-label="设置">
    <i class="fa-solid fa-gear"></i>
  </button>
</div>

{#if showSettings}
  <div
    class="settings-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="设置面板"
    tabindex="-1"
    onclick={closeSettings}
    onkeydown={(e) => e.key === 'Escape' && toggleSettings()}
  >
    <div class="settings-panel">
      <div class="settings-header">
        <span>设置</span>
        <button class="settings-close" onclick={toggleSettings} aria-label="关闭设置">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div class="settings-section">
        <div class="settings-section-title">视觉效果</div>
        <div class="settings-item">
          <span class="settings-label">飘落特效</span>
          <div class="select-trigger" tabindex="0" role="combobox" aria-expanded={effectDropdownOpen} aria-label="选择飘落特效"
            onclick={() => effectDropdownOpen = !effectDropdownOpen}
            onkeydown={(e) => e.key === 'Enter' && (effectDropdownOpen = !effectDropdownOpen)}
            onmouseleave={() => effectDropdownOpen = false}>
            <span class="select-trigger-value">
              <span class="select-item-icon">{currentEffect.icon}</span>
              {currentEffect.label}
            </span>
            <span class="select-arrow" class:open={effectDropdownOpen}>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
            {#if effectDropdownOpen}
              <div class="select-dropdown" onclick={(e) => e.stopPropagation()}>
                {#each effectOptions as opt}
                  <button
                    class="select-item"
                    class:selected={effectMode === opt.value}
                    onclick={() => { onSetEffectMode(opt.value); effectDropdownOpen = false; }}
                  >
                    <span class="select-item-icon">{opt.icon}</span>
                    {opt.label}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        <div class="settings-item">
          <span class="settings-label">音乐播放器</span>
          <button
            class="toggle-switch"
            class:active={musicVisible}
            onclick={onToggleMusic}
            role="switch"
            aria-checked={musicVisible}
            aria-label="切换音乐播放器"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>
        <div class="settings-item">
          <span class="settings-label">跳转过渡</span>
          <button
            class="toggle-switch"
            class:active={linkTransitionEnabled}
            onclick={onToggleLinkTransition}
            role="switch"
            aria-checked={linkTransitionEnabled}
            aria-label="切换跳转过渡动画"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>
      </div>
      
      <div class="settings-section">
        <div class="settings-section-title">侧边卡片</div>
        <div class="settings-item">
          <span class="settings-label">时间显示</span>
          <button
            class="toggle-switch"
            class:active={showClock}
            onclick={() => onToggleCard('clock')}
            role="switch"
            aria-checked={showClock}
            aria-label="切换时间显示"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>
        <div class="settings-item">
          <span class="settings-label">公告栏</span>
          <button
            class="toggle-switch"
            class:active={showNotice}
            onclick={() => onToggleCard('notice')}
            role="switch"
            aria-checked={showNotice}
            aria-label="切换公告栏"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>
        <div class="settings-item">
          <span class="settings-label">日历</span>
          <button
            class="toggle-switch"
            class:active={showCalendar}
            onclick={() => onToggleCard('calendar')}
            role="switch"
            aria-checked={showCalendar}
            aria-label="切换日历"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>
        <div class="settings-item">
          <span class="settings-label">待办事项</span>
          <button
            class="toggle-switch"
            class:active={showTodo}
            onclick={() => onToggleCard('todo')}
            role="switch"
            aria-checked={showTodo}
            aria-label="切换待办事项"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .header-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    animation: entrance 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .top-btns {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 50;
  }

  .theme-btn,
  .settings-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 50%;
    color: #888888;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
  }

  .theme-btn:hover,
  .settings-btn:hover {
    background-color: #2a2a2a;
    border-color: #444444;
    color: #ffffff;
  }

  .settings-btn:hover {
    transform: rotate(45deg);
  }

  .avatar-wrapper {
    display: inline-block;
  }

  .avatar {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .name {
    font-size: 34px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  .greeting {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.65);
    display: flex;
    align-items: center;
    gap: 6px;
    animation: entrance 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both;
  }

  .greeting-icon {
    font-size: 16px;
    line-height: 1;
  }

  .tagline {
    font-size: 16px;
    color: #888888;
    letter-spacing: 0.3px;
    min-height: 24px;
    display: flex;
    align-items: center;
  }

  .cursor {
    display: inline-block;
    color: #ffffff;
    font-weight: 400;
    margin-left: 2px;
    transition: opacity 0.1s;
  }

  .cursor.blink {
    opacity: 1;
  }

  .cursor:not(.blink) {
    opacity: 0;
  }

  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.2s ease-in-out;
  }

  .settings-panel {
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px;
    width: 280px;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #2a2a2a;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
  }

  .settings-close {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #888888;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease-in-out;
    font-size: 14px;
  }

  .settings-close:hover {
    background-color: #2a2a2a;
    color: #ffffff;
  }

  .settings-section {
    margin-bottom: 16px;
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .settings-section-title {
    font-size: 11px;
    color: #555555;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    padding-left: 2px;
  }

  .settings-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
  }

  .settings-label {
    font-size: 14px;
    color: #cccccc;
  }

  .toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    border: none;
    background-color: #333333;
    cursor: pointer;
    position: relative;
    transition: background-color 0.25s ease-in-out;
    padding: 0;
    flex-shrink: 0;
  }

  .toggle-switch.active {
    background-color: #ffffff;
  }

  .toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .toggle-switch.active .toggle-knob {
    transform: translateX(20px);
  }

  /* 特效下拉框选择器 */
  .select-trigger {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    min-width: 108px;
    padding: 5px 10px;
    background-color: #252525;
    border: 1px solid #333333;
    border-radius: 6px;
    color: #cccccc;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    transition: border-color 0.2s ease;
    user-select: none;
  }

  .select-trigger:hover {
    border-color: #555555;
  }

  .select-trigger-value {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .select-arrow {
    display: flex;
    align-items: center;
    font-size: 10px;
    color: #666666;
    transition: transform 0.2s ease;
  }

  .select-arrow.open {
    transform: rotate(180deg);
  }

  .select-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background-color: #1e1e1e;
    border: 1px solid #333333;
    border-radius: 6px;
    overflow: hidden;
    z-index: 10;
    animation: fadeIn 0.15s ease;
  }

  .select-item {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    padding: 6px 10px;
    border: none;
    background: none;
    color: #aaaaaa;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    text-align: left;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .select-item:hover {
    background-color: #2a2a2a;
    color: #ffffff;
  }

  .select-item.selected {
    background-color: #333333;
    color: #ffffff;
  }

  .select-item-icon {
    font-size: 14px;
    line-height: 1;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes entrance {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    .avatar {
      width: 110px;
      height: 110px;
    }

    .name {
      font-size: 28px;
    }

    .greeting {
      font-size: 13px;
    }

    .tagline {
      font-size: 14px;
    }

    .top-btns {
      top: 16px;
      right: 16px;
    }

    .theme-btn,
    .settings-btn {
      width: 32px;
      height: 32px;
      font-size: 13px;
    }

    .settings-panel {
      width: 260px;
      margin: 0 16px;
    }
  }
</style>
