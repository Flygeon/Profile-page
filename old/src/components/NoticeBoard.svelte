<script>
  import { fade, fly } from 'svelte/transition'
  import config from '../data/config.js'

  const notices = config.notices
  let showModal = $state(false)
  let mounted = $state(false)

  setTimeout(() => {
    mounted = true
  }, 100)

  function closeModal() {
    showModal = false
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') closeModal()
  }
</script>

<div>
  <div class="notice-board" class:mounted>
    <div class="notice-header">
      <span class="notice-icon-wrapper">
        <i class="fa-solid fa-bullhorn"></i>
        <span class="live-dot"></span>
      </span>
      <span>公告</span>
    </div>

    {#if mounted}
      {#if notices.length > 0}
        <div class="notice-list">
          {#each notices.slice(0, 2) as notice, i (notice.id)}
            <div class="notice-item" style="--i: {i}">
              <span class="notice-date">{notice.date.slice(5)}</span>
              <span class="notice-title">{notice.title}</span>
            </div>
          {/each}

          {#if notices.length > 2}
            <button class="view-all-btn" onclick={() => showModal = true}>
              查看全部
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="notice-skeleton">
        <div class="skeleton skeleton-notice-line"></div>
        <div class="skeleton skeleton-notice-line skeleton-short"></div>
      </div>
    {/if}
  </div>

  {#if showModal}
    <div
      class="modal-overlay"
      onclick={closeModal}
      onkeydown={handleKeydown}
      role="dialog"
      aria-modal="true"
      aria-label="公告详情"
      tabindex="-1"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="modal-content"
        onclick={(e) => e.stopPropagation()}
        transition:fly={{ y: 40, duration: 300, opacity: 0 }}
      >
        <div class="modal-header">
          <span>全部公告</span>
          <button class="close-btn" onclick={closeModal} aria-label="关闭">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-list">
          {#each notices as notice, i (notice.id)}
            <div
              class="modal-item"
              style="--i: {i}"
            >
              <span class="modal-date">{notice.date}</span>
              <div class="modal-info">
                <span class="modal-title">{notice.title}</span>
                <span class="modal-content-text">{notice.content}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .notice-board {
    width: 260px;
    padding: 18px;
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  .notice-board.mounted {
    opacity: 1;
  }

  /* ===== 头部 ===== */
  .notice-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .notice-icon-wrapper {
    position: relative;
    display: inline-flex;
    font-size: 11px;
    color: #ffffff;
  }

  .live-dot {
    position: absolute;
    top: -3px;
    right: -5px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: dotPulse 2s ease-in-out infinite;
    box-shadow: 0 0 6px rgba(74, 222, 128, 0.4);
  }

  @keyframes dotPulse {
    0%, 100% { opacity: 0.4; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1.15); }
  }

  /* ===== 公告列表 ===== */
  .notice-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notice-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: noticeSlideIn 0.4s cubic-bezier(0.32, 0.72, 0, 1) both;
    animation-delay: calc(var(--i, 0) * 120ms + 0.35s);
  }

  @keyframes noticeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .notice-date {
    font-size: 10px;
    color: #666;
  }

  .notice-title {
    font-size: 11px;
    color: #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ===== 查看全部按钮 ===== */
  .view-all-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 10px;
    cursor: pointer;
    padding: 4px 0;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.25s ease;
  }

  .view-all-btn:hover {
    color: #ffffff;
    gap: 6px;
  }

  .view-all-btn i {
    font-size: 8px;
    transition: transform 0.25s ease;
  }

  .view-all-btn:hover i {
    transform: translateX(2px);
  }

  /* ===== 模态框 ===== */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 16px;
    padding: 20px;
    width: 90%;
    max-width: 400px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #2a2a2a;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }

  .close-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    transition: all 0.2s;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: #2a2a2a;
    color: #fff;
  }

  .modal-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-item {
    display: flex;
    gap: 12px;
    animation: modalItemIn 0.35s cubic-bezier(0.32, 0.72, 0, 1) both;
    animation-delay: calc(var(--i, 0) * 60ms);
  }

  @keyframes modalItemIn {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .modal-date {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .modal-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .modal-title {
    font-size: 13px;
    color: #eee;
    font-weight: 500;
  }

  .modal-content-text {
    font-size: 11px;
    color: #888;
    line-height: 1.5;
  }

  @media (max-width: 1200px) {
    .notice-board {
      display: none;
    }
  }

  /* ===== 骨架屏 ===== */
  .notice-skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-notice-line {
    height: 32px;
    width: 100%;
    border-radius: 4px;
  }

  .skeleton-notice-line.skeleton-short {
    width: 65%;
  }
</style>
