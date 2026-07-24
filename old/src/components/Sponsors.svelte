<script>
  import { fly } from 'svelte/transition'
  import { alipayQrCode, donors } from '../data/sponsors.js'

  let { onBack = () => {} } = $props()

  const hasDonors = $derived(donors.length > 0)
</script>

<div class="sponsors-page">
  <div class="top-bar">
    <button class="back-btn" onclick={onBack} aria-label="返回首页">
      <i class="fa-solid fa-arrow-left"></i>
      <span>返回</span>
    </button>
    <div class="page-title">
      <h1>赞赏支持</h1>
      <p>如果这个项目对你有帮助，请我喝杯咖啡吧</p>
    </div>
  </div>

  <div class="grid">
    <!-- 收款码卡片 -->
    <section class="card qr-card">
      <div class="card-head">
        <span class="card-title"><i class="fa-brands fa-alipay" style="color:#1677FF"></i> 支付宝扫码赞助</span>
      </div>
      <div class="qr-body">
        <div class="qr-frame">
          <img src={alipayQrCode} alt="支付宝收款码" class="qr-img" />
        </div>
        <p class="qr-hint">打开支付宝「扫一扫」即可完成打赏</p>
      </div>
    </section>

    <!-- 捐赠名单卡片 -->
    <section class="card donors-card">
      <div class="card-head">
        <span class="card-title"><i class="fa-solid fa-heart" style="color:#ff6b81"></i> 感谢每一位支持者</span>
        <span class="donor-count">{donors.length} 人</span>
      </div>

      {#if hasDonors}
        <div class="donor-list">
          {#each donors as donor, i}
            <div class="donor-item" transition:fly={{ y: 12, delay: i * 60, duration: 300 }}>
              <div class="donor-avatar">
                {donor.name.charAt(0)}
              </div>
              <div class="donor-info">
                <div class="donor-name">{donor.name}</div>
                {#if donor.message}
                  <div class="donor-msg">"{donor.message}"</div>
                {/if}
              </div>
              <div class="donor-amount">
                <i class="fa-solid fa-yen-sign"></i> {donor.amount}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-regular fa-face-smile-beam"></i></div>
          <p class="empty-text">暂无捐赠记录</p>
          <p class="empty-sub">成为第一位赞赏者吧~</p>
        </div>
      {/if}
    </section>
  </div>

  <footer class="sponsors-footer">用心做产品，感谢每一份支持</footer>
</div>

<style>
  .sponsors-page {
    position: relative;
    z-index: 2;
    max-width: 880px;
    margin: 0 auto;
    padding: 56px 20px 40px;
    min-height: 100vh;
    animation: fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .top-bar {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 14px;
    background-color: #111111;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #dddddd;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    font-family: inherit;
  }

  .back-btn:hover {
    background-color: #222222;
    border-color: #666666;
    color: #ffffff;
    transform: scale(1.05);
  }

  .page-title h1 {
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .page-title p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    margin-top: 4px;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .card-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .card-title i {
    font-size: 14px;
  }

  /* ---- 收款码区域 ---- */
  .qr-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .qr-frame {
    width: 240px;
    height: 240px;
    border-radius: 14px;
    overflow: hidden;
    background-color: #ffffff;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .qr-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    text-align: center;
  }

  /* ---- 捐赠名单区域 ---- */
  .donor-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
  }

  .donor-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 480px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .donor-list::-webkit-scrollbar {
    width: 4px;
  }

  .donor-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .donor-list::-webkit-scrollbar-thumb {
    background-color: #3a3a3a;
    border-radius: 4px;
  }

  .donor-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background-color: rgba(17, 17, 17, 0.4);
    border: 1px solid #232323;
    border-radius: 12px;
    transition: all 0.22s ease;
  }

  .donor-item:hover {
    border-color: #3a3a3a;
    background-color: rgba(30, 30, 30, 0.5);
    transform: translateX(3px);
  }

  .donor-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3a7bd5, #00d2ff);
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .donor-info {
    flex: 1;
    min-width: 0;
  }

  .donor-name {
    font-size: 14px;
    font-weight: 600;
    color: #eeeeee;
  }

  .donor-msg {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .donor-amount {
    font-size: 14px;
    font-weight: 700;
    color: #f5c842;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .donor-amount i {
    font-size: 11px;
    margin-right: 1px;
  }

  /* ---- 空状态 ---- */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 36px 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 42px;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px;
  }

  .empty-sub {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);
  }

  /* ---- 底部 ---- */
  .sponsors-footer {
    text-align: center;
    color: #555555;
    font-size: 13px;
    margin-top: 30px;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 720px) {
    .sponsors-page {
      padding: 40px 16px 30px;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .page-title h1 {
      font-size: 22px;
    }

    .top-bar {
      flex-direction: column;
      gap: 12px;
    }

    .qr-frame {
      width: 200px;
      height: 200px;
    }
  }
</style>
