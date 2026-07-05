<script>
  import DeviceSection from './DeviceSection.svelte'
  import SkillsSection from './SkillsSection.svelte'
  import { cardGradient } from '../lib/cardGradient.js'

  let subTab = $state('intro')

  const subTabs = [
    { key: 'intro', label: '自我介绍' },
    { key: 'devices', label: '我的设备' },
    { key: 'skills', label: '我的能力' },
  ]

  function activeIndex() {
    return subTabs.findIndex(t => t.key === subTab)
  }
</script>

<section class="bio-section">
  <div class="sub-tab-switcher">
    <div class="sub-tab-track">
      {#each subTabs as tab}
        <button
          class="sub-tab-btn"
          class:active={subTab === tab.key}
          onclick={() => subTab = tab.key}
        >
          {tab.label}
        </button>
      {/each}
      <div
        class="sub-tab-indicator"
        style="transform: translateX({activeIndex() * 100}%)"
      ></div>
    </div>
  </div>

  {#if subTab === 'intro'}
    <div class="tab-content">
      <div class="card">
        <div class="bio-content">
          <p class="bio-text">
            你好，这里是 Flygeon 的个人页喵，通过这个站点可以导航到我的各种项目喵。
          </p>
          <p class="bio-text">
            喜欢折腾各种有趣的东西，会做些大家想看的东西。
            其实我会的东西应该还是蛮多的，只是都不是很精通罢了（（
            </p>
          <p class="bio-text">  
            会玩mmd、术力口调教、混音、剪辑啥的，会一点前端，不过都是很基础的东西，没什么值得炫耀的，而且大部分东西都是ai写的，我只是ai的代理人罢了。
            而且说实话我现实中朋友不是特别多，其实很多时间都是自己瞎琢磨东西，想要来认识我我还是会很开心的，欢迎加我的qq：2972632024.qwq
          </p>
          <div class="bio-tags">
            <span class="tag">前端开发</span>
            <span class="tag">Vibe Coding</span>
            <span class="tag">全栈项目</span>
            <span class="tag">懒癌晚期</span>
          </div>
        </div>
      </div>
    </div>
  {:else if subTab === 'devices'}
    <div class="tab-content">
      <DeviceSection />
    </div>
  {:else if subTab === 'skills'}
    <div class="tab-content">
      <SkillsSection />
    </div>
  {/if}
</section>

<style>
  .bio-section {
    width: 100%;
  }

  .card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 24px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .bio-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .bio-text {
    font-size: 14px;
    line-height: 1.8;
    color: #cccccc;
    margin: 0;
  }

  .bio-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .tag {
    display: inline-block;
    padding: 5px 14px;
    background-color: #111111;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #aaaaaa;
    font-size: 12px;
    transition: all 0.25s ease-in-out;
  }

  .tag:hover {
    background-color: #222222;
    border-color: #555555;
    color: #ffffff;
  }

  /* 子选项卡 */
  .sub-tab-switcher {
    width: 100%;
    margin-bottom: 16px;
  }

  .sub-tab-track {
    position: relative;
    display: flex;
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 14px;
    padding: 4px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .sub-tab-btn {
    flex: 1;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 10px;
    color: #888888;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s ease-in-out;
    position: relative;
    z-index: 1;
    padding: 0;
  }

  .sub-tab-btn.active {
    color: #ffffff;
  }

  .sub-tab-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(100% / 3 - 4px);
    height: calc(100% - 8px);
    background-color: #2a2a2a;
    border-radius: 10px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .tab-content {
    animation: fadeSlideIn 0.3s ease;
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .card {
      padding: 18px;
    }

    .bio-text {
      font-size: 13px;
    }

    .tag {
      padding: 4px 12px;
      font-size: 11px;
    }

    .sub-tab-btn {
      height: 32px;
      font-size: 12px;
    }
  }
</style>
