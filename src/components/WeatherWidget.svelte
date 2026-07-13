<script>
  import { onMount } from 'svelte'

  let data = $state(null)
  let loading = $state(true)
  let error = $state(false)

  // weather_icon 代码 → Font Awesome 图标（兼容和风/高德常见编码）
  const ICON_MAP = {
    '100': 'fa-sun',
    '101': 'fa-cloud-sun',
    '102': 'fa-cloud-sun',
    '103': 'fa-cloud-sun',
    '104': 'fa-cloud',
    '150': 'fa-cloud-sun',
    '300': 'fa-cloud-showers-heavy',
    '301': 'fa-cloud-showers-heavy',
    '305': 'fa-cloud-showers-heavy',
    '306': 'fa-cloud-showers-heavy',
    '307': 'fa-cloud-showers-heavy',
    '308': 'fa-cloud-showers-heavy',
    '309': 'fa-cloud-rain',
    '310': 'fa-cloud-showers-heavy',
    '311': 'fa-cloud-rain',
    '312': 'fa-cloud-showers-heavy',
    '313': 'fa-cloud-rain',
    '314': 'fa-cloud-showers-heavy',
    '315': 'fa-cloud-showers-heavy',
    '316': 'fa-cloud-rain',
    '399': 'fa-cloud-rain',
    '400': 'fa-snowflake',
    '401': 'fa-snowflake',
    '402': 'fa-snowflake',
    '403': 'fa-snowflake',
    '404': 'fa-snowflake',
    '405': 'fa-snowflake',
    '406': 'fa-snowflake',
    '407': 'fa-snowflake',
    '408': 'fa-snowflake',
    '409': 'fa-snowflake',
    '499': 'fa-snowflake',
    '500': 'fa-smog',
    '501': 'fa-smog',
    '502': 'fa-smog',
    '503': 'fa-smog',
    '504': 'fa-smog',
    '507': 'fa-smog',
    '508': 'fa-smog',
    '510': 'fa-smog',
    '511': 'fa-smog',
    '200': 'fa-wind',
    '201': 'fa-wind',
    '202': 'fa-wind',
    '203': 'fa-wind',
    '204': 'fa-wind',
    '205': 'fa-wind',
    '206': 'fa-wind',
    '207': 'fa-wind',
    '208': 'fa-wind',
    '209': 'fa-wind',
    '210': 'fa-bolt',
    '211': 'fa-bolt',
    '212': 'fa-bolt',
    '213': 'fa-bolt',
    '300d': 'fa-cloud-showers-heavy'
  }

  const CACHE_KEY = 'weather_cache'
  const CACHE_TTL = 15 * 60 * 1000

  async function fetchWeather() {
    loading = true
    error = false

    // 1) 先读本地缓存（15 分钟内复用）
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.data && Date.now() - parsed.ts < CACHE_TTL) {
          data = parsed.data
          loading = false
          return
        }
      }
    } catch (e) {
      // 缓存损坏，忽略
    }

    // 2) 直连接口
    try {
      const res = await fetch('https://uapis.cn/api/v1/misc/weather')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      data = json
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: json, ts: Date.now() }))
      } catch (e) {}
    } catch (e) {
      console.warn('天气加载失败:', e)
      error = true
    } finally {
      loading = false
    }
  }

  onMount(fetchWeather)

  const weatherIcon = $derived(data ? (ICON_MAP[String(data.weather_icon)] || 'fa-cloud') : 'fa-cloud')
  const alerts = $derived(data && Array.isArray(data.alerts) ? data.alerts : [])
  const locationText = $derived(
    data
      ? `${data.province} · ${data.city}${data.district ? ' · ' + data.district : ''}`
      : ''
  )
</script>

