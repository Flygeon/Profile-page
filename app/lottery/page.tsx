'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const LS_KEY = 'lottery_options'

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

export default function LotteryPage() {
  const router = useRouter()
  const [optionsText, setOptionsText] = useState('')
  const [result, setResult] = useState('')
  const [rollingText, setRollingText] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState('')
  const [activePreset, setActivePreset] = useState('')

  const validOptions = optionsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const saveOptions = useCallback((text: string) => {
    setOptionsText(text)
    try {
      localStorage.setItem(LS_KEY, text)
    } catch {
      /* 忽略存储异常 */
    }
  }, [])

  const onOptionsInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setActivePreset('')
    saveOptions(e.target.value)
  }

  const selectPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.id)
    saveOptions(preset.options.join('\n'))
    draw(preset.options)
  }

  const draw = useCallback((overrideOpts?: string[]) => {
    const opts = overrideOpts ?? validOptions
    if (opts.length < 1) {
      setError('请至少输入一个选项')
      return
    }
    setError('')
    setResult('')
    setIsDrawing(true)
    let ticks = 0
    const maxTicks = 14
    const drawTimer = setInterval(() => {
      setRollingText(opts[Math.floor(Math.random() * opts.length)])
      ticks++
      if (ticks >= maxTicks) {
        clearInterval(drawTimer)
        setResult(opts[Math.floor(Math.random() * opts.length)])
        setIsDrawing(false)
      }
    }, 60)
    return () => clearInterval(drawTimer)
  }, [validOptions])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) setOptionsText(saved)
    } catch {
      /* 忽略读取异常 */
    }
  }, [])

  return (
    <div className="lottery-page">
      <div className="top-bar">
        <button className="back-btn" onClick={() => router.push('/')} aria-label="返回首页">
          <i className="fa-solid fa-arrow-left"></i>
          <span>返回</span>
        </button>
        <div className="page-title">
          <h1>随机抽签</h1>
          <p>每行一个选项，公平随机抽取</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="error-banner"
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="presets">
        <span className="presets-label">示例场景</span>
        <div className="preset-chips">
          {presets.map((p) => (
            <button
              key={p.id}
              className={`preset-chip ${activePreset === p.id ? 'active' : ''}`}
              aria-pressed={activePreset === p.id}
              title={p.desc}
              onClick={() => selectPreset(p)}
            >
              <i className={p.icon}></i>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid">
        <section className="card">
          <div className="card-head">
            <span className="card-title"><i className="fa-solid fa-list-ul"></i> 选项列表</span>
            <span className="opt-count">{validOptions.length} 项</span>
          </div>
          <textarea
            className="opt-input"
            value={optionsText}
            onChange={onOptionsInput}
            spellCheck={false}
            aria-label="抽签选项，每行一个"
            placeholder="每行一个选项，例如：火锅 / 烧烤 / 日料"
          />
          <p className="opt-hint">选项会自动保存在本地，下次打开仍在</p>
        </section>

        <section className="card result-card">
          <div className="card-head">
            <span className="card-title">
              <i className="fa-solid fa-dice"></i> 抽取结果
            </span>
          </div>

          <div className={`stage ${isDrawing ? 'drawing' : ''}`}>
            <div className="stage-inner">
              <div className={`stage-state ${result ? '' : 'hidden'}`}>
                <div className="result-pick">
                  <i className="fa-solid fa-check-circle"></i>
                  <span className="pick-text">{result}</span>
                </div>
              </div>
              <div className={`stage-state ${isDrawing ? '' : 'hidden'}`}>
                <div className="rolling-text">{rollingText || '…'}</div>
              </div>
              <div className={`stage-state ${result || isDrawing ? 'hidden' : ''}`}>
                <div className="stage-empty">
                  <i className="fa-regular fa-face-smile"></i>
                  <p>点击「开始抽取」试试手气</p>
                </div>
              </div>
            </div>
          </div>

          <button className="primary-btn" onClick={() => draw()} disabled={isDrawing || validOptions.length < 1}>
            {isDrawing ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> 抽取中…</>
            ) : result ? (
              <><i className="fa-solid fa-rotate-right"></i> 再抽一次</>
            ) : (
              <><i className="fa-solid fa-dice"></i> 开始抽取</>
            )}
          </button>
        </section>
      </div>

      <footer className="lottery-footer">© 2026 flygeon. All rights reserved.</footer>

      <style>{`
        .lottery-page {
          position: relative;
          z-index: 2;
          max-width: 880px;
          margin: 0 auto;
          padding: 56px 20px 40px;
          min-height: 100vh;
          animation: fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .top-bar { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 14px;
          background-color: #111111; border: 1px solid #333333; border-radius: 0;
          color: #dddddd; font-size: 13px; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; font-family: inherit;
        }
        .back-btn:hover { background-color: #222222; border-color: #666666; color: #ffffff; transform: scale(1.05); }
        .page-title h1 { font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
        .page-title p { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .presets { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
        .presets-label { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.55); }
        .preset-chips { display: flex; flex-wrap: wrap; gap: 10px; }
        .preset-chip {
          display: inline-flex; align-items: center; gap: 7px; height: 38px; padding: 0 16px;
          background-color: rgba(26,26,26,0.55); border: 1px solid #2a2a2a; border-radius: 0;
          color: #dddddd; font-size: 13px; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1); font-family: inherit;
        }
        .preset-chip i { font-size: 13px; color: #888888; transition: color 0.25s ease; }
        .preset-chip:hover { background-color: #222222; border-color: #555555; color: #ffffff; transform: scale(1.04); }
        .preset-chip.active { background-color: #ffffff; border-color: #ffffff; color: #0a0a0a; }
        .preset-chip.active i { color: #0a0a0a; }
        .card {
          background-color: rgba(26,26,26,0.55); border: 1px solid #2a2a2a; border-radius: 0;
          padding: 20px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .card-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #ffffff; }
        .card-title i { color: #888888; font-size: 13px; }
        .opt-count { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; }
        .opt-input {
          width: 100%; min-height: 280px; resize: none; background-color: #111111; border: 1px solid #2a2a2a;
          border-radius: 0; padding: 14px; color: #e8e8e8; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 14px; line-height: 1.7; outline: none; transition: border-color 0.2s ease;
        }
        .opt-input:focus { border-color: #555555; }
        .opt-hint { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 10px; }
        .result-card { display: flex; flex-direction: column; }
        .stage {
          flex: 1; display: flex; align-items: center; justify-content: center; min-height: 220px;
          border-radius: 0; background-color: #111111; border: 1px solid #2a2a2a;
          margin-bottom: 16px; padding: 20px; text-align: center;
        }
        .stage.drawing { border-color: #555555; }
        .stage-inner { display: grid; grid-template: "stack" / 1fr; place-items: center; width: 100%; min-height: 180px; }
        .stage-state { grid-area: stack; width: 100%; text-align: center; opacity: 0; visibility: hidden; transition: opacity 0.2s ease; }
        .stage-state:not(.hidden) { opacity: 1; visibility: visible; }
        .result-pick { display: flex; flex-direction: column; align-items: center; width: 100%; box-sizing: border-box; text-align: center; gap: 12px; color: #6ee7a8; }
        .result-pick i { font-size: 34px; }
        .pick-text { font-size: 24px; font-weight: 700; color: #ffffff; word-break: break-word; line-height: 1.4; }
        .rolling-text { width: 100%; box-sizing: border-box; text-align: center; font-size: 22px; font-weight: 600; color: #cccccc; word-break: break-word; }
        .stage-empty { display: flex; flex-direction: column; align-items: center; width: 100%; box-sizing: border-box; text-align: center; gap: 10px; color: rgba(255,255,255,0.35); }
        .stage-empty i { font-size: 40px; opacity: 0.6; }
        .stage-empty p { font-size: 13px; }
        .primary-btn {
          width: 100%; height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background-color: #ffffff; color: #0a0a0a; border: none; border-radius: 0;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); font-family: inherit;
        }
        .primary-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 6px 20px rgba(255,255,255,0.14); }
        .primary-btn:active:not(:disabled) { transform: scale(0.98); }
        .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; background-color: #555555; color: #aaaaaa; }
        .error-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-bottom: 16px; background-color: rgba(220,60,60,0.12); border: 1px solid rgba(220,80,80,0.4); border-radius: 0; color: #ff9a9a; font-size: 13px; }
        .lottery-footer { text-align: center; color: #555555; font-size: 13px; margin-top: 30px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 720px) {
          .lottery-page { padding: 40px 16px 30px; }
          .grid { grid-template-columns: 1fr; }
          .page-title h1 { font-size: 22px; }
          .top-bar { flex-direction: column; gap: 12px; }
          .opt-input { min-height: 200px; }
        }
      `}</style>
    </div>
  )
}