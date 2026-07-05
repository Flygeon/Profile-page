<script>
  import entries from '../data/timeline.json'
  import { cardGradient } from '../lib/cardGradient.js'

  const DEFAULT_COUNT = 3
  let expanded = false

  $: visibleEntries = expanded ? entries : entries.slice(0, DEFAULT_COUNT)
  $: hasMore = entries.length > DEFAULT_COUNT

  function toggleExpand() {
    expanded = !expanded
  }
</script>

<section class="timeline">
  <div class="card">
    <div class="timeline-header">
      <span class="timeline-title">最近更新</span>
    </div>

    <div class="timeline-list">
      {#each visibleEntries as entry (entry.id)}
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-line"></div>
          <div class="timeline-content">
            <span class="timeline-date">{entry.date}</span>
            <span class="timeline-entry-title">{entry.title}</span>
            {#if entry.desc}
              <span class="timeline-entry-desc">{entry.desc}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    {#if hasMore}
      <button class="expand-btn" on:click={toggleExpand}>
        {expanded ? '收起' : `展开全部 (${entries.length - DEFAULT_COUNT} 条更多)`}
        <i class="fa-solid fa-chevron-{expanded ? 'up' : 'down'}"></i>
      </button>
    {/if}
  </div>
</section>

<style>
  .timeline {
    width: 100%;
  }

  .card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px 24px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .timeline-header {
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #2a2a2a;
  }

  .timeline-title {
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
  }

  .timeline-item {
    position: relative;
    padding-left: 18px;
    padding-bottom: 14px;
  }

  .timeline-dot {
    position: absolute;
    left: 0;
    top: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ffffff;
    border: 2px solid #1a1a1a;
  }

  .timeline-line {
    position: absolute;
    left: 3px;
    top: 14px;
    width: 2px;
    bottom: 0;
    background-color: #2a2a2a;
  }

  .timeline-item:last-child .timeline-line {
    display: none;
  }

  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .timeline-date {
    font-size: 11px;
    color: #666666;
  }

  .timeline-entry-title {
    font-size: 13px;
    color: #dddddd;
    font-weight: 500;
    line-height: 1.4;
  }

  .timeline-entry-desc {
    font-size: 12px;
    color: #888888;
    line-height: 1.4;
  }

  .expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 10px;
    margin-top: 6px;
    background: none;
    border: none;
    border-top: 1px solid #2a2a2a;
    color: #888888;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    font-family: inherit;
  }

  .expand-btn:hover {
    color: #ffffff;
    background-color: #222222;
  }

  .expand-btn i {
    font-size: 10px;
    transition: transform 0.2s ease-in-out;
  }

  @media (max-width: 768px) {
    .card {
      padding: 16px 18px;
    }

    .timeline-entry-title {
      font-size: 12px;
    }

    .timeline-entry-desc {
      font-size: 11px;
    }
  }
</style>
