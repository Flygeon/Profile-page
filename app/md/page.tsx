'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const VIEWS = [
  { value: 'edit' as const, label: '编辑' },
  { value: 'split' as const, label: '分屏' },
  { value: 'preview' as const, label: '预览' }
]

const sampleMd = [
  '# 欢迎使用 Markdown 预览',
  '',
  '这是一个**实时预览**工具，左侧输入、右侧即时渲染。',
  '',
  '## 支持的功能',
  '- 标题、*斜体*、**加粗**',
  '- 行内代码 `const x = 1`',
  '- [访问博客](https://flygeon.top)',
  '',
  '> 引用块：仅供自用的小工具。',
  '',
  '1. 有序列表项一',
  '2. 有序列表项二',
  '',
  '```js',
  "console.log('Hello, Markdown!')",
  '```',
  ''
].join('\n')

const CODE_OPEN = '\u000E'
const CODE_CLOSE = '\u000F'

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inlineMd(text: string) {
  const codeSpans: string[] = []
  text = text.replace(/`([^`]+)`/g, (m, c) => {
    codeSpans.push(c)
    return CODE_OPEN + (codeSpans.length - 1) + CODE_CLOSE
  })
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, url) => {
    const raw = url.replace(/&amp;/g, '&')
    if (!/^(https?:|mailto:)/i.test(raw)) return t
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${t}</a>`
  })
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  text = text.replace(
    new RegExp(CODE_OPEN + '(\\d+)' + CODE_CLOSE, 'g'),
    (m, i) => `<code>${codeSpans[Number(i)]}</code>`
  )
  return text
}

