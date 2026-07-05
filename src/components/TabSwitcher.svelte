<script>
  export let activeTab = 'bio'
  export let onTabChange = (tab) => {}
</script>

<div class="tab-switcher">
  <div class="tab-track">
    <button
      class="tab-btn"
      class:active={activeTab === 'projects'}
      onclick={() => onTabChange('projects')}
    >
      我的项目
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'bio'}
      onclick={() => onTabChange('bio')}
    >
      个人简介
    </button>
    <div
      class="tab-indicator"
      class:right={activeTab === 'bio'}
    ></div>
  </div>
</div>

<style>
  .tab-switcher {
    width: 100%;
  }

  .tab-track {
    position: relative;
    display: flex;
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 4px;
  }

  .tab-btn {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 12px;
    color: #888888;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s ease-in-out;
    position: relative;
    z-index: 1;
    padding: 0;
  }

  .tab-btn.active {
    color: #ffffff;
  }

  .tab-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background-color: #2a2a2a;
    border-radius: 12px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .tab-indicator.right {
    transform: translateX(100%);
  }

  @media (max-width: 768px) {
    .tab-btn {
      height: 36px;
      font-size: 13px;
    }
  }
</style>
