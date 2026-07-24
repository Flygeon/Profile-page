<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade, fly } from 'svelte/transition'

  let { onBack = () => {} } = $props()

  const FORMATS = [
    { value: 'png', label: 'PNG', note: '无损 · 支持透明' },
    { value: 'jpg', label: 'JPG', note: '有损 · 体积小' },
    { value: 'webp', label: 'WebP', note: '现代 · 高压缩' }
  ]
  const MIME = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }
  const EXT = { png: 'png', jpg: 'jpg', webp: 'webp' }

  let targetFormat = $state('png')
  let quality = $state(0.92)

  let sourceFile = $state(null)
  let sourceUrl = $state('')
  let sourceImg = $state(null) // HTMLImageElement
  let sourceInfo = $state({ name: '', width: 0, height: 0, size: 0 })

  let convertedBlob = $state(null)
  let convertedUrl = $state('')
  let convertedSize = $state(0)
  let convertedReady = $state(false)

  let isConverting = $state(false)
  let isDragging = $state(false)
  let error = $state('')

  let dragCounter = 0
  let fileInput = $state()

  const isLossy = $derived(targetFormat !== 'png')
  const formatIndex = $derived(FORMATS.findIndex((f) => f.value === targetFormat))

  const savingPercent = $derived.by(() => {
    if (!sourceInfo.size || !convertedSize) return null
    const diff = sourceInfo.size - convertedSize
    if (diff <= 0) return null
    return Math.round((diff / sourceInfo.size) * 100)
  })

  function formatBytes(n) {
    if (n === 0) return '0 B'
    if (!n) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / 1024 / 1024).toFixed(2) + ' MB'
  }

  function outputName() {
    const base = (sourceInfo?.name || 'image').replace(/\.[^.]+$/, '') || 'image'
    return `${base}.${EXT[targetFormat]}`
  }

  function revokeConverted() {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    convertedUrl = ''
    convertedBlob = null
    convertedSize = 0
    convertedReady = false
  }

  function loadFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      error = '请选择有效的图片文件'
      return
    }
    error = ''
    revokeConverted()
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)

    sourceFile = file
    sourceInfo = { name: file.name, size: file.size, width: 0, height: 0 }
    const url = URL.createObjectURL(file)
    sourceUrl = url

    const img = new Image()
    img.onload = () => {
      sourceInfo = { ...sourceInfo, width: img.naturalWidth, height: img.naturalHeight }
      sourceImg = img
    }
    img.onerror = () => {
      error = '图片加载失败，请换一张试试'
    }
    img.src = url
  }

  function convert() {
    if (!sourceImg) return
    error = ''
    isConverting = true
    try {
      const canvas = document.createElement('canvas')
      canvas.width = sourceImg.naturalWidth
      canvas.height = sourceImg.naturalHeight
      const ctx = canvas.getContext('2d')
      // JPG 不支持透明通道，先填充白底，避免透明区域变黑
      if (targetFormat === 'jpg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(sourceImg, 0, 0)
      const mime = MIME[targetFormat]
      const q = targetFormat === 'png' ? undefined : quality
      canvas.toBlob((blob) => {
        if (convertedUrl) URL.revokeObjectURL(convertedUrl)
        if (!blob) {
          isConverting = false
          error = `当前浏览器不支持导出 ${targetFormat.toUpperCase()} 格式，请换其他格式试试`
          return
        }
        convertedBlob = blob
        convertedUrl = URL.createObjectURL(blob)
        convertedSize = blob.size
        convertedReady = true
        isConverting = false
      }, mime, q)
    } catch (e) {
      isConverting = false
      error = '转换失败：' + (e?.message || '未知错误')
    }
  }

  function setFormat(f) {
    if (targetFormat === f) return
    targetFormat = f
    // 仅点击“开始转换”才执行转换；切换格式后旧结果已失效
    revokeConverted()
  }

  function onQualityInput(e) {
    quality = Number(e.target.value) / 100
    revokeConverted()
  }

  function download() {
    if (!convertedBlob) return
    const a = document.createElement('a')
    a.href = convertedUrl
    a.download = outputName()
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function resetAll() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    sourceFile = null
    sourceUrl = ''
    sourceImg = null
    sourceInfo = { name: '', width: 0, height: 0, size: 0 }
    revokeConverted()
    error = ''
    targetFormat = 'png'
    quality = 0.92
  }

  function onFileInput(e) {
    const f = e.target.files?.[0]
    if (f) loadFile(f)
    e.target.value = ''
  }

  function onDragEnter(e) {
    e.preventDefault()
    dragCounter++
    isDragging = true
  }
  function onDragOver(e) {
    e.preventDefault()
  }
  function onDragLeave(e) {
    e.preventDefault()
    dragCounter--
    if (dragCounter <= 0) {
      dragCounter = 0
      isDragging = false
    }
  }
  function onDrop(e) {
    e.preventDefault()
    dragCounter = 0
    isDragging = false
    const f = e.dataTransfer?.files?.[0]
    if (f) loadFile(f)
  }

  function onPaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const it of items) {
      if (it.kind === 'file' && it.type.startsWith('image/')) {
        const f = it.getAsFile()
        if (f) {
          loadFile(f)
          break
        }
      }
    }
  }

  function onZoneKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInput.click()
    }
  }

  onMount(() => {
    window.addEventListener('paste', onPaste)
  })

  onDestroy(() => {
    window.removeEventListener('paste', onPaste)
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
  })
