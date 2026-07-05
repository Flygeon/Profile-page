<script>
  import { fade } from 'svelte/transition'
  import noticesData from '../data/notices.json'
  
  const notices = noticesData
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
      <i class="fa-solid fa-bullhorn"></i>
      <span>公告</span>
    </div>
    
    {#if notices.length > 0}
      <div class="notice-list">
        {#each notices.slice(0, 2) as notice}
          <div class="notice-item">
            <span class="notice-date">{notice.date.slice(5)}</span>
            <span class="notice-title">{notice.title}</span>
          </div>
        {/each}
        
        {#if notices.length > 2}
          <button class="view-all-btn" onclick={() => showModal = true}>
            查看全部
          </button>
        {/if}
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
    >
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <span>全部公告</span>
          <button class="close-btn" onclick={closeModal} aria-label="关闭">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-list">
          {#each notices as notice}
            <div class="modal-item">
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
    padding: 16px 18px;
    background-color: rgba(26, 26, 26, 0.45);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    opacity: 0;
    transform: translateX(-16px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    margin-top: 24px;
  }
  
  .notice-board.mounted {
    opacity: 1;
    transform: translateX(0);
  }
  
  .notice-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
  }
  
  .notice-header i {
    font-size: 11px;
    color: #ffffff;
  }
  
  .notice-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .notice-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
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
  
  .view-all-btn {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 10px;
    cursor: pointer;
    padding: 4px 0;
    text-align: left;
    transition: color 0.2s;
  }
  
  .view-all-btn:hover {
    color: #ffffff;
    text-decoration: underline;
  }
  
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
    transition: color 0.2s;
  }
  
  .close-btn:hover {
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
</style>
