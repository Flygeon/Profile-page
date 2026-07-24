'use client'

import { useEffect, useRef } from 'react'

interface Petal {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  rotationSpeed: number
  drift: number
}

export default function CherryBlossom() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const petals: Petal[] = []
    const petalCount = 60

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        drift: Math.sin(Math.random() * Math.PI * 2) * 0.5,
      })
    }

    const drawPetal = (petal: Petal) => {
      ctx.save()
      ctx.translate(petal.x, petal.y)
      ctx.rotate(petal.rotation)
      ctx.globalAlpha = petal.opacity

      ctx.beginPath()
      ctx.moveTo(0, -petal.size)
      ctx.quadraticCurveTo(petal.size * 0.5, -petal.size * 0.3, 0, 0)
      ctx.quadraticCurveTo(-petal.size * 0.5, -petal.size * 0.3, 0, -petal.size)

      const gradient = ctx.createLinearGradient(0, -petal.size, 0, 0)
      gradient.addColorStop(0, '#ffb7c5')
      gradient.addColorStop(1, '#ffc0cb')
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      petals.forEach((petal) => {
        petal.y += petal.speed
        petal.x += Math.sin(petal.y * 0.01) * petal.drift
        petal.rotation += petal.rotationSpeed

        if (petal.y > canvas.height) {
          petal.y = -petal.size
          petal.x = Math.random() * canvas.width
        }

        drawPetal(petal)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-1"
    />
  )
}
