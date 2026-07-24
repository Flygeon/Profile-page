'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const FORMATS = [
  { value: 'png' as const, label: 'PNG', note: '无损 · 支持透明' },
  { value: 'jpg' as const, label: 'JPG', note: '有损 · 体积小' },
  { value: 'webp' as const, label: 'WebP', note: '现代 · 高压缩' }
]
const MIME = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }
const EXT = { png: 'png', jpg: 'jpg', webp: 'webp' }

interface SourceInfo {
  name: string
  width: number
  height: number
  size: number
}

export default function ConvertPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpg' | 'webp'>('png')
  const [quality, setQuality] = useState(0.92)
  
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null)
  const [sourceInfo, setSourceInfo] = useState<SourceInfo>({ name: '', width: 0, height: 0, size: 0 })
  
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null)
  const [convertedUrl, setConvertedUrl] = useState('')
  const [convertedSize, setConvertedSize] = useState(0)
  const [convertedReady, setConvertedReady] = useState(false)
  
  const [isConverting, setIsConverting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  
  const dragCounter = useRef(0)

  const isLossy = targetFormat !== 'png'
  const formatIndex = FORMATS.findIndex((f) => f.value === targetFormat)

  const savingPercent = sourceInfo.size && convertedSize
    ? (() => {
        const diff = sourceInfo.size - convertedSize
        return diff > 0 ? Math.round((diff / sourceInfo.size) * 100) : null
      })()
    : null

  const formatBytes = (n: number) => {
    if (n === 0) return '0 B'
    if (!n) return '-'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
    return (n / 1024 / 1024).toFixed(2) + ' MB'
  }

  const outputName = () => {
    const base = (sourceInfo.name || 'image').replace(/\.[^.]+$/, '') || 'image'
    return `${base}.${EXT[targetFormat]}`
  }

  const revokeConverted = useCallback(() => {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setConvertedUrl('')
    setConvertedBlob(null)
    setConvertedSize(0)
    setConvertedReady(false)
  }, [convertedUrl])

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择有效的图片文件')
      return
    }
    setError('')
    revokeConverted()
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)

    setSourceFile(file)
    setSourceInfo({ name: file.name, size: file.size, width: 0, height: 0 })
    const url = URL.createObjectURL(file)
    setSourceUrl(url)

    const img = new Image()
    img.onload = () => {
      setSourceInfo((prev) => ({ ...prev, width: img.naturalWidth, height: img.naturalHeight }))
      setSourceImg(img)
    }
    img.onerror = () => {
      setError('图片加载失败，请换一张试试')
    }
    img.src = url
  }, [revokeConverted, sourceUrl])

  const convert = useCallback(() => {
    if (!sourceImg) return
    setError('')
    setIsConverting(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = sourceImg.naturalWidth
      canvas.height = sourceImg.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建画布')
      
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
          setIsConverting(false)
          setError(`当前浏览器不支持导出 ${targetFormat.toUpperCase()} 格式`)
          return
        }
        setConvertedBlob(blob)
        setConvertedUrl(URL.createObjectURL(blob))
        setConvertedSize(blob.size)
        setConvertedReady(true)
        setIsConverting(false)
      }, mime, q)
    } catch (e) {
      setIsConverting(false)
      setError('转换失败：' + (e as Error).message)
    }
  }, [sourceImg, targetFormat, quality, convertedUrl])

  const setFormat = (f: 'png' | 'jpg' | 'webp') => {
    if (targetFormat === f) return
    setTargetFormat(f)
    revokeConverted()
  }

  const onQualityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuality(Number(e.target.value) / 100)
    revokeConverted()
  }

  const download = () => {
    if (!convertedBlob) return
    const a = document.createElement('a')
    a.href = convertedUrl
    a.download = outputName()
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const resetAll = useCallback(() => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    revokeConverted()
    setSourceFile(null)
    setSourceUrl('')
    setSourceImg(null)
    setSourceInfo({ name: '', width: 0, height: 0, size: 0 })
    setError('')
    setTargetFormat('png')
    setQuality(0.92)
  }, [sourceUrl, revokeConverted])

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) loadFile(f)
    e.target.value = ''
  }

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) loadFile(f)
  }

  const onPaste = (e: ClipboardEvent) => {
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

  useEffect(() => {
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('paste', onPaste)
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)
      if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    }
  }, [sourceUrl, convertedUrl])

  return (
    <div className="convert-page">
      <div className="top-bar">
        <button className="back-btn" onClick={() => router.push('/')} aria-label="返回首页">
          <i className="fa-solid fa-arrow-left"></i>
          <span>返回</span>
        </button>
        <div className="page-title">
          <h1>图片格式转换</h1>
          <p>上传或粘贴图片，一键转换为 PNG / JPG / WebP</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="error-banner"
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid">
        <section className="card">
          <div className="card-head">
            <span className="card-title"><i className="fa-solid fa-file-import"></i> 选择图片</span>
          </div>

          {!sourceImg ? (
            <>
              <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="点击或拖拽上传图片，也支持 Ctrl+V 粘贴"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className="dz-icon"><i className="fa-solid fa-cloud-arrow-up"></i></div>
                <p className="dz-main">点击选择，或将图片拖拽到此处</p>
                <p className="dz-sub">也支持 <kbd>Ctrl</kbd> + <kbd>V</kbd> 直接粘贴截图</p>
                <button
                  className="browse-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >选择文件</button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-input"
                onChange={onFileInput}
              />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="preview-block"
            >
              <div className="preview-img-wrap">
                <img src={sourceUrl} alt="原始图片预览" className="preview-img" />
              </div>
              <div className="preview-meta">
                <div className="meta-row"><span>文件名</span><b>{sourceInfo.name}</b></div>
                <div className="meta-row"><span>尺寸</span><b>{sourceInfo.width} × {sourceInfo.height}</b></div>
                <div className="meta-row"><span>大小</span><b>{formatBytes(sourceInfo.size)}</b></div>
              </div>
              <button className="ghost-btn" onClick={resetAll}><i className="fa-solid fa-rotate-left"></i> 重新选择</button>
            </motion.div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <span className="card-title"><i className="fa-solid fa-sliders"></i> 转换设置</span>
          </div>

          <div className="field">
            <span className="field-label">目标格式</span>
            <div className="segmented" role="group" aria-label="目标格式">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  className={`seg-btn ${targetFormat === f.value ? 'active' : ''}`}
                  onClick={() => setFormat(f.value)}
                >
                  <span className="seg-label">{f.label}</span>
                  <span className="seg-note">{f.note}</span>
                </button>
              ))}
              <div className="seg-indicator" style={{ transform: `translateX(${formatIndex * 100}%)` }}></div>
            </div>
          </div>

          {isLossy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="field"
            >
              <label className="field-label" htmlFor="quality-range">质量 <b>{Math.round(quality * 100)}%</b></label>
              <input
                type="range"
                id="quality-range"
                min="50"
                max="100"
                step="1"
                value={Math.round(quality * 100)}
                onChange={onQualityInput}
                className="quality-range"
              />
              <p className="field-hint">质量越高，文件越大、画质越好</p>
            </motion.div>
          )}

          <button className="primary-btn" disabled={!sourceImg || isConverting} onClick={convert}>
            {isConverting ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> 转换中…</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles"></i> {convertedReady ? '重新转换' : '开始转换'}</>
            )}
          </button>
        </section>
      </div>

      <AnimatePresence>
        {convertedReady && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="card result-card"
          >
            <div className="card-head">
              <span className="card-title"><i className="fa-solid fa-circle-check"></i> 转换完成</span>
            </div>
            <div className="result-body">
              <div className="preview-img-wrap result-preview">
                <img src={convertedUrl} alt="转换结果预览" className="preview-img" />
              </div>
              <div className="result-meta">
                <div className="meta-row"><span>输出格式</span><b>{targetFormat.toUpperCase()}</b></div>
                <div className="meta-row"><span>输出大小</span><b>{formatBytes(convertedSize)}</b></div>
                {savingPercent !== null && (
                  <div className="meta-row save"><span>体积节省</span><b>{savingPercent}%</b></div>
                )}
                <button className="primary-btn download-btn" onClick={download}>
                  <i className="fa-solid fa-download"></i> 下载 {outputName()}
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="convert-footer">© 2026 flygeon. All rights reserved.</footer>

      <style>{`
        .convert-page {
          position: relative; z-index: 2; max-width: 880px; margin: 0 auto;
          padding: 56px 20px 40px; min-height: 100vh;
          animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }
        .top-bar { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 14px;
          background-color: #111111; border: 1px solid #333333; border-radius: 0;
          color: #dddddd; font-size: 13px; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1); flex-shrink: 0; font-family: inherit;
        }
        .back-btn:hover { background-color: #222222; border-color: #666666; color: #ffffff; transform: scale(1.05); }
        .page-title h1 { font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
        .page-title p { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .card {
          background-color: rgba(26,26,26,0.55); border: 1px solid #2a2a2a; border-radius: 0;
          padding: 20px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .card-head { margin-bottom: 16px; }
        .card-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #ffffff; }
        .card-title i { color: #888888; font-size: 13px; }
        .dropzone {
          border: 1.5px dashed #3a3a3a; border-radius: 0; padding: 36px 20px;
          text-align: center; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          background-color: rgba(17,17,17,0.35);
        }
        .dropzone:hover, .dropzone:focus-visible { border-color: #777777; background-color: rgba(34,34,34,0.5); outline: none; }
        .dropzone.dragging { border-color: #ffffff; background-color: rgba(255,255,255,0.06); transform: scale(1.01); }
        .dz-icon { font-size: 34px; color: #888888; margin-bottom: 12px; }
        .dz-main { font-size: 14px; color: #cccccc; margin-bottom: 6px; }
        .dz-sub { font-size: 12px; color: rgba(255,255,255,0.45); margin-bottom: 16px; }
        kbd { background-color: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 0; padding: 1px 6px; font-size: 11px; font-family: inherit; color: #dddddd; }
        .browse-btn {
          display: inline-block; height: 36px; padding: 0 20px; background-color: #ffffff;
          color: #0a0a0a; border: none; border-radius: 0; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); font-family: inherit;
        }
        .browse-btn:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(255,255,255,0.12); }
        .hidden-input { display: none; }
        .preview-block { display: flex; flex-direction: column; gap: 14px; }
        .preview-img-wrap {
          width: 100%; border-radius: 0; overflow: hidden; background-color: #111111;
          border: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: center;
          min-height: 120px; max-height: 280px;
        }
        .preview-img { max-width: 100%; max-height: 280px; object-fit: contain; display: block; }
        .preview-meta { display: flex; flex-direction: column; gap: 2px; }
        .meta-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px; color: rgba(255,255,255,0.55); padding: 7px 0; border-bottom: 1px solid #1f1f1f;
        }
        .meta-row:last-child { border-bottom: none; }
        .meta-row b { color: #ffffff; font-weight: 600; word-break: break-all; text-align: right; }
        .meta-row.save b { color: #6ee7a8; }
        .ghost-btn {
          align-self: flex-start; display: inline-flex; align-items: center; gap: 6px;
          height: 34px; padding: 0 14px; background: none; border: 1px solid #333333;
          border-radius: 0; color: #bbbbbb; font-size: 12px; cursor: pointer;
          transition: all 0.2s ease; font-family: inherit;
        }
        .ghost-btn:hover { border-color: #666666; color: #ffffff; }
        .field { margin-bottom: 20px; }
        .field-label { display: block; font-size: 13px; color: #cccccc; margin-bottom: 10px; }
        .field-label b { color: #ffffff; }
        .field-hint { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; }
        .segmented {
          position: relative; display: grid; grid-template-columns: repeat(3,1fr);
          background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 0; padding: 4px;
        }
        .seg-btn {
          position: relative; z-index: 1; display: flex; flex-direction: column;
          align-items: center; gap: 2px; padding: 8px 4px; background: none; border: none;
          border-radius: 0; color: #888888; cursor: pointer; transition: color 0.25s ease; font-family: inherit;
        }
        .seg-btn.active { color: #ffffff; }
        .seg-label { font-size: 13px; font-weight: 600; }
        .seg-note { font-size: 10px; opacity: 0.7; }
        .seg-indicator {
          position: absolute; top: 4px; left: 4px; width: calc((100% - 8px) / 3);
          height: calc(100% - 8px); background-color: #2a2a2a; border-radius: 0;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); z-index: 0;
        }
        .quality-range { width: 100%; -webkit-appearance: none; appearance: none; height: 4px; border-radius: 0; background: #333333; outline: none; }
        .quality-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #ffffff; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.4); }
        .quality-range::-moz-range-thumb { width: 16px; height: 16px; border: none; border-radius: 50%; background: #ffffff; cursor: pointer; }
        .primary-btn {
          width: 100%; height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background-color: #ffffff; color: #0a0a0a; border: none; border-radius: 0;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); font-family: inherit;
        }
        .primary-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 6px 20px rgba(255,255,255,0.14); }
        .primary-btn:active:not(:disabled) { transform: scale(0.98); }
        .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; background-color: #555555; color: #aaaaaa; }
        .result-card { margin-bottom: 20px; }
        .result-body { display: flex; gap: 20px; }
        .result-preview { flex-shrink: 0; width: 220px; max-height: 220px; }
        .result-preview .preview-img { max-height: 220px; }
        .result-meta { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .download-btn { margin-top: 14px; }
        .error-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-bottom: 16px; background-color: rgba(220,60,60,0.12); border: 1px solid rgba(220,80,80,0.4); border-radius: 0; color: #ff9a9a; font-size: 13px; }
        .convert-footer { text-align: center; color: #555555; font-size: 13px; margin-top: 30px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 720px) {
          .convert-page { padding: 40px 16px 30px; }
          .grid { grid-template-columns: 1fr; }
          .page-title h1 { font-size: 22px; }
          .top-bar { flex-direction: column; gap: 12px; }
          .result-body { flex-direction: column; }
          .result-preview { width: 100%; }
        }
      `}</style>
    </div>
  )
}