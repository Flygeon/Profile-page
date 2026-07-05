<script>
  // 社交链接配置
  const socialLinks = [
    {
      name: 'B站',
      icon: 'fa-brands fa-bilibili',
      url: 'https://space.bilibili.com/497846789'
    },
    {
      name: 'QQ',
      icon: 'fa-brands fa-qq',
      url: 'https://wpa.qq.com/msgrd?v=3&uin=123456789'
    },
    {
      name: 'Github',
      icon: 'fa-brands fa-github',
      url: 'https://github.com/flygeon'
    }
  ]
</script>

<section class="social-section">
  <div class="card">
    <div class="buttons-container">
      {#each socialLinks as link}
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          class="social-button"
        >
          <i class={link.icon}></i>
          <span>{link.name}</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .social-section {
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

  .social-button {
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
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }

  .social-button:hover {
    background-color: #222222;
    border-color: #666666;
    color: #ffffff;
    transform: scale(1.06);
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.06);
  }

  .social-button:active {
    transform: scale(0.97);
    box-shadow: 0 1px 4px rgba(255, 255, 255, 0.03);
  }

  .social-button i {
    font-size: 14px;
    opacity: 0.85;
    transition: opacity 0.25s ease-in-out;
  }

  .social-button:hover i {
    opacity: 1;
  }

  @media (hover: none) and (pointer: coarse) {
    .social-button:active {
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

    .social-button {
      height: 34px;
      padding: 0 13px;
      font-size: 12px;
    }
  }
</style>
