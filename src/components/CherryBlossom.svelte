<script>
  import { onMount, onDestroy } from 'svelte'

  export let enabled = true

  // 配置参数
  const CONFIG = {
    MAX_PETALS: 40,            // 最大花瓣数量（花瓣比雪花大，数量少些视觉更干净）
    PETAL_SIZE_MIN: 6,         // 最小花瓣尺寸
    PETAL_SIZE_MAX: 14,        // 最大花瓣尺寸
    FALL_SPEED_MIN: 4,         // 最小飘落速度（秒/屏）
    FALL_SPEED_MAX: 10,        // 最大飘落速度（秒/屏）
    ROTATION_MIN: -45,         // 最小旋转角度
    ROTATION_MAX: 45,          // 最大旋转角度
    SWAY_AMPLITUDE: 60,        // 摆动幅度
    SWAY_SPEED: 0.012,         // 摆动速度
    LOW_END_THRESHOLD: 18,     // 低端设备花瓣数量阈值
  }

  // 樱花颜色调色板
  const SAKURA_COLORS = [
    { fill: 'rgba(255, 182, 193, 0.85)', stroke: 'rgba(255, 150, 170, 0.6)' },   // 浅粉
    { fill: 'rgba(255, 160, 180, 0.8)',  stroke: 'rgba(240, 140, 160, 0.5)' },   // 粉红
    { fill: 'rgba(252, 200, 210, 0.85)', stroke: 'rgba(240, 175, 190, 0.5)' },   // 淡粉
    { fill: 'rgba(255, 140, 165, 0.7)',  stroke: 'rgba(235, 120, 150, 0.5)' },   // 深粉
    { fill: 'rgba(255, 210, 220, 0.8)',  stroke: 'rgba(245, 190, 200, 0.5)' },   // 粉白
  ]

  let canvas
  let ctx
  let animationId
  let petals = []
  let width = 0
  let height = 0
  let isLowEnd = false

  // 检测低端设备
  function detectLowEnd() {
    const cores = navigator.hardwareConcurrency || 4
    const memory = navigator.deviceMemory || 4
    return cores <= 2 || memory <= 2
  }

  // 樱花花瓣类
  class Petal {
    constructor() {
      this.reset(true)
    }

    reset(initial = false) {
      this.x = Math.random() * width
      this.y = initial ? Math.random() * height : -20
      this.size = CONFIG.PETAL_SIZE_MIN + Math.random() * (CONFIG.PETAL_SIZE_MAX - CONFIG.PETAL_SIZE_MIN)
      this.speed = (height / (CONFIG.FALL_SPEED_MIN + Math.random() * (CONFIG.FALL_SPEED_MAX - CONFIG.FALL_SPEED_MIN))) / 60
      this.rotation = Math.random() * 360
      this.rotationSpeed = (Math.random() - 0.5) * 2
      this.swayOffset = Math.random() * Math.PI * 2
      this.swaySpeed = CONFIG.SWAY_SPEED + Math.random() * 0.005
      this.opacity = 0.4 + Math.random() * 0.5
      this.colorIndex = Math.floor(Math.random() * SAKURA_COLORS.length)
      // 花瓣形态：0=标准五瓣, 1=简单椭圆, 2=心形变异
      this.shape = Math.floor(Math.random() * 3)
      // 水平漂移系数，产生自然风感
      this.driftX = (Math.random() - 0.5) * 0.5
    }

    update() {
      this.y += this.speed
      // 水平摆动 + 自然漂移
      this.x += Math.sin(this.swayOffset) * CONFIG.SWAY_AMPLITUDE * 0.006 + this.driftX * 0.3
      this.rotation += this.rotationSpeed
      this.swayOffset += this.swaySpeed

      // 超出视口时回收
      if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
        this.reset()
      }
    }

    draw(ctx) {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.globalAlpha = this.opacity

      const color = SAKURA_COLORS[this.colorIndex]

      if (this.shape === 0) {
        this.drawFivePetals(ctx, color)
      } else if (this.shape === 1) {
        this.drawEllipse(ctx, color)
      } else {
        this.drawSimplePetal(ctx, color)
      }

      ctx.restore()
    }

    // 标准五瓣樱花
    drawFivePetals(ctx, color) {
      const r = this.size * 0.5
      ctx.fillStyle = color.fill
      ctx.strokeStyle = color.stroke
      ctx.lineWidth = 0.5

      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
        ctx.beginPath()
        // 花瓣：从中心延伸的贝塞尔曲线
        const cx = Math.cos(angle) * r * 0.3
        const cy = Math.sin(angle) * r * 0.3
        const ex = Math.cos(angle) * r
        const ey = Math.sin(angle) * r
        const cp1x = Math.cos(angle - 0.5) * r * 0.6
        const cp1y = Math.sin(angle - 0.5) * r * 0.6
        const cp2x = Math.cos(angle + 0.5) * r * 0.6
        const cp2y = Math.sin(angle + 0.5) * r * 0.6

        ctx.moveTo(cx, cy)
        ctx.bezierCurveTo(cp1x, cp1y, ex, ey, cp2x, cp2y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }

      // 花蕊中心点
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 200, 150, 0.6)'
      ctx.fill()
    }

    // 椭圆花瓣（简化性能优化）
    drawEllipse(ctx, color) {
      ctx.fillStyle = color.fill
      ctx.strokeStyle = color.stroke
      ctx.lineWidth = 0.5

      ctx.beginPath()
      ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // 中心细纹
      ctx.beginPath()
      ctx.moveTo(-this.size * 0.3, 0)
      ctx.lineTo(this.size * 0.3, 0)
      ctx.strokeStyle = 'rgba(255, 150, 170, 0.3)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // 简洁单瓣
    drawSimplePetal(ctx, color) {
      const r = this.size * 0.5
      ctx.fillStyle = color.fill
      ctx.strokeStyle = color.stroke
      ctx.lineWidth = 0.5

      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.bezierCurveTo(r, -r * 0.5, r, r * 0.5, 0, r)
      ctx.bezierCurveTo(-r, r * 0.5, -r, -r * 0.5, 0, -r)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // 中心线
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.5)
      ctx.lineTo(0, r * 0.5)
      ctx.strokeStyle = 'rgba(255, 150, 170, 0.25)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }

  // 初始化花瓣池
  function initPetals() {
    const count = isLowEnd ? CONFIG.LOW_END_THRESHOLD : CONFIG.MAX_PETALS
    petals = []
    for (let i = 0; i < count; i++) {
      petals.push(new Petal())
    }
  }

  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, width, height)

    if (enabled) {
      for (let i = 0; i < petals.length; i++) {
        petals[i].update()
        petals[i].draw(ctx)
      }
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
    canvas = document.getElementById('cherryblossom-canvas')
    ctx = canvas.getContext('2d', { alpha: true })

    isLowEnd = detectLowEnd()

    handleResize()
    initPetals()
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
  id="cherryblossom-canvas"
  class="cherryblossom-canvas"
></canvas>

<style>
  .cherryblossom-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .cherryblossom-canvas {
      z-index: 1;
    }
  }
</style>
