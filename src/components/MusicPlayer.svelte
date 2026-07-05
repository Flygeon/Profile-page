<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'

  const songs = [
    { id: 22826401,  title: 'God knows...', artist: '平野綾', cover: 'https://p2.music.126.net/H8G-oFG_4z34t_qikgFvkQ==/109951172808538419.jpg?param=130y130' },
    { id: 471795, title: 'My Soul, Your Beats!', artist: 'Lia', cover: 'https://p1.music.126.net/2xc1ZXSTxNkW8u-c9Emdgw==/109951170245717432.jpg?param=130y130' },
  ].map(s => ({ ...s, url: `https://music.163.com/song/media/outer/url?id=${s.id}.mp3` }))

  let currentIndex = $state(0)
  let isPlaying = $state(false)
  let error = $state(null)
  let audioEl = null
  let expanded = $state(false)

  let currentSong = $derived(songs[currentIndex] || null)

  onMount(() => {
    console.log('onMount audioEl:', audioEl)
    if (audioEl && currentSong) {
      audioEl.src = currentSong.url
    }
  })

  function selectAndPlay(index) {
    if (index === currentIndex) {
      togglePlay()
      return
    }
    currentIndex = index
    if (audioEl) {
      audioEl.src = songs[index].url
      audioEl.load()
      audioEl.play().then(() => {
        isPlaying = true
      }).catch(() => {
        isPlaying = false
        const playHandler = () => {
          audioEl.play().then(() => {
            isPlaying = true
          }).catch(() => {
            isPlaying = false
          })
          audioEl.removeEventListener('canplaythrough', playHandler)
        }
        audioEl.addEventListener('canplaythrough', playHandler)
      })
    }
  }

  function togglePlay() {
    console.log('togglePlay called', { audioEl: !!audioEl, isPlaying })
    if (!audioEl || !songs.length) return
    if (isPlaying) {
      audioEl.pause()
      isPlaying = false
    } else {
      if (!audioEl.src || audioEl.src !== songs[currentIndex].url) {
        audioEl.src = songs[currentIndex].url
        audioEl.load()
      }
      audioEl.play().then(() => {
        isPlaying = true
        console.log('play succeeded')
      }).catch((err) => {
        isPlaying = false
        console.log('play failed', err)
        const playHandler = () => {
          audioEl.play().then(() => {
            isPlaying = true
          }).catch(() => {
            isPlaying = false
          })
          audioEl.removeEventListener('canplaythrough', playHandler)
        }
        audioEl.addEventListener('canplaythrough', playHandler)
      })
    }
  }

  function next() {
    if (!songs.length) return
    const nextIdx = (currentIndex + 1) % songs.length
    selectAndPlay(nextIdx)
  }

  function prev() {
    if (!songs.length) return
    const prevIdx = (currentIndex - 1 + songs.length) % songs.length
    selectAndPlay(prevIdx)
  }

  function onAudioEnd() {
    next()
  }

  function onAudioError() {
    error = '加载失败，正在切换...'
    setTimeout(() => {
      error = null
      next()
    }, 1500)
  }

  function onAudioCanPlay() {
    error = null
    isPlaying = true
    audioEl?.play().catch(() => { isPlaying = false })
  }

  function toggleExpand() {
    console.log('toggleExpand called')
    expanded = !expanded
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
    oncanplay={onAudioCanPlay}
    onpause={() => isPlaying = false}
  ></audio>

  <div class="player-container" class:expanded>
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
            onerror={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
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
          <span class="song-count">{songs.length} 首</span>
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
    background: rgba(22, 22, 22, 0.96);
    backdrop-filter: blur(20px);
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
    transition: opacity 0.3s 0.1s, transform 0.3s 0.1s;
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

  .panel-header .song-count {
    margin-left: auto;
    font-size: 10px;
    color: #555;
    font-weight: 400;
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
  }
</style>
