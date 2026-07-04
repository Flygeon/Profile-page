<script>
  import HeaderSection from './components/HeaderSection.svelte'
  import SocialButtons from './components/SocialButtons.svelte'
  import ToolButtons from './components/ToolButtons.svelte'
  import CherryBlossom from './components/CherryBlossom.svelte'
  import TabSwitcher from './components/TabSwitcher.svelte'
  import BioSection from './components/BioSection.svelte'
  import Timeline from './components/Timeline.svelte'
  import MusicPlayer from './components/MusicPlayer.svelte'

  let cherryEnabled = true
  let isDarkMode = true
  let activeTab = 'projects'
  let musicVisible = true

  function toggleCherry() {
    cherryEnabled = !cherryEnabled
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode
  }

  function toggleMusic() {
    musicVisible = !musicVisible
  }

  function handleTabChange(tab) {
    activeTab = tab
  }
</script>

<CherryBlossom enabled={cherryEnabled} />

<div class="bg-overlay" class:hidden={isDarkMode}></div>

<main>
  <div class="container">
    <HeaderSection
      cherryEnabled={cherryEnabled}
      onToggleCherry={toggleCherry}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      musicVisible={musicVisible}
      onToggleMusic={toggleMusic}
    />
    <TabSwitcher
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
    {#if activeTab === 'projects'}
      <SocialButtons />
      <ToolButtons />
      <Timeline />
    {:else}
      <BioSection />
    {/if}
  </div>
</main>

{#if musicVisible}
  <MusicPlayer />
{/if}

<footer class="footer">
  <p>© 2026 flygeon. All rights reserved.</p>
</footer>

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

  /* 浅色背景遮罩 */
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

  /* 深色模式：收缩到左上角 */
  .bg-overlay.hidden {
    clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%);
  }

  main {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 50px 20px 80px;
  }

  .container {
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
    z-index: 2;
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
