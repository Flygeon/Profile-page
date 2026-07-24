'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface WeatherAlert {
  title: string
  type: string
  level: string
}

interface WeatherData {
  province: string
  city: string
  district: string
  weather: string
  temperature: number
  wind_direction: string
  wind_power: string
  humidity: number
  report_time: string
  alerts?: WeatherAlert[]
}

// 天气现象 → Font Awesome 图标
function weatherIcon(w: string): string {
  if (w.includes('雷')) return 'fa-cloud-bolt'
  if (w.includes('雨')) return 'fa-cloud-rain'
  if (w.includes('雪')) return 'fa-snowflake'
  if (w.includes('云') || w.includes('阴')) return 'fa-cloud'
  if (w.includes('雾') || w.includes('霾')) return 'fa-smog'
  return 'fa-sun'
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('https://uapis.cn/api/v1/misc/weather')
      .then((res) => {
        if (!res.ok) throw new Error('请求失败')
        return res.json()
      })
      .then((data: WeatherData) => {
        if (!cancelled) setWeather(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      className="h-full"
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-dark-700/60 border-dark-600 w-full h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-cloud-sun text-neon-cyan"></i>
            <span className="text-xs text-gray-400">天气</span>
          </div>

          {!weather && !error && (
            <div className="text-xs text-gray-500 py-6 text-center">加载中…</div>
          )}
          {error && (
            <div className="text-xs text-gray-500 py-6 text-center">天气加载失败</div>
          )}

          {weather && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-200 truncate">
                    {weather.city} · {weather.district}
                  </span>
                  <span className="text-[10px] text-gray-500">{weather.report_time}</span>
                </div>
                <i className={`fa-solid ${weatherIcon(weather.weather)} text-2xl text-neon-orange`}></i>
              </div>

              <div className="text-3xl font-bold text-white mb-1">{weather.temperature}°</div>
              <div className="text-xs text-gray-400 mb-3">{weather.weather}</div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">湿度</span>
                  <span className="text-gray-400">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">风力</span>
                  <span className="text-gray-400">{weather.wind_direction} {weather.wind_power}</span>
                </div>
              </div>

              {weather.alerts && weather.alerts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-600 space-y-1.5">
                  {weather.alerts.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <i className="fa-solid fa-triangle-exclamation text-neon-orange"></i>
                      <span className="text-gray-400 truncate">{a.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
