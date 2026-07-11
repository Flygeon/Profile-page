<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'
  import config from '../data/config.js'

  const songs = config.music.map(s => ({ ...s, url: `https://music.163.com/song/media/outer/url?id=${s.id}.mp3` }))

  let currentIndex = $state(0)
  let isPlaying = $state(false)
  let error = $state(null)
  let audioEl = null
  let expanded = $state(false)

  let currentTime = $state(0)
  let duration = $state(0)
  let volume = $state(1)
  let prevVolume = $state(1)
  let playMode = $state('list') // 'list' | 'single' | 'shuffle'

  const playModeIcons = {
    list: 'fa-repeat',
    single: 'fa-repeat',
    shuffle: 'fa-shuffle'
  }
  const playModeLabels = {
    list: '列表循环',
    single: '单曲循环',
    shuffle: '随机播放'
  }

  let currentSong = $derived(songs[currentIndex] || null)

  onMount(() => {
    if (audioEl && currentSong) {
      audioEl.src = currentSong.url
    }
  })

  function doPlay() {
    audioEl.play().then(() => {
      isPlaying = true
    }).catch(() => {
      isPlaying = false
      const onReady = () => {
        audioEl.play().then(() => {
          isPlaying = true
        }).catch(() => {
          isPlaying = false
        })
        audioEl.removeEventListener('canplaythrough', onReady)
      }
      audioEl.addEventListener('canplaythrough', onReady)
    })
  }

  function selectAndPlay(index) {
    if (index === currentIndex) {
      togglePlay()
      return
    }
    currentIndex = index
    if (audioEl) {
      audioEl.src = songs[index].url
      audioEl.load()
      doPlay()
    }
  }

  function togglePlay() {
    if (!audioEl || !songs.length) return
    if (isPlaying) {
      audioEl.pause()
      isPlaying = false
    } else {
      if (!audioEl.src || audioEl.src !== songs[currentIndex].url) {
        audioEl.src = songs[currentIndex].url
        audioEl.load()
      }
      doPlay()
    }
  }

  function next() {
    if (!songs.length) return
    const nextIdx = getNextIndex()
    selectAndPlay(nextIdx)
  }

  function prev() {
    if (!songs.length) return
    const prevIdx = (currentIndex - 1 + songs.length) % songs.length
    selectAndPlay(prevIdx)
  }

  function onAudioEnd() {
    const nextIdx = getNextIndex()
    selectAndPlay(nextIdx)
  }

  function onAudioError() {
    error = '加载失败，正在切换...'
    setTimeout(() => {
      error = null
      next()
    }, 1500)
  }

  function onLoadedMetadata() {
    if (audioEl) duration = audioEl.duration
  }

  function onTimeUpdate() {
    if (audioEl) currentTime = audioEl.currentTime
  }

  function toggleExpand() {
    expanded = !expanded
  }

  // === 播放模式相关 ===
  function getNextIndex() {
    if (playMode === 'single') return currentIndex
    if (playMode === 'shuffle') {
      if (songs.length <= 1) return 0
      let next
      do {
        next = Math.floor(Math.random() * songs.length)
      } while (next === currentIndex)
      return next
    }
    return (currentIndex + 1) % songs.length
  }

  function cyclePlayMode() {
    const modes = ['list', 'single', 'shuffle']
    const idx = modes.indexOf(playMode)
    playMode = modes[(idx + 1) % modes.length]
  }

  // === 音量控制 ===
  function setVolume(val) {
    volume = Math.max(0, Math.min(1, val))
    if (audioEl) audioEl.volume = volume
  }

  function toggleMute() {
    if (volume > 0) {
      prevVolume = volume
      setVolume(0)
    } else {
      setVolume(prevVolume || 0.5)
    }
  }

  // === 进度控制 ===
  function handleProgressClick(e) {
    if (!audioEl || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioEl.currentTime = ratio * duration
  }

  function formatTime(t) {
    if (!t || !isFinite(t)) return '00:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  onDestroy(() => {
    if (audioEl) {
      audioEl.pause()
      audioEl.src = ''
    }
  })
</script>

