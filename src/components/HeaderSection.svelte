<script>
  import { onMount, onDestroy } from 'svelte'

  // 个人信息配置 - 预留替换接口
  export let avatarUrl = '/avatar.webp'
  export let name = 'Flygeon'
  export let cherryEnabled = true
  export let onToggleCherry = () => {}
  export let isDarkMode = true
  export let onToggleTheme = () => {}
  export let musicVisible = true
  export let onToggleMusic = () => {}

  // 打字机标语列表
  const taglines = [
    '音无结弦之时，悦动天使之心',
    '立于浮华之世，奏响天籁之音',
    '我喜欢你'
  ]

  let displayText = ''
  let cursorVisible = true
  let taglineIndex = 0
  let charIndex = 0
  let isDeleting = false
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

  // 设置面板
  let showSettings = false

  function toggleSettings() {
    showSettings = !showSettings
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

  <p class="tagline">
    {displayText}<span class="cursor" class:blink={cursorVisible}>|</span>
  </p>
</section>

<!-- 右上角按钮组 -->
<div class="top-btns">
  <button class="theme-btn" on:click={onToggleTheme} aria-label={isDarkMode ? '切换浅色模式' : '切换深色模式'}>
    <i class="fa-solid fa-{isDarkMode ? 'sun' : 'moon'}"></i>
  </button>
  <button class="settings-btn" on:click={toggleSettings} aria-label="设置">
    <i class="fa-solid fa-gear"></i>
  </button>
</div>

<!-- 设置面板 -->
{#if showSettings}
  <div
    class="settings-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="设置面板"
    tabindex="-1"
    on:click={closeSettings}
    on:keydown={(e) => e.key === 'Escape' && toggleSettings()}
  >
    <div class="settings-panel">
      <div class="settings-header">
        <span>设置</span>
        <button class="settings-close" on:click={toggleSettings} aria-label="关闭设置">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="settings-item">
        <span class="settings-label">樱花特效</span>
        <button
          class="toggle-switch"
          class:active={cherryEnabled}
          on:click={onToggleCherry}
          role="switch"
          aria-checked={cherryEnabled}
          aria-label="切换樱花特效"
        >
          <span class="toggle-knob"></span>
        </button>
      </div>
      <div class="settings-item">
        <span class="settings-label">音乐播放器</span>
        <button
          class="toggle-switch"
          class:active={musicVisible}
          on:click={onToggleMusic}
          role="switch"
          aria-checked={musicVisible}
          aria-label="切换音乐播放器"
        >
          <span class="toggle-knob"></span>
        </button>
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

  /* 设置面板 */
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

  /* 开关按钮 */
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

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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
