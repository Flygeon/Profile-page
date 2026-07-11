<script>
  import { onMount } from 'svelte'
  import config from '../data/config.js'

  const staticEntries = config.timeline

  const DEFAULT_COUNT = 5
  let expanded = $state(false)
  let blogEntries = $state([])
  let loading = $state(true)
  let rssError = $state(false)

  const CACHE_KEY = 'rss_cache_flygeon'
  const CACHE_TTL = 60 * 60 * 1000 // 1 小时

  let allEntries = $derived([...blogEntries, ...staticEntries].sort((a, b) => new Date(b.date) - new Date(a.date)))
  let visibleEntries = $derived(expanded ? allEntries : allEntries.slice(0, DEFAULT_COUNT))
  let hasMore = $derived(allEntries.length > DEFAULT_COUNT)

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function parseRSSItems(xmlText) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')
    const items = doc.querySelectorAll('item')
    if (!items.length) {
      // 尝试 Atom 格式
      const atomEntries = doc.querySelectorAll('entry')
      return Array.from(atomEntries).map(entry => {
        const title = entry.querySelector('title')?.textContent || ''
        const link = entry.querySelector('link')?.getAttribute('href') || ''
        const date = entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || ''
        const desc = entry.querySelector('summary')?.textContent?.slice(0, 120) || entry.querySelector('content')?.textContent?.slice(0, 120) || ''
        return { title, link, date, desc }
      })
    }
    return Array.from(items).map(item => {
      const title = item.querySelector('title')?.textContent || ''
      const link = item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || ''
      const pubDate = item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date')?.textContent || ''
      const desc = item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').slice(0, 120) || ''
      return { title, link, date: pubDate, desc }
    })
  }

  async function fetchRSS() {
    // 尝试读缓存
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          blogEntries = data
          loading = false
          return
        }
      } catch { /* 缓存损坏，忽略 */ }
    }

    try {
      // 优先直接请求，失败则走 CORS 代理
      let xmlText
      try {
        const res = await fetch('https://flygeon.top/rss.xml')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        xmlText = await res.text()
      } catch {
        // 跨域回退：用 allorigins 代理
        const proxyRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://flygeon.top/rss.xml')}`)
        xmlText = await proxyRes.text()
      }

      const raw = parseRSSItems(xmlText)
      const entries = raw.map((item, i) => ({
        id: `blog-${i}-${Date.now()}`,
        date: item.date ? formatDate(item.date) : '',
        title: item.title || '(无标题)',
        desc: item.desc || '',
        url: item.link,
        isBlog: true
      })).filter(e => e.date)

      blogEntries = entries
      rssError = false

      // 写入缓存
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: entries, timestamp: Date.now() }))
      } catch { /* 存储满忽略 */ }
    } catch (e) {
      console.warn('RSS 加载失败:', e)
      rssError = true
    } finally {
      loading = false
    }
  }

  onMount(() => {
    fetchRSS()
  })

  function toggleExpand() {
    expanded = !expanded
  }
</script>

<section class="timeline">
  <div class="card">
    <div class="timeline-header">
      <span class="timeline-title">最近更新</span>
      {#if loading}
        <span class="timeline-status loading">加载中…</span>
      {/if}
    </div>

    <div class="timeline-list">
      {#each visibleEntries as entry (entry.id)}
        <div class="timeline-item" style="--i: {allEntries.indexOf(entry)}">
          <div class="timeline-dot" class:blog-dot={entry.isBlog}></div>
            <div class="timeline-line"></div>
          <div class="timeline-content">
            <div class="timeline-meta">
              <span class="timeline-date">{entry.date}</span>
              {#if entry.isBlog}
                <span class="blog-badge">博客</span>
              {/if}
            </div>
            {#if entry.isBlog && entry.url}
              <a
                class="timeline-entry-title blog-link"
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
              >{entry.title}</a>
            {:else}
              <span class="timeline-entry-title">{entry.title}</span>
            {/if}
            {#if entry.desc}
              <span class="timeline-entry-desc">{entry.desc}</span>
            {/if}
          </div>
        </div>
      {/each}

      {#if !loading && allEntries.length === 0}
        <div class="timeline-empty">暂无内容</div>
      {/if}
    </div>

    {#if hasMore}
      <button class="expand-btn" onclick={toggleExpand}>
        {expanded ? '收起' : `展开全部 (${allEntries.length - DEFAULT_COUNT} 条更多)`}
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #2a2a2a;
  }

  .timeline-title {
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
  }

  .timeline-status.loading {
    font-size: 10px;
    color: #555;
    animation: pulse 1.2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
  }

  /* 条目进出动画 */
  .timeline-item {
    animation: slideStagger 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
    animation-delay: calc(var(--i, 0) * 25ms);
  }

  @keyframes slideStagger {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  .timeline-dot.blog-dot {
    background-color: #888888;
    width: 7px;
    height: 7px;
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

  .timeline-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .timeline-date {
    font-size: 11px;
    color: #666666;
  }

  .blog-badge {
    font-size: 9px;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: #999;
    border: 1px solid #333;
    line-height: 1.4;
    flex-shrink: 0;
  }

  .timeline-entry-title {
    font-size: 13px;
    color: #dddddd;
    font-weight: 500;
    line-height: 1.4;
  }

  .blog-link {
    color: #cccccc;
    text-decoration: none;
    transition: color 0.2s ease;
    cursor: pointer;
  }

  .blog-link:hover {
    color: #ffffff;
  }

  .timeline-entry-desc {
    font-size: 12px;
    color: #888888;
    line-height: 1.4;
  }

  .timeline-empty {
    text-align: center;
    padding: 24px 0;
    font-size: 12px;
    color: #555;
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