<div class="weather-widget">
  {#if loading}
    <div class="w-skeleton">
      <div class="skeleton w-sk-top"></div>
      <div class="skeleton w-sk-main"></div>
      <div class="skeleton w-sk-bottom"></div>
    </div>
  {:else if error}
    <div class="w-error">
      <i class="fa-solid fa-cloud-showers-heavy"></i>
      <p>天气加载失败</p>
      <button class="retry-btn" onclick={fetchWeather}>重试</button>
    </div>
  {:else if data}
    <div class="w-header">
      <i class="fa-solid fa-location-dot"></i>
      <span class="w-loc">{locationText}</span>
    </div>

    <div class="w-main">
      <i class="fa-solid {weatherIcon} w-icon"></i>
      <div class="w-temp">{data.temperature}<span class="w-deg">°</span></div>
      <div class="w-desc">{data.weather}</div>
    </div>

    <div class="w-footer">
      <div class="w-metric">
        <i class="fa-solid fa-wind"></i>
        <span>{data.wind_direction} {data.wind_power}</span>
      </div>
      <div class="w-metric">
        <i class="fa-solid fa-droplet"></i>
        <span>湿度 {data.humidity}%</span>
      </div>
      <div class="w-metric w-metric-time">
        <i class="fa-solid fa-clock"></i>
        <span>{data.report_time}</span>
      </div>
    </div>

    {#if alerts.length}
      <div class="w-alert">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span class="w-alert-text">{alerts[0].title}{alerts.length > 1 ? ` 等 ${alerts.length} 条预警` : ''}</span>
      </div>
    {/if}
  {/if}
</div>

<style>
  .weather-widget {
    width: 260px;
    padding: 18px;
    background-color: rgba(26, 26, 26, 0.45);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-sizing: border-box;
    color: #fff;
    user-select: none;
  }

  /* ===== 头部地点 ===== */
  .w-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #aaa;
    margin-bottom: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .w-header i {
    color: #6ee7a8;
    font-size: 11px;
    flex-shrink: 0;
  }

  .w-loc {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ===== 中部温度 ===== */
  .w-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 0 14px;
  }

  .w-icon {
    font-size: 44px;
    color: #6ee7a8;
    filter: drop-shadow(0 0 18px rgba(110, 231, 168, 0.35));
    line-height: 1;
  }

  .w-temp {
    font-size: 46px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 1px;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .w-deg {
    font-size: 24px;
    font-weight: 600;
    color: #ccc;
    margin-left: 2px;
  }

  .w-desc {
    font-size: 14px;
    color: #ddd;
    letter-spacing: 2px;
  }

  /* ===== 底部指标 ===== */
  .w-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 14px;
    border-top: 1px solid #2a2a2a;
  }

  .w-metric {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #bbb;
  }

  .w-metric i {
    color: #888;
    width: 14px;
    text-align: center;
    font-size: 12px;
  }

  .w-metric-time span {
    color: #888;
    font-size: 11px;
  }

  /* ===== 预警条 ===== */
  .w-alert {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(255, 180, 84, 0.08);
    border: 1px solid rgba(255, 180, 84, 0.25);
  }

  .w-alert i {
    color: #ffcf6e;
    font-size: 12px;
    flex-shrink: 0;
  }

  .w-alert-text {
    font-size: 11px;
    color: #ffcf6e;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ===== 骨架屏 ===== */
  .w-skeleton {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .w-sk-top {
    height: 14px;
    width: 70%;
    border-radius: 6px;
  }

  .w-sk-main {
    height: 90px;
    width: 100%;
    border-radius: 12px;
  }

  .w-sk-bottom {
    height: 60px;
    width: 100%;
    border-radius: 10px;
  }

  /* ===== 错误态 ===== */
  .w-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 0;
    color: #888;
  }

  .w-error i {
    font-size: 32px;
    color: #555;
  }

  .w-error p {
    font-size: 13px;
    margin: 0;
  }

  .retry-btn {
    background: #111111;
    border: 1px solid #333333;
    color: #6ee7a8;
    font-size: 12px;
    padding: 6px 16px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .retry-btn:hover {
    background: #222222;
    border-color: #6ee7a8;
  }

  .retry-btn:active {
    transform: scale(0.96);
  }

  @media (max-width: 1200px) {
    .weather-widget {
      display: none;
    }
  }
</style>
