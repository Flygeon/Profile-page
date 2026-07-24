<script>

  export let onNavigate = (link) => {
    if (typeof window !== 'undefined' && link?.url) {
      window.location.assign(link.url)
    }
  }

  export let onInternalNavigate = (path) => {
    if (typeof window !== 'undefined' && path) {
      window.location.assign(path)
    }
  }

  const toolLinks = [
    {
      name: '图片转换',
      icon: 'fa-solid fa-arrow-right-arrow-left',
      route: '/convert/'
    },
    {
      name: '赞赏支持',
      icon: 'fa-solid fa-heart',
      route: '/sponsors/'
    },
    {
      name: 'Markdown',
      icon: 'fa-brands fa-markdown',
      route: '/md/'
    },
    {
      name: '随机抽签',
      icon: 'fa-solid fa-dice',
      route: '/lottery/'
    },
    {
      name: '文本加密',
      icon: 'fa-solid fa-lock',
      route: '/cipher/'
    },
    {
      name: '博客',
      icon: 'fa-solid fa-blog',
      url: 'https://flygeon.top'
    },
    {
      name: '封面图制作',
      icon: 'fa-solid fa-image',
      url: 'https://cover.flygeon.top'
    },
    {
      name: '云盘',
      icon: 'fa-solid fa-cloud',
      url: 'https://pan.flygeon.top'
    },
    {
      name: '站点统计',
      icon: 'fa-solid fa-chart-line',
      url: 'https://umami.flygeon.eu.org/share/61uicytMJIblYLpB'
    }
  ]
</script>

<section class="tool-section">
  <div class="card">
    <div class="buttons-container">
      {#each toolLinks as link}
        <button
          type="button"
          class="tool-button"
          onclick={() => (link.route ? onInternalNavigate(link.route) : onNavigate(link))}
          aria-label={`打开 ${link.name}`}
        >
          <i class={link.icon}></i>
          <span>{link.name}</span>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .tool-section {
    width: 100%;
  }

  .card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .buttons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .tool-button {
    display: flex;
    align-items: center;
    gap: 7px;
    height: 38px;
    padding: 0 16px;
    background-color: #111111;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #dddddd;
    text-decoration: none;
    font-size: 13px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    white-space: nowrap;
    position: relative;
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }

  .tool-button:hover {
    background-color: #222222;
    border-color: #666666;
    color: #ffffff;
    transform: scale(1.06);
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.06);
  }

  .tool-button:active {
    transform: scale(0.97);
    box-shadow: 0 1px 4px rgba(255, 255, 255, 0.03);
  }

  .tool-button i {
    font-size: 14px;
    opacity: 0.85;
    transition: opacity 0.25s ease-in-out;
  }

  .tool-button:hover i {
    opacity: 1;
  }

  @media (hover: none) and (pointer: coarse) {
    .tool-button:active {
      background-color: #2a2a2a;
      border-color: #777777;
      color: #ffffff;
      transform: scale(0.96);
    }
  }

  @media (max-width: 768px) {
    .card {
      padding: 14px;
    }

    .buttons-container {
      gap: 8px;
    }

    .tool-button {
      height: 34px;
      padding: 0 13px;
      font-size: 12px;
    }
  }
</style>