function mdToHtml(src: string) {
  const lines = escapeHtml(src).split(/\r?\n/)
  let html = ''
  let i = 0
  let inList: 'ul' | 'ol' | null = null
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      html += '<p>' + inlineMd(paragraph.join('<br>')) + '</p>'
      paragraph = []
    }
  }
  const closeList = () => {
    if (inList) {
      html += `</${inList}>`
      inList = null
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    if (/^```/.test(line.trim())) {
      flushParagraph()
      closeList()
      i++
      let code = ''
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code += lines[i] + '\n'
        i++
      }
      i++
      html += `<pre><code>${code.replace(/\n$/, '')}</code></pre>`
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      closeList()
      i++
      continue
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushParagraph()
      closeList()
      const lvl = h[1].length
      html += `<h${lvl}>${inlineMd(h[2])}</h${lvl}>`
      i++
      continue
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushParagraph()
      closeList()
      html += '<hr>'
      i++
      continue
    }

    if (/^&gt;\s?/.test(line)) {
      flushParagraph()
      closeList()
      let quote = ''
      while (i < lines.length && /^&gt;\s?/.test(lines[i])) {
        quote += lines[i].replace(/^&gt;\s?/, '') + '\n'
        i++
      }
      html += `<blockquote>${inlineMd(quote.replace(/\n$/, ''))}</blockquote>`
      continue
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/)
    if (ul) {
      flushParagraph()
      if (inList !== 'ul') {
        closeList()
        html += '<ul>'
        inList = 'ul'
      }
      html += `<li>${inlineMd(ul[1])}</li>`
      i++
      continue
    }

    const ol = line.match(/^\s*\d+\.\s+(.*)$/)
    if (ol) {
      flushParagraph()
      if (inList !== 'ol') {
        closeList()
        html += '<ol>'
        inList = 'ol'
      }
      html += `<li>${inlineMd(ol[1])}</li>`
      i++
      continue
    }

    closeList()
    paragraph.push(line.trim())
    i++
  }
  flushParagraph()
  closeList()
  return html
}

export default function MarkdownPreviewPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split')
  const [mdText, setMdText] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const viewIndex = VIEWS.findIndex((v) => v.value === viewMode)
  const isEmpty = !mdText.trim()
  const rendered = mdText.trim() ? mdToHtml(mdText) : ''

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }, [])

  const loadSample = () => {
    setMdText(sampleMd)
    setViewMode('split')
    showToast('已加载示例')
  }

  const copyText = useCallback(async (text: string, okMsg: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (!ok) throw new Error('copy failed')
      }
      showToast(okMsg)
    } catch {
      setError('复制失败，请手动选择复制')
    }
  }, [showToast])

  const copyHtml = () => {
    if (isEmpty) return
    copyText(rendered, '已复制 HTML')
  }

  const downloadMd = () => {
    if (isEmpty) return
    try {
      const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.md'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      setError('下载失败：' + (e as Error).message)
    }
  }

  const setView = (v: 'edit' | 'split' | 'preview') => {
    if (viewMode === v) return
    setViewMode(v)
  }

  return (
    <div className="md-page">
      <div className="top-bar">
        <button className="back-btn" onClick={() => router.push('/')} aria-label="返回首页">
          <i className="fa-solid fa-arrow-left"></i>
          <span>返回</span>
        </button>
        <div className="page-title">
          <h1>Markdown 预览</h1>
          <p>左侧书写，右侧即时渲染</p>
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

      <section className="card">
        <div className="card-head">
          <span className="card-title"><i className="fa-solid fa-pen-to-square"></i> 编辑器</span>
          <div className="segmented" role="group" aria-label="视图模式">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                className={`seg-btn ${viewMode === v.value ? 'active' : ''}`}
                onClick={() => setView(v.value)}
              >
                {v.label}
              </button>
            ))}
            <div className="seg-indicator" style={{ transform: `translateX(${viewIndex * 100}%)` }}></div>
          </div>
        </div>

        <div className={`md-workspace ${viewMode === 'split' ? 'split' : ''}`}>
          {viewMode !== 'preview' && (
            <textarea
              className="md-input"
              value={mdText}
              onChange={(e) => setMdText(e.target.value)}
              spellCheck={false}
              aria-label="Markdown 输入"
              placeholder="在此输入 Markdown…"
            />
          )}
          {viewMode !== 'edit' && (
            <div className="md-preview md-body">
              {isEmpty ? (
                <div className="md-placeholder">在左侧输入 Markdown…</div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: rendered }} />
              )}
            </div>
          )}
        </div>

        <div className="md-actions">
          <button className="ghost-btn" onClick={loadSample}>
            <i className="fa-solid fa-wand-sparkles"></i> 加载示例
          </button>
          <button className="ghost-btn" onClick={copyHtml} disabled={isEmpty}>
            <i className="fa-regular fa-copy"></i> 复制 HTML
          </button>
          <button className="primary-btn" onClick={downloadMd} disabled={isEmpty}>
            <i className="fa-solid fa-download"></i> 下载 .md
          </button>
        </div>
      </section>

      <footer className="md-footer">© 2026 flygeon. All rights reserved.</footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="toast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .md-page {
          position: relative; z-index: 2; max-width: 960px; margin: 0 auto;
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
        .card {
          background-color: rgba(26,26,26,0.55); border: 1px solid #2a2a2a; border-radius: 0;
          padding: 20px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .card-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #ffffff; }
        .card-title i { color: #888888; font-size: 13px; }
        .segmented {
          position: relative; display: grid; grid-template-columns: repeat(3,1fr);
          background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 0; padding: 4px;
        }
        .seg-btn {
          position: relative; z-index: 1; padding: 7px 4px; background: none; border: none;
          border-radius: 0; color: #888888; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: color 0.25s ease; font-family: inherit;
        }
        .seg-btn.active { color: #ffffff; }
        .seg-indicator {
          position: absolute; top: 4px; left: 4px; width: calc((100% - 8px) / 3);
          height: calc(100% - 8px); background-color: #2a2a2a; border-radius: 0;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); z-index: 0;
        }
        .md-workspace { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .md-workspace.split { grid-template-columns: 1fr 1fr; }
        .md-input {
          width: 100%; min-height: 340px; resize: vertical; background-color: #111111;
          border: 1px solid #2a2a2a; border-radius: 0; padding: 14px; color: #e8e8e8;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 13px; line-height: 1.6; outline: none; transition: border-color 0.2s ease;
        }
        .md-input:focus { border-color: #555555; }
        .md-preview {
          min-height: 340px; background-color: #111111; border: 1px solid #2a2a2a;
          border-radius: 0; padding: 16px 18px; overflow-y: auto; color: #dddddd;
          font-size: 14px; line-height: 1.7;
        }
        .md-placeholder { color: rgba(255,255,255,0.35); font-size: 13px; padding-top: 8px; }
        .md-body :global(h1), .md-body :global(h2), .md-body :global(h3), .md-body :global(h4), .md-body :global(h5), .md-body :global(h6) { color: #ffffff; line-height: 1.3; margin: 14px 0 8px; font-weight: 700; }
        .md-body :global(h1) { font-size: 22px; }
        .md-body :global(h2) { font-size: 19px; }
        .md-body :global(h3) { font-size: 16px; }
        .md-body :global(h4), .md-body :global(h5), .md-body :global(h6) { font-size: 14px; }
        .md-body :global(p) { margin: 8px 0; }
        .md-body :global(a) { color: #6db4ff; text-decoration: none; border-bottom: 1px solid rgba(109,180,255,0.4); }
        .md-body :global(a:hover) { border-bottom-color: #6db4ff; }
        .md-body :global(strong) { color: #ffffff; font-weight: 700; }
        .md-body :global(em) { color: #eeeeee; }
        .md-body :global(code) { background-color: #1f1f1f; border: 1px solid #2a2a2a; border-radius: 0; padding: 1px 6px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12.5px; color: #f0c674; }
        .md-body :global(pre) { background-color: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 0; padding: 14px 16px; overflow-x: auto; margin: 10px 0; }
        .md-body :global(pre code) { background: none; border: none; padding: 0; color: #d6d6d6; font-size: 12.5px; }
        .md-body :global(ul), .md-body :global(ol) { margin: 8px 0; padding-left: 22px; }
        .md-body :global(li) { margin: 4px 0; }
        .md-body :global(blockquote) { margin: 10px 0; padding: 8px 14px; border-left: 3px solid #555555; background-color: rgba(255,255,255,0.03); border-radius: 0; color: rgba(255,255,255,0.7); }
        .md-body :global(hr) { border: none; border-top: 1px solid #2a2a2a; margin: 14px 0; }
        .md-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; align-items: center; }
        .ghost-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 16px;
          background: none; border: 1px solid #333333; border-radius: 0;
          color: #bbbbbb; font-size: 13px; cursor: pointer; transition: all 0.2s ease; font-family: inherit;
        }
        .ghost-btn:hover:not(:disabled) { border-color: #666666; color: #ffffff; }
        .ghost-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .primary-btn {
          height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 0 20px; background-color: #ffffff; color: #0a0a0a; border: none;
          border-radius: 0; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1); font-family: inherit;
        }
        .primary-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 4px 16px rgba(255,255,255,0.12); }
        .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; background-color: #555555; color: #aaaaaa; }
        .error-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-bottom: 16px; background-color: rgba(220,60,60,0.12); border: 1px solid rgba(220,80,80,0.4); border-radius: 0; color: #ff9a9a; font-size: 13px; }
        .toast { position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%); z-index: 50; padding: 10px 20px; background-color: rgba(20,20,20,0.92); border: 1px solid #3a3a3a; border-radius: 0; color: #ffffff; font-size: 13px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .md-footer { text-align: center; color: #555555; font-size: 13px; margin-top: 30px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 720px) {
          .md-page { padding: 40px 16px 30px; }
          .md-workspace.split { grid-template-columns: 1fr; }
          .page-title h1 { font-size: 22px; }
          .top-bar { flex-direction: column; gap: 12px; }
          .md-input, .md-preview { min-height: 260px; }
        }
      `}</style>
    </div>
  )
}