<div class="float-widget">
  <audio
    bind:this={audioEl}
    preload="metadata"
    onended={onAudioEnd}
    onerror={onAudioError}
    onpause={() => isPlaying = false}
    ontimeupdate={onTimeUpdate}
    onloadedmetadata={onLoadedMetadata}
  ></audio>

  <div class="player-container" class:expanded>
    <!-- ===== 进度条 ===== -->
    <div class="progress-bar" class:ready={duration > 0} onclick={handleProgressClick} role="slider" aria-label="播放进度" aria-valuemin="0" aria-valuemax={duration || 0} aria-valuenow={currentTime} tabindex="0" onkeydown={(e) => { if (e.key === 'ArrowRight' && audioEl) audioEl.currentTime = Math.min(duration, currentTime + 5); if (e.key === 'ArrowLeft' && audioEl) audioEl.currentTime = Math.max(0, currentTime - 5); }}>
      <div class="progress-track">
        <div class="progress-fill" style="width: {duration ? (currentTime / duration * 100) : 0}%"></div>
        <div class="progress-thumb" style="left: {duration ? (currentTime / duration * 100) : 0}%"></div>
      </div>
    </div>
    <!-- ===== 迷你播放条（始终可见） ===== -->
    <div class="mini-bar" onclick={toggleExpand} onkeydown={(e) => e.key === 'Enter' && toggleExpand()} role="button" tabindex="0" aria-label={expanded ? '收起' : '展开'}>
      <!-- 封面缩略图 -->
      <div class="mini-cover">
        {#if currentSong}
          <img
            class="mini-img"
            class:spinning={isPlaying}
            src={currentSong.cover}
            alt=""
            onerror={(e) => { e.target.style.display = 'none'; const fb = e.target.parentElement.querySelector('.mini-fallback'); if (fb) fb.style.display = 'flex'; }}
          />
        {/if}
        <span class="mini-fallback" style="display: {currentSong ? 'none' : 'flex'}">
          <i class="fa-solid fa-music"></i>
        </span>
      </div>

      <!-- 歌曲信息 -->
      <div class="mini-info">
        <span class="mini-title">{currentSong ? currentSong.title : '未选择歌曲'}</span>
        <span class="mini-artist">{currentSong ? currentSong.artist : ''}</span>
      </div>

      <!-- 播放按钮 -->
      <button
        class="play-btn-mini"
        onclick={(e) => { e.stopPropagation(); togglePlay(); }}
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        <i class="fa-solid fa-{isPlaying ? 'pause' : 'play'}"></i>
      </button>

      <!-- 展开/收起箭头 -->
      <span class="expand-arrow">
        <i class="fa-solid fa-chevron-{expanded ? 'down' : 'up'}"></i>
      </span>
    </div>

    <!-- ===== 展开面板（transition: max-height） ===== -->
    <div class="expand-panel" class:open={expanded}>
      <div class="panel-inner">
        <!-- 播放列表标题 -->
        <div class="panel-header">
          <i class="fa-solid fa-list-ul"></i>
          <span>播放列表</span>
          <button class="mode-btn" onclick={(e) => { e.stopPropagation(); cyclePlayMode(); }} aria-label={playModeLabels[playMode]} title={playModeLabels[playMode]}>
            <i class="fa-solid {playModeIcons[playMode]}"></i>
            {#if playMode === 'single'}
              <span class="mode-badge">1</span>
            {/if}
          </button>
          <span class="song-count">{songs.length} 首</span>
        </div>

        <!-- 音量控制 -->
        <div class="volume-row">
          <button class="volume-icon-btn" onclick={(e) => { e.stopPropagation(); toggleMute(); }} aria-label={volume === 0 ? '取消静音' : '静音'}>
            <i class="fa-solid fa-fw {volume === 0 ? 'fa-volume-xmark' : volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high'}"></i>
          </button>
          <div class="volume-slider-wrap" role="slider" aria-label="音量" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(volume * 100)} tabindex="0" onclick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))); }} onkeydown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); setVolume(volume + 0.05); } if (e.key === 'ArrowLeft') { e.preventDefault(); setVolume(volume - 0.05); } }}>
            <div class="volume-track">
              <div class="volume-fill" style="width: {volume * 100}%"></div>
              <div class="volume-thumb" style="left: {volume * 100}%"></div>
            </div>
          </div>
          <span class="volume-percent">{Math.round(volume * 100)}</span>
        </div>

        <!-- 歌单列表 -->
        <div class="playlist">
          {#each songs as song, i (song.id)}
            <button
              class="playlist-item"
              class:active={i === currentIndex}
              class:playing={i === currentIndex && isPlaying}
              onclick={() => selectAndPlay(i)}
            >
              <!-- 序号 / 播放状态图标 -->
              <span class="item-index">
                {#if i === currentIndex && isPlaying}
                  <span class="eq-bars">
                    <i></i><i></i><i></i>
                  </span>
                {:else}
                  <span class="item-num">{i + 1}</span>
                {/if}
              </span>

              <!-- 封面小图 -->
              <img
                class="item-cover"
                src={song.cover}
                alt=""
                onerror={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23222" width="40" height="40"/><text x="20" y="25" text-anchor="middle" fill="%23555" font-size="14">♪</text></svg>'
                }}
              />

              <!-- 歌曲信息 -->
              <span class="item-info">
                <span class="item-title">{song.title}</span>
                <span class="item-artist">{song.artist}</span>
              </span>

              <!-- 当前播放指示 -->
              {#if i === currentIndex}
                <span class="item-active-dot"></span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- 错误提示 -->
  {#if error}
    <div class="error-toast" transition:fade={{ duration: 200 }}>
      {error}
    </div>
  {/if}
</div>

<style>
  .float-widget {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    max-width: 320px;
  }

  /* ===== 容器 ===== */
  .player-container {
    background: #161616;
    border: 1px solid #333;
    border-radius: 14px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.55);
    overflow: hidden;
    width: 100%;
    min-width: 280px;
    transition: box-shadow 0.35s ease;
  }

  .player-container.expanded {
    box-shadow: 0 12px 50px rgba(0,0,0,0.65);
  }

  /* ===== 进度条 ===== */
  .progress-bar {
    width: 100%;
    height: 10px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    padding: 4px 0;
    user-select: none;
    touch-action: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .progress-bar.ready {
    opacity: 1;
  }

  .progress-track {
    width: 100%;
    height: 3px;
    background: #2a2a2a;
    border-radius: 2px;
    position: relative;
    overflow: visible;
    transition: height 0.15s ease;
  }

  .progress-bar:hover .progress-track {
    height: 5px;
  }

  .progress-fill {
    height: 100%;
    background: #ffffff;
    border-radius: 2px;
    transition: width 0.2s linear;
    pointer-events: none;
  }

  .progress-thumb {
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    background: #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
    box-shadow: 0 0 6px rgba(255,255,255,0.3);
  }

  .progress-bar:hover .progress-thumb {
    opacity: 1;
  }

  /* ===== 迷你播放条 ===== */
  .mini-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    transition: background 0.2s;
  }

  .mini-bar:hover {
    background: rgba(255,255,255,0.03);
  }

  .mini-cover {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    background: #1f1f1f;
  }

  .mini-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background: #1f1f1f;
  }

  .mini-img.spinning {
    animation: spin 8s linear infinite;
  }

  .mini-fallback {
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: #555;
    font-size: 16px;
  }

  .mini-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }

  .mini-title {
    font-size: 13px;
    font-weight: 600;
    color: #eee;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }

  .mini-artist {
    font-size: 11px;
    color: #777;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }

  .play-btn-mini {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: #2a2a2a;
    color: #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .play-btn-mini:hover {
    background: #ffffff;
    color: #fff;
  }

  .expand-arrow {
    color: #555;
    font-size: 11px;
    flex-shrink: 0;
    transition: color 0.2s;
    width: 20px;
    text-align: center;
  }

  .mini-bar:hover .expand-arrow {
    color: #999;
  }

  /* ===== 展开面板 ===== */
  .expand-panel {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .expand-panel.open {
    max-height: 360px;
  }

  .panel-inner {
    padding: 0 12px 12px;
    opacity: 0;
    transform: translateY(-6px);
    transition: opacity 0.25s ease, transform 0.25s ease;
  }

  .expand-panel.open .panel-inner {
    opacity: 1;
    transform: translateY(0);
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    margin-bottom: 4px;
    border-top: 1px solid #2a2a2a;
    font-size: 12px;
    font-weight: 600;
    color: #999;
  }

  .panel-header i {
    font-size: 11px;
  }

  /* 播放模式按钮 */
  .mode-btn {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    font-size: 11px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: all 0.2s;
    position: relative;
    display: flex;
    align-items: center;
  }

  .mode-btn:hover {
    color: #ccc;
    background: rgba(255,255,255,0.06);
  }

  .mode-badge {
    position: absolute;
    top: 0;
    right: 1px;
    font-size: 8px;
    font-weight: 700;
    color: #fff;
  }

  .panel-header .song-count {
    margin-left: auto;
    font-size: 10px;
    color: #555;
    font-weight: 400;
  }

  /* ===== 音量控制 ===== */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 8px 4px;
    border-bottom: 1px solid #2a2a2a;
    margin-bottom: 4px;
  }

  .volume-icon-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 12px;
    padding: 2px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: color 0.2s;
    flex-shrink: 0;
  }

  .volume-icon-btn:hover {
    color: #ccc;
  }

  .volume-slider-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 6px 0;
  }

  .volume-track {
    width: 100%;
    height: 3px;
    background: #2a2a2a;
    border-radius: 2px;
    position: relative;
    transition: height 0.15s ease;
  }

  .volume-slider-wrap:hover .volume-track {
    height: 5px;
  }

  .volume-fill {
    height: 100%;
    background: #ffffff;
    border-radius: 2px;
    pointer-events: none;
  }

  .volume-thumb {
    position: absolute;
    top: 50%;
    width: 8px;
    height: 8px;
    background: #ffffff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }

  .volume-slider-wrap:hover .volume-thumb {
    opacity: 1;
  }

  .volume-percent {
    font-size: 10px;
    color: #555;
    width: 28px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  /* ===== 歌单列表 ===== */
  .playlist {
    display: flex;
    flex-direction: column;
    max-height: 280px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #333 transparent;
  }

  .playlist::-webkit-scrollbar {
    width: 4px;
  }

  .playlist::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 2px;
  }

  .playlist-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 6px;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
    width: 100%;
    text-align: left;
  }

  .playlist-item:hover {
    background: rgba(255,255,255,0.04);
  }

  .playlist-item.active {
    background: rgba(255,255,255,0.08);
  }

  .item-index {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .item-num {
    font-size: 12px;
    color: #555;
    font-weight: 500;
  }

  .playlist-item.active .item-num {
    color: #ffffff;
  }

  /* 播放中的 EQ 动画条 */
  .eq-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 16px;
  }

  .eq-bars i {
    display: block;
    width: 2.5px;
    border-radius: 1px;
    background: #ffffff;
    animation: eq 0.8s ease-in-out infinite;
  }

  .eq-bars i:nth-child(1) { height: 10px; animation-delay: 0s; }
  .eq-bars i:nth-child(2) { height: 16px; animation-delay: 0.15s; }
  .eq-bars i:nth-child(3) { height: 8px;  animation-delay: 0.3s; }

  @keyframes eq {
    0%, 100% { transform: scaleY(0.5); }
    50% { transform: scaleY(1); }
  }

  .item-cover {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: #1f1f1f;
  }

  .item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .item-title {
    font-size: 12px;
    color: #ccc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .playlist-item.active .item-title {
    color: #fff;
    font-weight: 500;
  }

  .item-artist {
    font-size: 10px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .playlist-item.active .item-artist {
    color: #ffffff;
  }

  .item-active-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
    flex-shrink: 0;
    box-shadow: 0 0 6px rgba(255,255,255,0.4);
  }

  /* ===== 错误提示 ===== */
  .error-toast {
    background: rgba(255,255,255,0.9);
    color: #fff;
    font-size: 12px;
    padding: 8px 14px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    white-space: nowrap;
  }

  /* ===== 旋转动画 ===== */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* ===== 响应式 ===== */
  @media (max-width: 768px) {
    .float-widget {
      bottom: 12px;
      right: 8px;
      max-width: calc(100vw - 16px);
    }

    .player-container {
      min-width: 260px;
    }

    .mini-bar {
      padding: 8px 10px;
      gap: 8px;
    }

    .mini-cover {
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }

    .mini-title {
      font-size: 12px;
      max-width: 120px;
    }

    .mini-artist {
      font-size: 10px;
      max-width: 120px;
    }

    .play-btn-mini {
      width: 30px;
      height: 30px;
      font-size: 11px;
    }

    .expand-panel.open {
      max-height: 300px;
    }

    .playlist {
      max-height: 220px;
    }

    .playlist-item {
      padding: 7px 4px;
      gap: 8px;
    }

    .item-cover {
      width: 28px;
      height: 28px;
    }

    .item-title {
      font-size: 11px;
    }

    /* 响应式：进度条触摸优化 */
    .progress-bar {
      height: 14px;
    }

    .progress-track {
      height: 4px;
    }

    .progress-thumb {
      opacity: 1;
      width: 8px;
      height: 8px;
    }

    /* 响应式：音量触摸优化 */
    .volume-slider-wrap {
      padding: 8px 0;
    }

    .volume-track {
      height: 4px;
    }

    .volume-thumb {
      opacity: 1;
      width: 10px;
      height: 10px;
    }
  }
</style>
