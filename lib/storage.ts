import { setCookie, getCookie } from './cookie'

export interface Settings {
  effectMode: 'fibonacci' | 'snow' | 'sakura' | 'none'
  isDarkMode: boolean
  musicVisible: boolean
  showClock: boolean
  showNotice: boolean
  showCalendar: boolean
  showTodo: boolean
  linkTransitionEnabled: boolean
  clickEffectEnabled: boolean
  live2dEnabled: boolean
}

const DEFAULT_SETTINGS: Settings = {
  effectMode: 'fibonacci',
  isDarkMode: true,
  musicVisible: true,
  showClock: true,
  showNotice: true,
  showCalendar: true,
  showTodo: true,
  linkTransitionEnabled: true,
  clickEffectEnabled: true,
  live2dEnabled: true
}

// 设置变更事件：saveSettings 时派发，供根布局挂载的组件
// （ClickEffect / Live2DWidget 等）跨组件树响应设置面板的开关
export const SETTINGS_EVENT = 'user-settings-changed'

export function getSetting<T>(key: string): T | null {
  try {
    const cookieValue = getCookie(key)
    if (cookieValue) {
      return JSON.parse(cookieValue)
    }
    return null
  } catch {
    return null
  }
}

export function setSetting<T>(key: string, value: T, days: number = 365): void {
  try {
    const jsonValue = JSON.stringify(value)
    setCookie(key, jsonValue, days)
  } catch {
    console.error('Failed to set setting:', key)
  }
}

export function getSettings(): Settings {
  const saved = getSetting<Settings>('user_settings')
  return { ...DEFAULT_SETTINGS, ...saved }
}

export function saveSettings(settings: Settings): void {
  setSetting('user_settings', settings, 365)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<Settings>(SETTINGS_EVENT, { detail: settings }))
  }
}

export function getLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const value = localStorage.getItem(key)
    if (value) {
      return JSON.parse(value)
    }
    return null
  } catch {
    return null
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error('Failed to set localStorage:', key)
  }
}
