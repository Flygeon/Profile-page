<script>
  import { onMount, onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'

  let { onBack = () => {} } = $props()

  const LS_KEY = 'lottery_options'

  // ---- 预设示例场景 ----
  // 每个场景包含清晰的数据结构：id / 名称 / 图标 / 描述 / 选项数组
  const presets = [
    {
      id: 'yesno',
      name: '是否',
      icon: 'fa-solid fa-circle-question',
      desc: '二元决策',
      options: ['是', '否']
    },
    {
      id: 'food',
      name: '吃什么',
      icon: 'fa-solid fa-utensils',
      desc: '日常饮食选择',
      options: [
        '火锅', '烧烤', '日料', '麻辣烫', '汉堡',
        '披萨', '沙拉', '牛肉面', '盖浇饭', '寿司',
        '炸鸡', '煲仔饭', '螺蛳粉', '轻食'
      ]
    },
    {
      id: 'conch',
      name: '神奇海螺',
      icon: 'fa-solid fa-wand-magic-sparkles',
      desc: '趣味问答',
      options: [
        '毫无疑问', '也许吧', '再问问', '我不太确定',
        '绝对不行', '当然可以', '等待时机', '试试看',
        '别想了', '命运如此', '答案在你心中', '今晚不宜'
      ]
    }
  ]

  let optionsText = $state('')
  let result = $state('')
  let rollingText = $state('')
  let isDrawing = $state(false)
  let error = $state('')
  let activePreset = $state('')

  const validOptions = $derived(
    optionsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  )

  let drawTimer = null

  function saveOptions(text) {
    optionsText = text
    try {
      localStorage.setItem(LS_KEY, text)
    } catch {
      /* 忽略存储异常 */
    }
  }

  function onOptionsInput(e) {
    activePreset = ''
    saveOptions(e.target.value)
  }

  function selectPreset(preset) {
    activePreset = preset.id
    saveOptions(preset.options.join('\n'))
    draw()
  }

  function draw() {
    const opts = validOptions
    if (opts.length < 1) {
      error = '请至少输入一个选项'
      return
    }
    error = ''
    result = ''
    if (drawTimer) clearInterval(drawTimer)
    isDrawing = true
    let ticks = 0
    const maxTicks = 14
    drawTimer = setInterval(() => {
      rollingText = opts[Math.floor(Math.random() * opts.length)]
      ticks++
      if (ticks >= maxTicks) {
        clearInterval(drawTimer)
        drawTimer = null
        result = opts[Math.floor(Math.random() * opts.length)]
        isDrawing = false
      }
    }, 60)
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) optionsText = saved
    } catch {
      /* 忽略读取异常 */
    }
  })

  onDestroy(() => {
    if (drawTimer) clearInterval(drawTimer)
  })
</script>

