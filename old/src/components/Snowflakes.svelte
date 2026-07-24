<script>
  import { onMount, onDestroy } from 'svelte'

  export let enabled = true

  // 配置参数
  const CONFIG = {
    MAX_FLAKES: 60,           // 最大雪花数量
    FLAKE_SIZE_MIN: 2,        // 最小雪花尺寸
    FLAKE_SIZE_MAX: 8,        // 最大雪花尺寸
    FALL_SPEED_MIN: 3,        // 最小飘落速度（秒/屏）
    FALL_SPEED_MAX: 7,        // 最大飘落速度（秒/屏）
    ROTATION_MIN: -30,        // 最小旋转角度
    ROTATION_MAX: 30,         // 最大旋转角度
    SWAY_AMPLITUDE: 40,       // 摆动幅度
    SWAY_SPEED: 0.015,        // 摆动速度
    LOW_END_THRESHOLD: 25,    // 低端设备雪花数量阈值
  }

  let canvas
  let ctx
  let animationId
  let flakes = []
  let width = 0
  let height = 0
  let isLowEnd = false

  // 检测低端设备
  function detectLowEnd() {
    const cores = navigator.hardwareConcurrency || 4
    const memory = navigator.deviceMemory || 4
    return cores <= 2 || memory <= 2
  }

  // 雪花类
  class Snowflake {
    constructor() {
      this.reset(true)
    }

    reset(initial = false) {
      this.x = Math.random() * width
      this.y = initial ? Math.random() * height : -10
      this.size = CONFIG.FLAKE_SIZE_MIN + Math.random() * (CONFIG.FLAKE_SIZE_MAX - CONFIG.FLAKE_SIZE_MIN)
      this.speed = (height / (CONFIG.FALL_SPEED_MIN + Math.random() * (CONFIG.FALL_SPEED_MAX - CONFIG.FALL_SPEED_MIN))) / 60
      this.rotation = Math.random() * 360
      this.rotationSpeed = (Math.random() - 0.5) * 1.5
      this.swayOffset = Math.random() * Math.PI * 2
      this.opacity = 0.3 + Math.random() * 0.5
      this.isCrystal = this.size > 4  // 大片雪花绘制为六角结晶形状
    }

    update() {
      this.y += this.speed
      this.x += Math.sin(this.swayOffset) * CONFIG.SWAY_AMPLITUDE * 0.008
      this.rotation += this.rotationSpeed
      this.swayOffset += CONFIG.SWAY_SPEED

      // 超出视口时回收
      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset()
      }
    }

    draw(ctx) {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.globalAlpha = this.opacity

      if (this.isCrystal) {
        this.drawCrystal(ctx)
      } else {
        this.drawDot(ctx)
      }

      ctx.restore()
    }

    // 小雪花：圆形点
    drawDot(ctx) {
      ctx.beginPath()
      ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fill()
    }

    // 大雪花：六角结晶形状
    drawCrystal(ctx) {
      const armLen = this.size * 0.6
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.lineWidth = Math.max(1, this.size * 0.15)
      ctx.lineCap = 'round'

      // 绘制六臂
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        ctx.beginPath()
        ctx.moveTo(0, 0)
        const ex = Math.cos(angle) * armLen
        const ey = Math.sin(angle) * armLen
        ctx.lineTo(ex, ey)
        ctx.stroke()

        // 较大雪花的臂上带小分支
        if (this.size > 5.5) {
          const branchLen = armLen * 0.35
          const midX = Math.cos(angle) * armLen * 0.5
          const midY = Math.sin(angle) * armLen * 0.5
          for (let side = -1; side <= 1; side += 2) {
            const branchAngle = angle + side * (Math.PI / 4)
            ctx.beginPath()
            ctx.moveTo(midX, midY)
            ctx.lineTo(
              midX + Math.cos(branchAngle) * branchLen,
              midY + Math.sin(branchAngle) * branchLen
            )
            ctx.stroke()
          }
        }
      }
    }
  }

  // 初始化雪花池
  function initFlakes() {
    const count = isLowEnd ? CONFIG.LOW_END_THRESHOLD : CONFIG.MAX_FLAKES
    flakes = []
    for (let i = 0; i < count; i++) {
      flakes.push(new Snowflake())
    }
  }

  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, width, height)

    if (enabled) {
      flakes.forEach(flake => {
        flake.update()
        flake.draw(ctx)
      })
    }

    animationId = requestAnimationFrame(animate)
  }

  // 处理窗口大小变化
  function handleResize() {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }

  onMount(() => {
    canvas = document.getElementById('snowflakes-canvas')
    ctx = canvas.getContext('2d', { alpha: true })

    isLowEnd = detectLowEnd()

    handleResize()
    initFlakes()
    animate()

    window.addEventListener('resize', handleResize)
  })

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    window.removeEventListener('resize', handleResize)
  })
</script>

<canvas
  id="snowflakes-canvas"
  class="snowflakes-canvas"
></canvas>

<style>
  .snowflakes-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .snowflakes-canvas {
      z-index: 1;
    }
  }
</style>
