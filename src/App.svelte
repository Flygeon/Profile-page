<script>
  import HeaderSection from './components/HeaderSection.svelte'
  import SocialButtons from './components/SocialButtons.svelte'
  import ToolButtons from './components/ToolButtons.svelte'
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
  import { cardGradient } from './lib/cardGradient.js'
  import { getCookie, setCookie } from './lib/cookie.js'

  let cherryEnabled = $state(true)
  let isDarkMode = $state(true)
  let activeTab = $state('projects')
  let musicVisible = $state(true)
  
  let showClock = $state(true)
  let showNotice = $state(true)
  let showCalendar = $state(true)
  let showTodo = $state(true)

  function toggleCherry() {
    cherryEnabled = !cherryEnabled
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
  
  function saveSettings() {
    const settings = {
      cherryEnabled,
      isDarkMode,
      musicVisible,
      showClock,
      showNotice,
      showCalendar,
      showTodo
    }
    setCookie('user_settings', settings, 365)
  }
  
  function loadSettings() {
    const saved = getCookie('user_settings')
    if (saved) {
      cherryEnabled = saved.cherryEnabled ?? true
      isDarkMode = saved.isDarkMode ?? true
      musicVisible = saved.musicVisible ?? true
      showClock = saved.showClock ?? true
      showNotice = saved.showNotice ?? true
      showCalendar = saved.showCalendar ?? true
      showTodo = saved.showTodo ?? true
    }
  }
  
  import { onMount } from 'svelte'
  onMount(() => {
    loadSettings()
  })
</script>

<div class="page-wrapper" use:cardGradient>
  <CherryBlossom enabled={cherryEnabled} />
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
          cherryEnabled={cherryEnabled}
          onToggleCherry={toggleCherry}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          musicVisible={musicVisible}
          onToggleMusic={toggleMusic}
          showClock={showClock}
          showNotice={showNotice}
          showCalendar={showCalendar}
          showTodo={showTodo}
          onToggleCard={toggleCard}
        />
        <div class="entrance-item" style="animation-delay: 80ms">
          <TabSwitcher
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        {#if activeTab === 'projects'}
          <div class="entrance-item" style="animation-delay: 160ms">
            <SocialButtons />
          </div>
          <div class="entrance-item" style="animation-delay: 240ms">
            <ToolButtons />
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

  .page-wrapper::after {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(
      400px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh),
      rgba(255, 255, 255, 0.12),
      transparent 25%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .page-wrapper:hover::after {
    opacity: 1;
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
