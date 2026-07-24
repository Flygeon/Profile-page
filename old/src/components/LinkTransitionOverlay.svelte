<script>
  export let open = false
  export let title = ''
  export let host = ''
  export let url = ''
  export let delayMs = 1000
  export let particleCount = 24

  function formatDelay(ms) {
    const seconds = ms / 1000
    return Number.isInteger(seconds) ? `${seconds}` : seconds.toFixed(1)
  }

  $: particles = Array.from({ length: particleCount }, (_, index) => {
    const angle = (index / particleCount) * Math.PI * 2
    const radius = 30 + (index % 3) * 18
    return {
      x: `${50 + Math.cos(angle) * radius * 0.3}%`,
      y: `${50 + Math.sin(angle) * radius * 0.3}%`,
      size: 1 + (index % 3),
      delay: `${(index % 8) * 0.15}s`,
      duration: `${2 + (index % 4)}s`
    }
  })
</script>

<div class="transition-overlay" class:open={open} aria-hidden={!open} role="status" aria-live="polite">
  <div class="transition-bg-grid"></div>
  <div class="transition-scanner"></div>

  <div class="particle-layer" aria-hidden="true">
    {#each particles as particle}
      <span
        class="particle"
        style={`
          left: ${particle.x};
          top: ${particle.y};
          width: ${particle.size}px;
          height: ${particle.size}px;
          animation-delay: ${particle.delay};
          animation-duration: ${particle.duration};
        `}
      ></span>
    {/each}
  </div>

  <div class="transition-shell">
    <div class="loading-ring" aria-hidden="true">
      <div class="ring-segment ring-segment-a"></div>
      <div class="ring-segment ring-segment-b"></div>
      <div class="ring-core"></div>
    </div>

    <div class="transition-copy">
      <p class="eyebrow">正在前往</p>
      <h2>跳转中</h2>
      <p class="target-name">{title}</p>
      <p class="target-host">{host}</p>
      <p class="target-url">{url}</p>
      <p class="countdown">{formatDelay(delayMs)} 秒后跳转</p>
    </div>
  </div>

  <div class="transition-bar">
    <div class="transition-bar-fill"></div>
  </div>
</div>

<style>
  .transition-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #0a0a0a;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 220ms ease, visibility 220ms ease;
  }

  .transition-overlay.open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  /* ===== 背景网格 ===== */
  .transition-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(circle at center, black 0, black 25%, transparent 70%);
    -webkit-mask-image: radial-gradient(circle at center, black 0, black 25%, transparent 70%);
    animation: gridDrift 30s linear infinite;
  }

  /* ===== 扫描线 ===== */
  .transition-scanner {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(255, 255, 255, 0.015) 45%,
      rgba(255, 255, 255, 0.04) 50%,
      rgba(255, 255, 255, 0.015) 55%,
      transparent 100%
    );
    transform: translateY(-100%);
    animation: scanner 3.5s ease-in-out infinite;
    pointer-events: none;
  }

  /* ===== 粒子层 ===== */
  .particle-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    animation-name: floatParticle, fadeParticle;
    animation-timing-function: ease-in-out, ease-in-out;
    animation-iteration-count: infinite, infinite;
  }

  /* ===== 内容容器 ===== */
  .transition-shell {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 32px 20px;
    gap: 28px;
    z-index: 1;
  }

  /* ===== 加载环 ===== */
  .loading-ring {
    position: relative;
    width: min(28vw, 200px);
    aspect-ratio: 1;
    display: grid;
    place-items: center;
  }

  .ring-segment {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid transparent;
    animation: spin 2s linear infinite;
  }

  .ring-segment-a {
    border-top-color: rgba(255, 255, 255, 0.3);
    border-right-color: rgba(255, 255, 255, 0.12);
    animation-duration: 2.4s;
  }

  .ring-segment-b {
    inset: 18%;
    border-bottom-color: rgba(255, 255, 255, 0.2);
    border-left-color: rgba(255, 255, 255, 0.08);
    animation-duration: 1.8s;
    animation-direction: reverse;
  }

  .ring-core {
    width: 32%;
    height: 32%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    animation: corePulse 1.6s ease-in-out infinite;
  }

  /* ===== 文字 ===== */
  .transition-copy {
    position: relative;
    max-width: min(92vw, 620px);
    text-align: center;
    display: grid;
    gap: 8px;
    padding: 0 20px;
  }

  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.35em;
    color: #666666;
    margin-bottom: 2px;
  }

  h2 {
    font-size: clamp(16px, 2.5vw, 20px);
    font-weight: 500;
    color: #999999;
    margin: 0;
  }

  .target-name {
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.02em;
    word-break: break-word;
    line-height: 1.2;
  }

  .target-host {
    font-size: 14px;
    color: #888888;
    word-break: break-word;
  }

  .target-url {
    font-size: 11px;
    color: #555555;
    word-break: break-all;
  }

  .countdown {
    margin-top: 6px;
    font-size: 13px;
    color: #555555;
    font-variant-numeric: tabular-nums;
  }

  /* ===== 底部加载条 ===== */
  .transition-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(255, 255, 255, 0.04);
  }

  .transition-bar-fill {
    height: 100%;
    width: 0;
    background: rgba(255, 255, 255, 0.15);
    animation: loadBar 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* ===== 动画 ===== */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes corePulse {
    0%, 100% {
      transform: scale(0.9);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  @keyframes scanner {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    50% {
      transform: translateY(100vh);
      opacity: 1;
    }
    65% {
      opacity: 0;
    }
    100% {
      transform: translateY(100vh);
      opacity: 0;
    }
  }

  @keyframes gridDrift {
    from { background-position: 0 0, 0 0; }
    to { background-position: 64px 64px, 64px 64px; }
  }

  @keyframes floatParticle {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(10px, -16px); }
  }

  @keyframes fadeParticle {
    0%, 100% { opacity: 0; }
    30% { opacity: 0.6; }
    70% { opacity: 0.6; }
  }

  @keyframes loadBar {
    from { width: 0; }
    to { width: 100%; }
  }

  /* ===== 响应式 ===== */
  @media (max-width: 768px) {
    .transition-shell {
      gap: 24px;
      padding: 24px 16px;
    }

    .loading-ring {
      width: min(50vw, 160px);
    }

    .eyebrow {
      letter-spacing: 0.2em;
    }

    .target-host {
      font-size: 13px;
    }

    .target-url {
      font-size: 10px;
    }

    .countdown {
      font-size: 12px;
    }
  }
</style>
