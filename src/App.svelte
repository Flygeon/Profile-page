<script>
  import HeaderSection from './components/HeaderSection.svelte'
  import SocialButtons from './components/SocialButtons.svelte'
  import ToolButtons from './components/ToolButtons.svelte'
  import LinkTransitionOverlay from './components/LinkTransitionOverlay.svelte'
  import Snowflakes from './components/Snowflakes.svelte'
  import CherryBlossom from './components/CherryBlossom.svelte'
  import TabSwitcher from './components/TabSwitcher.svelte'
  import BioSection from './components/BioSection.svelte'
  import Timeline from './components/Timeline.svelte'
  import MusicPlayer from './components/MusicPlayer.svelte'
  import ClockWidget from './components/ClockWidget.svelte'
  import NoticeBoard from './components/NoticeBoard.svelte'
  import CalendarWidget from './components/CalendarWidget.svelte'
  import TodoWidget from './components/TodoWidget.svelte'
  import CookieConsent from './components/CookieConsent.svelte'
  import { getCookie, setCookie } from './lib/cookie.js'
  import config from './data/config.js'

  // 特效模式: 'snow' | 'sakura' | 'none'
  let effectMode = $state('snow')
  let isDarkMode = $state(true)
  let activeTab = $state('projects')
  let musicVisible = $state(true)

  let showClock = $state(true)
  let showNotice = $state(true)
  let showCalendar = $state(true)
  let showTodo = $state(true)

  let linkTransitionVisible = $state(false)
  let linkTransitionTitle = $state('')
  let linkTransitionHost = $state('')
  let linkTransitionUrl = $state('')
  let linkTransitionTimer = null

  let linkTransitionEnabled = $state(config.linkTransition.enabled ?? true)
  const linkTransitionDelayMs = config.linkTransition.delayMs ?? 1000
  const linkTransitionParticleCount = config.linkTransition.particleCount ?? 24

  function setEffectMode(mode) {
    effectMode = mode
    saveSettings()
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode
    saveSettings()
  }

  function toggleMusic() {
    musicVisible = !musicVisible
    saveSettings()
  }

  function handleTabChange(tab) {
    activeTab = tab
  }
  
  function toggleCard(cardName) {
    if (cardName === 'clock') showClock = !showClock
    if (cardName === 'notice') showNotice = !showNotice
    if (cardName === 'calendar') showCalendar = !showCalendar
    if (cardName === 'todo') showTodo = !showTodo
    saveSettings()
  }

  function toggleLinkTransition() {
    linkTransitionEnabled = !linkTransitionEnabled
    saveSettings()
  }

  function getHostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

  function handleExternalNavigate(link) {
    if (!link?.url || typeof window === 'undefined') return

    if (!linkTransitionEnabled) {
      window.location.assign(link.url)
      return
    }

    if (linkTransitionVisible) return

    linkTransitionTitle = link.name || '????'
    linkTransitionHost = getHostname(link.url)
    linkTransitionUrl = link.url
    linkTransitionVisible = true

    if (linkTransitionTimer) {
      clearTimeout(linkTransitionTimer)
    }

    linkTransitionTimer = window.setTimeout(() => {
      window.location.assign(link.url)
    }, linkTransitionDelayMs)
  }

  function saveSettings() {
    const settings = {
      effectMode,
      isDarkMode,
      musicVisible,
      showClock,
      showNotice,
      showCalendar,
      showTodo,
      linkTransitionEnabled
    }
    setCookie('user_settings', settings, 365)
  }
  
  function loadSettings() {
    const saved = getCookie('user_settings')
    if (saved) {
      effectMode = saved.effectMode ?? 'snow'
      isDarkMode = saved.isDarkMode ?? true
      musicVisible = saved.musicVisible ?? true
      showClock = saved.showClock ?? true
      showNotice = saved.showNotice ?? true
      showCalendar = saved.showCalendar ?? true
      showTodo = saved.showTodo ?? true
      linkTransitionEnabled = saved.linkTransitionEnabled ?? true
    }
  }
  
  import { onMount, onDestroy } from 'svelte'
  onMount(() => {
    loadSettings()
  })

  onDestroy(() => {
    if (linkTransitionTimer) {
      clearTimeout(linkTransitionTimer)
    }
  })
</script>

<div class="page-wrapper">
  {#if effectMode === 'snow'}
    <Snowflakes enabled={true} />
  {:else if effectMode === 'sakura'}
    <CherryBlossom enabled={true} />
  {/if}
  <div class="bg-overlay" class:hidden={isDarkMode}></div>
  <CookieConsent />

  <main>
    <div class="content-wrapper">
      <div class="side-panel left-panel">
        {#if showClock}
          <ClockWidget />
        {/if}
        {#if showNotice}
          <NoticeBoard />
        {/if}
      </div>

      <div class="container">
        <HeaderSection
          effectMode={effectMode}
          onSetEffectMode={setEffectMode}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          musicVisible={musicVisible}
          onToggleMusic={toggleMusic}
          showClock={showClock}
          showNotice={showNotice}
          showCalendar={showCalendar}
          showTodo={showTodo}
          onToggleCard={toggleCard}
          linkTransitionEnabled={linkTransitionEnabled}
          onToggleLinkTransition={toggleLinkTransition}
        />
        <div class="entrance-item" style="animation-delay: 80ms">
          <TabSwitcher
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        {#if activeTab === 'projects'}
          <div class="entrance-item" style="animation-delay: 160ms">
            <SocialButtons onNavigate={handleExternalNavigate} />
          </div>
          <div class="entrance-item" style="animation-delay: 240ms">
            <ToolButtons onNavigate={handleExternalNavigate} />
          </div>
          <div class="entrance-item" style="animation-delay: 400ms">
            <Timeline />
          </div>
        {:else}
          <div class="entrance-item" style="animation-delay: 160ms">
            <BioSection />
          </div>
        {/if}
      </div>

      <div class="side-panel right-panel">
        {#if showCalendar}
          <CalendarWidget />
        {/if}
        {#if showTodo}
          <TodoWidget />
        {/if}
      </div>
    </div>
  </main>

  <LinkTransitionOverlay
    open={linkTransitionVisible}
    title={linkTransitionTitle}
    host={linkTransitionHost}
    url={linkTransitionUrl}
    delayMs={linkTransitionDelayMs}
    particleCount={linkTransitionParticleCount}
  />

  {#if musicVisible}
    <MusicPlayer />
  {/if}

  <footer class="footer">
    <p>© 2026 flygeon. All rights reserved.</p>
  </footer>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    background-color: #0a0a0a;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
                 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(.skeleton) {
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .bg-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/background.webp') center/cover no-repeat;
    z-index: 0;
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    transition: clip-path 500ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .bg-overlay::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.65);
  }

  .bg-overlay.hidden {
    clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%);
  }

  main {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 80px 20px 80px;
  }

  .content-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    width: 100%;
    max-width: 1300px;
    position: relative;
    z-index: 2;
  }

  .container {
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .page-wrapper {
    position: relative;
    min-height: 100vh;
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex-shrink: 0;
  }

  .left-panel {
    align-items: flex-start;
  }

  .right-panel {
    align-items: flex-end;
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

  .entrance-item {
    animation: entrance 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .footer {
    text-align: center;
    padding: 30px 20px 40px;
    color: #555555;
    font-size: 13px;
    position: relative;
    z-index: 2;
  }

  @media (max-width: 768px) {
    main {
      padding: 36px 16px 60px;
    }

    .container {
      gap: 20px;
    }

    .footer {
      padding: 24px 16px 30px;
      font-size: 12px;
    }
  }
</style>
