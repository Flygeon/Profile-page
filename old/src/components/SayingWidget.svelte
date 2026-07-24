<script>
  import { onMount } from 'svelte'

  let data = $state(null)
  let loading = $state(true)
  let error = $state(false)

  async function fetchSaying() {
    loading = true
    error = false
    try {
      const res = await fetch('https://uapis.cn/api/v1/saying')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      // 接口返回 { text: "..." }，兜底保证有内容
      if (!json || typeof json.text !== 'string') throw new Error('数据格式异常')
      data = json
    } catch (e) {
      console.warn('一言加载失败:', e)
      error = true
    } finally {
      loading = false
    }
  }

  onMount(fetchSaying)
</script>

<div class="saying-widget">
  {#if loading}
    <div class="s-skeleton">
      <div class="sk sk-line w1"></div>
      <div class="sk sk-line w2"></div>
      <div class="sk sk-line w3"></div>
    </div>
  {:else if error}
    <div class="s-error">
      <i class="fa-solid fa-face-frown"></i>
      <p>语录加载失败</p>
      <button class="retry-btn" onclick={fetchSaying}>重试</button>
    </div>
  {:else if data}
    <div class="s-header">
      <i class="fa-solid fa-quote-left"></i>
      <span>一言</span>
    </div>
    <p class="s-text">{data.text}</p>
    <div class="s-footer">
      <button class="s-refresh" onclick={fetchSaying} title="换一句" aria-label="换一句">
        <i class="fa-solid fa-rotate"></i>
        <span>换一句</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .saying-widget {
    width: 260px;
    padding: 18px;
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    box-sizing: border-box;
    color: #fff;
    user-select: none;
  }

  /* ===== 头部 ===== */
  .s-header {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #6ee7a8;
    letter-spacing: 1px;
  }

  .s-header i {
    font-size: 12px;
  }

  /* ===== 语录正文 ===== */
  .s-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
    color: #e2e2e2;
    word-break: break-word;
    white-space: pre-wrap;
  }

  /* ===== 底部「换一句」 ===== */
  .s-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }

  .s-refresh {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 11px;
    color: #6ee7a8;
    background: rgba(110, 231, 168, 0.08);
    border: 1px solid rgba(110, 231, 168, 0.25);
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease, border-color 0.2s ease;
  }

  .s-refresh:hover {
    background: rgba(110, 231, 168, 0.16);
    border-color: rgba(110, 231, 168, 0.45);
  }

  .s-refresh:active {
    transform: scale(0.95);
  }

  .s-refresh i {
    font-size: 11px;
  }

  /* ===== 错误态 ===== */
  .s-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px 0;
    text-align: center;
  }

  .s-error i {
    font-size: 30px;
    color: #555;
  }

  .s-error p {
    margin: 0;
    font-size: 13px;
    color: #999;
  }

  .retry-btn {
    padding: 7px 18px;
    font-size: 12px;
    color: #fff;
    background: #2f2f2f;
    border: 1px solid #3d3d3d;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease;
  }

  .retry-btn:hover {
    background: #3a3a3a;
  }

  .retry-btn:active {
    transform: scale(0.96);
  }

  /* ===== 骨架屏 ===== */
  .s-skeleton {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 6px 0;
  }

  .sk {
    height: 13px;
    border-radius: 5px;
    background: linear-gradient(90deg, #2a2a2a 25%, #363636 37%, #2a2a2a 63%);
    background-size: 400% 100%;
    animation: skShimmer 1.2s ease-in-out infinite;
  }

  .w1 { width: 100%; }
  .w2 { width: 82%; }
  .w3 { width: 64%; }

  @keyframes skShimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }

  @media (max-width: 1200px) {
    .saying-widget {
      display: none;
    }
  }
</style>
