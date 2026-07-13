<script>
  let time = $state('')
  let date = $state('')
  let mounted = $state(false)

  const DAYS = ['日', '一', '二', '三', '四', '五', '六']

  function update() {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    time = `${hh}:${mm}:${ss}`

    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const d = now.getDate()
    const day = DAYS[now.getDay()]
    date = `${y}年${m}月${d}日 周${day}`
  }

  $effect(() => {
    update()
    const timer = setInterval(update, 1000)
    requestAnimationFrame(() => { mounted = true })
    return () => clearInterval(timer)
  })
</script>

<div class="clock-widget" class:mounted>
  {#if mounted}
    <div class="clock-display">
      <span class="clock-time">{time}</span>
      <span class="clock-date">{date}</span>
    </div>
  {:else}
    <div class="clock-display">
      <div class="skeleton skeleton-time"></div>
      <div class="skeleton skeleton-date"></div>
    </div>
  {/if}
</div>

<style>
  .clock-widget {
    width: 260px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 18px;
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    user-select: none;
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  .clock-widget.mounted {
    opacity: 1;
  }

  .clock-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .clock-time {
    font-size: 42px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 4px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.08);
  }

  .clock-date {
    font-size: 11px;
    color: #888888;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  @media (max-width: 1200px) {
    .clock-widget {
      display: none;
    }
  }

  /* ===== 骨架屏 ===== */
  .skeleton-time {
    width: 180px;
    height: 42px;
    border-radius: 8px;
  }

  .skeleton-date {
    width: 130px;
    height: 16px;
    border-radius: 4px;
    margin-top: 4px;
  }
</style>