</script>

<div class="convert-page">
  <div class="top-bar">
    <button class="back-btn" onclick={onBack} aria-label="返回首页">
      <i class="fa-solid fa-arrow-left"></i>
      <span>返回</span>
    </button>
    <div class="page-title">
      <h1>图片格式转换</h1>
      <p>上传或粘贴图片，一键转换为 PNG / JPG / WebP</p>
    </div>
  </div>

  {#if error}
    <div class="error-banner" transition:fade={{ duration: 200 }}>
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>{error}</span>
    </div>
  {/if}

  <div class="grid">
    <!-- 输入卡片 -->
    <section class="card">
      <div class="card-head">
        <span class="card-title"><i class="fa-solid fa-file-import"></i> 选择图片</span>
      </div>

      {#if !sourceImg}
        <div
          class="dropzone"
          class:dragging={isDragging}
          role="button"
          tabindex="0"
          aria-label="点击或拖拽上传图片，也支持 Ctrl+V 粘贴"
          onclick={() => fileInput.click()}
          onkeydown={onZoneKey}
          ondragenter={onDragEnter}
          ondragover={onDragOver}
          ondragleave={onDragLeave}
          ondrop={onDrop}
        >
          <div class="dz-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
          <p class="dz-main">点击选择，或将图片拖拽到此处</p>
          <p class="dz-sub">也支持 <kbd>Ctrl</kbd> + <kbd>V</kbd> 直接粘贴截图</p>
          <button
            class="browse-btn"
            onclick={(e) => {
              e.stopPropagation()
              fileInput.click()
            }}>选择文件</button
          >
        </div>
        <input bind:this={fileInput} type="file" accept="image/*" class="hidden-input" onchange={onFileInput} />
      {:else}
        <div class="preview-block" transition:fade={{ duration: 200 }}>
          <div class="preview-img-wrap">
            <img src={sourceUrl} alt="原始图片预览" class="preview-img" />
          </div>
          <div class="preview-meta">
            <div class="meta-row"><span>文件名</span><b>{sourceInfo.name}</b></div>
            <div class="meta-row"><span>尺寸</span><b>{sourceInfo.width} × {sourceInfo.height}</b></div>
            <div class="meta-row"><span>大小</span><b>{formatBytes(sourceInfo.size)}</b></div>
          </div>
          <button class="ghost-btn" onclick={resetAll}><i class="fa-solid fa-rotate-left"></i> 重新选择</button>
        </div>
      {/if}
    </section>

    <!-- 选项卡片 -->
    <section class="card">
      <div class="card-head">
        <span class="card-title"><i class="fa-solid fa-sliders"></i> 转换设置</span>
      </div>

      <div class="field">
        <span class="field-label">目标格式</span>
        <div class="segmented" role="group" aria-label="目标格式">
          {#each FORMATS as f}
            <button class="seg-btn" class:active={targetFormat === f.value} onclick={() => setFormat(f.value)}>
              <span class="seg-label">{f.label}</span>
              <span class="seg-note">{f.note}</span>
            </button>
          {/each}
          <div class="seg-indicator" style="transform: translateX({formatIndex * 100}%)"></div>
        </div>
      </div>

      {#if isLossy}
        <div class="field" transition:fade={{ duration: 200 }}>
          <label class="field-label" for="quality-range">质量 <b>{Math.round(quality * 100)}%</b></label>
          <input
            type="range"
            id="quality-range"
            min="50"
            max="100"
            step="1"
            value={Math.round(quality * 100)}
            oninput={onQualityInput}
            class="quality-range"
          />
          <p class="field-hint">质量越高，文件越大、画质越好</p>
        </div>
      {/if}

      <button class="primary-btn" disabled={!sourceImg || isConverting} onclick={convert}>
        {#if isConverting}
          <i class="fa-solid fa-spinner fa-spin"></i> 转换中…
        {:else}
          <i class="fa-solid fa-wand-magic-sparkles"></i> {convertedReady ? '重新转换' : '开始转换'}
        {/if}
      </button>
    </section>
  </div>

  <!-- 结果卡片 -->
  {#if convertedReady}
    <section class="card result-card" transition:fly={{ y: 16, duration: 300 }}>
      <div class="card-head">
        <span class="card-title"><i class="fa-solid fa-circle-check"></i> 转换完成</span>
      </div>
      <div class="result-body">
        <div class="preview-img-wrap result-preview">
          <img src={convertedUrl} alt="转换结果预览" class="preview-img" />
        </div>
        <div class="result-meta">
          <div class="meta-row"><span>输出格式</span><b>{targetFormat.toUpperCase()}</b></div>
          <div class="meta-row"><span>输出大小</span><b>{formatBytes(convertedSize)}</b></div>
          {#if savingPercent !== null}
            <div class="meta-row save"><span>体积节省</span><b>{savingPercent}%</b></div>
          {/if}
          <button class="primary-btn download-btn" onclick={download}>
            <i class="fa-solid fa-download"></i> 下载 {outputName()}
          </button>
        </div>
      </div>
    </section>
  {/if}

  <footer class="convert-footer">© 2026 flygeon. All rights reserved.</footer>
</div>

<style>
  .convert-page {
    position: relative;
    z-index: 2;
    max-width: 880px;
    margin: 0 auto;
    padding: 56px 20px 40px;
    min-height: 100vh;
    animation: fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .top-bar {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 14px;
    background-color: #111111;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #dddddd;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    font-family: inherit;
  }

  .back-btn:hover {
    background-color: #222222;
    border-color: #666666;
    color: #ffffff;
    transform: scale(1.05);
  }

  .page-title h1 {
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .page-title p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    margin-top: 4px;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .card-head {
    margin-bottom: 16px;
  }

  .card-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .card-title i {
    color: #888888;
    font-size: 13px;
  }

  .dropzone {
    border: 1.5px dashed #3a3a3a;
    border-radius: 14px;
    padding: 36px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: rgba(17, 17, 17, 0.35);
  }

  .dropzone:hover,
  .dropzone:focus-visible {
    border-color: #777777;
    background-color: rgba(34, 34, 34, 0.5);
    outline: none;
  }

  .dropzone.dragging {
    border-color: #ffffff;
    background-color: rgba(255, 255, 255, 0.06);
    transform: scale(1.01);
  }

  .dz-icon {
    font-size: 34px;
    color: #888888;
    margin-bottom: 12px;
  }

  .dz-main {
    font-size: 14px;
    color: #cccccc;
    margin-bottom: 6px;
  }

  .dz-sub {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 16px;
  }

  kbd {
    background-color: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 5px;
    padding: 1px 6px;
    font-size: 11px;
    font-family: inherit;
    color: #dddddd;
  }

  .browse-btn {
    display: inline-block;
    height: 36px;
    padding: 0 20px;
    background-color: #ffffff;
    color: #0a0a0a;
    border: none;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
  }

  .browse-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.12);
  }

  .hidden-input {
    display: none;
  }

  .preview-block {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .preview-img-wrap {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background-color: #111111;
    border: 1px solid #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    max-height: 280px;
  }

  .preview-img {
    max-width: 100%;
    max-height: 280px;
    object-fit: contain;
    display: block;
  }

  .preview-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    padding: 7px 0;
    border-bottom: 1px solid #1f1f1f;
  }

  .meta-row:last-child {
    border-bottom: none;
  }

  .meta-row b {
    color: #ffffff;
    font-weight: 600;
    word-break: break-all;
    text-align: right;
  }

  .meta-row.save b {
    color: #6ee7a8;
  }

  .ghost-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 14px;
    background: none;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #bbbbbb;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .ghost-btn:hover {
    border-color: #666666;
    color: #ffffff;
  }

  .field {
    margin-bottom: 20px;
  }

  .field-label {
    display: block;
    font-size: 13px;
    color: #cccccc;
    margin-bottom: 10px;
  }

  .field-label b {
    color: #ffffff;
  }

  .field-hint {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 8px;
  }

  .segmented {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 4px;
  }

  .seg-btn {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    background: none;
    border: none;
    border-radius: 9px;
    color: #888888;
    cursor: pointer;
    transition: color 0.25s ease;
    font-family: inherit;
  }

  .seg-btn.active {
    color: #ffffff;
  }

  .seg-label {
    font-size: 13px;
    font-weight: 600;
  }

  .seg-note {
    font-size: 10px;
    opacity: 0.7;
  }

  .seg-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc((100% - 8px) / 3);
    height: calc(100% - 8px);
    background-color: #2a2a2a;
    border-radius: 9px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .quality-range {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: #333333;
    outline: none;
  }

  .quality-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  }

  .quality-range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
  }

  .primary-btn {
    width: 100%;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #ffffff;
    color: #0a0a0a;
    border: none;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
  }

  .primary-btn:hover:not(:disabled) {
    transform: scale(1.03);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.14);
  }

  .primary-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .primary-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: #555555;
    color: #aaaaaa;
  }

  .result-card {
    margin-bottom: 20px;
  }

  .result-body {
    display: flex;
    gap: 20px;
  }

  .result-preview {
    flex-shrink: 0;
    width: 220px;
    max-height: 220px;
  }

  .result-preview .preview-img {
    max-height: 220px;
  }

  .result-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .download-btn {
    margin-top: 14px;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background-color: rgba(220, 60, 60, 0.12);
    border: 1px solid rgba(220, 80, 80, 0.4);
    border-radius: 12px;
    color: #ff9a9a;
    font-size: 13px;
  }

  .convert-footer {
    text-align: center;
    color: #555555;
    font-size: 13px;
    margin-top: 30px;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 720px) {
    .convert-page {
      padding: 40px 16px 30px;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .page-title h1 {
      font-size: 22px;
    }

    .top-bar {
      flex-direction: column;
      gap: 12px;
    }

    .result-body {
      flex-direction: column;
    }

    .result-preview {
      width: 100%;
    }
  }
</style>
