<script>
  import { onMount, onDestroy } from 'svelte'

  export let enabled = true

  // 配置参数
  const CONFIG = {
    MAX_PETALS: 50,           // 最大花瓣数量
    PETAL_SIZE_MIN: 8,        // 最小花瓣尺寸
    PETAL_SIZE_MAX: 15,       // 最大花瓣尺寸
    FALL_SPEED_MIN: 2,        // 最小飘落速度（秒/屏）
    FALL_SPEED_MAX: 5,        // 最大飘落速度（秒/屏）
    ROTATION_MIN: -15,        // 最小旋转角度
    ROTATION_MAX: 15,         // 最大旋转角度
    SWAY_AMPLITUDE: 30,       // 摆动幅度
    SWAY_SPEED: 0.02,         // 摆动速度
    LOW_END_THRESHOLD: 20,    // 低端设备花瓣数量阈值
  }

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

  // 花瓣类
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
      this.opacity = 0.4 + Math.random() * 0.4
      this.color = this.getRandomColor()
    }

    getRandomColor() {
      const colors = [
        'rgba(255, 183, 197,',  // 粉色
        'rgba(255, 200, 210,',  // 浅粉
        'rgba(255, 220, 230,',  // 淡粉
        'rgba(255, 240, 245,',  // 近白
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    update() {
      this.y += this.speed
      this.x += Math.sin(this.swayOffset) * CONFIG.SWAY_AMPLITUDE * 0.01
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
      ctx.fillStyle = this.color + this.opacity + ')'

      // 绘制五瓣樱花形状
      const petalCount = 5
      for (let i = 0; i < petalCount; i++) {
        ctx.save()
        ctx.rotate((i * Math.PI * 2) / petalCount)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.bezierCurveTo(
          this.size * 0.2, -this.size * 0.4,
          this.size * 0.6, -this.size * 0.5,
          this.size * 0.5, 0
        )
        ctx.bezierCurveTo(
          this.size * 0.6, this.size * 0.15,
          this.size * 0.2, this.size * 0.1,
          0, 0
        )
        ctx.fill()
        ctx.restore()
      }

      // 花心
      ctx.beginPath()
      ctx.arc(0, 0, this.size * 0.12, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 200, 150, ' + this.opacity + ')'
      ctx.fill()

      ctx.restore()
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
      petals.forEach(petal => {
        petal.update()
        petal.draw(ctx)
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
    canvas = document.getElementById('cherry-blossom-canvas')
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
  id="cherry-blossom-canvas"
  class="cherry-blossom-canvas"
></canvas>

<style>
  .cherry-blossom-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .cherry-blossom-canvas {
      z-index: 1;
    }
  }
</style>
