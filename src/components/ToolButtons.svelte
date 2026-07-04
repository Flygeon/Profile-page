<script>
  // 在线工具配置
  const toolLinks = [
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
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          class="tool-button"
        >
          <i class={link.icon}></i>
          <span>{link.name}</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .tool-section {
    width: 100%;
  }

  .card {
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px;
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
