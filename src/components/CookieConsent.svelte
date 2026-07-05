<script>
  import { getCookie, setCookie } from '../lib/cookie.js'
  
  let showModal = $state(false)
  
  import { onMount } from 'svelte'
  onMount(() => {
    const consent = getCookie('cookie_consent')
    if (consent === null) {
      showModal = true
    }
  })
  
  function acceptCookies() {
    setCookie('cookie_consent', { accepted: true, date: new Date().toISOString() }, 365)
    showModal = false
  }
  
  function rejectCookies() {
    setCookie('cookie_consent', { accepted: false, date: new Date().toISOString() }, 365)
    showModal = false
  }
</script>

{#if showModal}
  <div class="cookie-overlay">
    <div class="cookie-modal">
      <div class="cookie-icon">
        <i class="fa-solid fa-cookie"></i>
      </div>
      <h3 class="cookie-title">Cookie 授权</h3>
      <p class="cookie-text">
        为了提供更好的用户体验，我们会使用 Cookie 存储您的个性化设置，包括小卡片显示状态、主题偏好等。
      </p>
      <p class="cookie-detail">
        我们承诺不会收集任何个人敏感信息，所有数据仅存储在您的本地设备上，您可以随时清除或修改这些设置。
      </p>
      <div class="cookie-buttons">
        <button class="cookie-btn reject" onclick={rejectCookies}>
          拒绝
        </button>
        <button class="cookie-btn accept" onclick={acceptCookies}>
          同意
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .cookie-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  
  .cookie-modal {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 28px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .cookie-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #ffffff;
  }
  
  .cookie-title {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
  }
  
  .cookie-text {
    font-size: 14px;
    color: #cccccc;
    line-height: 1.6;
    margin-bottom: 8px;
  }
  
  .cookie-detail {
    font-size: 12px;
    color: #666666;
    line-height: 1.5;
    margin-bottom: 24px;
  }
  
  .cookie-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .cookie-btn {
    padding: 10px 24px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .cookie-btn.reject {
    background: #2a2a2a;
    color: #888888;
  }
  
  .cookie-btn.reject:hover {
    background: #333333;
    color: #ffffff;
  }
  
  .cookie-btn.accept {
    background: #ffffff;
    color: #0a0a0a;
  }
  
  .cookie-btn.accept:hover {
    background: #e0e0e0;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .cookie-modal {
      padding: 24px 20px;
      margin: 0 16px;
    }
    
    .cookie-title {
      font-size: 16px;
    }
    
    .cookie-text {
      font-size: 13px;
    }
    
    .cookie-btn {
      padding: 8px 20px;
      font-size: 13px;
    }
  }
</style>