<div class="lottery-page">
  <div class="top-bar">
    <button class="back-btn" onclick={onBack} aria-label="返回首页">
      <i class="fa-solid fa-arrow-left"></i>
      <span>返回</span>
    </button>
    <div class="page-title">
      <h1>随机抽签</h1>
      <p>每行一个选项，公平随机抽取</p>
    </div>
  </div>

  {#if error}
    <div class="error-banner" transition:fly={{ y: 10, duration: 200 }}>
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>{error}</span>
    </div>
  {/if}

  <div class="presets">
    <span class="presets-label">示例场景</span>
    <div class="preset-chips">
      {#each presets as p}
        <button
          class="preset-chip"
          class:active={activePreset === p.id}
          aria-pressed={activePreset === p.id}
          title={p.desc}
          onclick={() => selectPreset(p)}
        >
          <i class={p.icon}></i>
          <span>{p.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="grid">
    <!-- 输入卡片 -->
    <section class="card">
      <div class="card-head">
        <span class="card-title"><i class="fa-solid fa-list-ul"></i> 选项列表</span>
        <span class="opt-count">{validOptions.length} 项</span>
      </div>
      <textarea
        class="opt-input"
        value={optionsText}
        oninput={onOptionsInput}
        spellcheck="false"
        aria-label="抽签选项，每行一个"
        placeholder="每行一个选项，例如：火锅 / 烧烤 / 日料"
      ></textarea>
      <p class="opt-hint">选项会自动保存在本地，下次打开仍在</p>
    </section>

    <!-- 结果卡片 -->
    <section class="card result-card">
      <div class="card-head">
        <span class="card-title">
          <i class="fa-solid fa-dice"></i> 抽取结果
        </span>
      </div>

      <div class="stage" class:drawing={isDrawing}>
        <div class="stage-inner">
          <div class="stage-state" class:hidden={!result}>
            <div class="result-pick">
              <i class="fa-solid fa-check-circle"></i>
              <span class="pick-text">{result}</span>
            </div>
          </div>
          <div class="stage-state" class:hidden={!isDrawing}>
            <div class="rolling-text">{rollingText || '…'}</div>
          </div>
          <div class="stage-state" class:hidden={result || isDrawing}>
            <div class="stage-empty">
              <i class="fa-regular fa-face-smile"></i>
              <p>点击「开始抽取」试试手气</p>
            </div>
          </div>
        </div>
      </div>

      <button class="primary-btn" onclick={draw} disabled={isDrawing || validOptions.length < 1}>
        {#if isDrawing}
          <i class="fa-solid fa-spinner fa-spin"></i> 抽取中…
        {:else if result}
          <i class="fa-solid fa-rotate-right"></i> 再抽一次
        {:else}
          <i class="fa-solid fa-dice"></i> 开始抽取
        {/if}
      </button>
    </section>
  </div>

  <footer class="lottery-footer">© 2026 flygeon. All rights reserved.</footer>
</div>

<style>
  .lottery-page {
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
  }

  .presets {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  .presets-label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.55);
  }

  .preset-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .preset-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 38px;
    padding: 0 16px;
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 999px;
    color: #dddddd;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
  }
  .preset-chip i {
    font-size: 13px;
    color: #888888;
    transition: color 0.25s ease;
  }
  .preset-chip:hover {
    background-color: #222222;
    border-color: #555555;
    color: #ffffff;
    transform: scale(1.04);
  }
  .preset-chip:active {
    transform: scale(0.97);
  }
  .preset-chip.active {
    background-color: #ffffff;
    border-color: #ffffff;
    color: #0a0a0a;
  }
  .preset-chip.active i {
    color: #0a0a0a;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
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

  .opt-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
  }

  .opt-input {
    width: 100%;
    min-height: 280px;
    resize: none;
    background-color: #111111;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 14px;
    color: #e8e8e8;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 14px;
    line-height: 1.7;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .opt-input:focus {
    border-color: #555555;
  }

  .opt-hint {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 10px;
  }

  .result-card {
    display: flex;
    flex-direction: column;
  }

  .stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    border-radius: 12px;
    background-color: #111111;
    border: 1px solid #2a2a2a;
    margin-bottom: 16px;
    padding: 20px;
    text-align: center;
  }
  .stage.drawing {
    border-color: #555555;
  }

  .stage-inner {
    display: grid;
    grid-template: "stack" / 1fr;
    place-items: center;
    width: 100%;
    min-height: 180px;
  }

  .stage-state {
    grid-area: stack;
    width: 100%;
    text-align: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
  }
  .stage-state:not(.hidden) {
    opacity: 1;
    visibility: visible;
  }

  .result-pick {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    gap: 12px;
    color: #6ee7a8;
  }
  .result-pick i {
    font-size: 34px;
  }
  .pick-text {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    word-break: break-word;
    line-height: 1.4;
  }

  .rolling-text {
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #cccccc;
    word-break: break-word;
  }

  .stage-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.35);
  }
  .stage-empty i {
    font-size: 40px;
    opacity: 0.6;
  }
  .stage-empty p {
    font-size: 13px;
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

  .lottery-footer {
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
    .lottery-page {
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
    .opt-input {
      min-height: 200px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lottery-page {
      animation: none;
    }
  }
</style>
