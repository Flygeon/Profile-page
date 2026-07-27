'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, TriangleAlert, SquarePen, WandSparkles, Copy, Download,
  Bold, Italic, Strikethrough, Code, Link2, Quote, List, ListOrdered,
  Heading1, Heading2, Heading3, SquareCode, Minus,
} from 'lucide-react'
import { useToast } from '@/features/toast/ToastProvider'
import { getCaretCoordinates } from '@/features/md/caret'

interface SlashItem {
  key: string
  label: string
  icon: typeof Heading1
  insert: string
  caretBack: number
}

// 斜杠命令：在行首输入 "/" 触发，回车/点击插入对应块级语法
const SLASH_ITEMS: SlashItem[] = [
  { key: 'h1', label: '一级标题', icon: Heading1, insert: '# ', caretBack: 0 },
  { key: 'h2', label: '二级标题', icon: Heading2, insert: '## ', caretBack: 0 },
  { key: 'h3', label: '三级标题', icon: Heading3, insert: '### ', caretBack: 0 },
  { key: 'quote', label: '引用', icon: Quote, insert: '> ', caretBack: 0 },
  { key: 'ul', label: '无序列表', icon: List, insert: '- ', caretBack: 0 },
  { key: 'ol', label: '有序列表', icon: ListOrdered, insert: '1. ', caretBack: 0 },
  { key: 'code', label: '代码块', icon: SquareCode, insert: '```\n\n```', caretBack: 4 },
  { key: 'hr', label: '分割线', icon: Minus, insert: '---\n', caretBack: 0 },
]

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

interface TextStats {
  words: number
  chars: number
  charsNoSpace: number
  lines: number
  readMin: number
}

// 中文按字计数，英文按词计数，两者相加得到「字数」
function countStats(text: string): TextStats {
  const cjk = (text.match(/[一-鿿぀-ヿ가-힯]/g) || []).length
  const latin = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length
  const words = cjk + latin
  return {
    words,
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    lines: text ? text.split(/\r?\n/).length : 0,
    // 中文约 300 字/分，英文约 200 词/分，折中按 300 计
    readMin: words ? Math.max(1, Math.round(words / 300)) : 0,
  }
}

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
  const showToast = useToast()

  const viewIndex = VIEWS.findIndex((v) => v.value === viewMode)
  const isEmpty = !mdText.trim()
  const rendered = mdText.trim() ? mdToHtml(mdText) : ''
  const stats = countStats(mdText)

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

  // ---- 编辑增强：格式工具栏 + 斜杠命令 ----
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [slash, setSlash] = useState({ open: false, index: 0, query: '', top: 0, left: 0 })
  const [slashActive, setSlashActive] = useState(0)

  const filteredSlash = SLASH_ITEMS.filter((it) => {
    const q = slash.query.toLowerCase()
    return !q || it.key.startsWith(q) || it.label.includes(slash.query)
  })

  const closeSlash = () => setSlash((prev) => (prev.open ? { ...prev, open: false } : prev))

  const applyToSelection = (
    transform: (sel: string, value: string, s: number, e: number) => { text: string; selStart: number; selEnd: number },
  ) => {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const { text, selStart, selEnd } = transform(value.slice(s, e), value, s, e)
    setMdText(text)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(selStart, selEnd)
    })
  }

  const wrap = (before: string, after = before) =>
    applyToSelection((sel, value, s, e) => ({
      text: value.slice(0, s) + before + sel + after + value.slice(e),
      selStart: s + before.length,
      selEnd: s + before.length + sel.length,
    }))

  const insertLink = () =>
    applyToSelection((sel, value, s, e) => {
      const label = sel || '链接文字'
      const inserted = `[${label}](url)`
      const urlStart = s + 1 + label.length + 2
      return { text: value.slice(0, s) + inserted + value.slice(e), selStart: urlStart, selEnd: urlStart + 3 }
    })

  const prefixLine = (prefix: string) =>
    applyToSelection((sel, value, s, e) => {
      const lineStart = value.lastIndexOf('\n', s - 1) + 1
      return {
        text: value.slice(0, lineStart) + prefix + value.slice(lineStart),
        selStart: s + prefix.length,
        selEnd: e + prefix.length,
      }
    })

  const insertCodeBlock = () =>
    applyToSelection((sel, value, s, e) => ({
      text: value.slice(0, s) + '```\n' + sel + '\n```' + value.slice(e),
      selStart: s + 4,
      selEnd: s + 4 + sel.length,
    }))

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const ta = e.target
    const value = ta.value
    setMdText(value)
    const caret = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', caret - 1) + 1
    const token = value.slice(lineStart, caret)
    if (/^\/[a-z0-9]*$/i.test(token)) {
      const coords = getCaretCoordinates(ta, lineStart)
      setSlash({ open: true, index: lineStart, query: token.slice(1), top: coords.top + coords.height + 4, left: coords.left })
      setSlashActive(0)
    } else {
      closeSlash()
    }
  }

  const replaceSlash = (item: SlashItem) => {
    const ta = textareaRef.current
    if (!ta) return
    const caret = ta.selectionStart
    const value = ta.value
    const text = value.slice(0, slash.index) + item.insert + value.slice(caret)
    setMdText(text)
    closeSlash()
    const pos = slash.index + item.insert.length - item.caretBack
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(pos, pos)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!slash.open || filteredSlash.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSlashActive((i) => Math.min(i + 1, filteredSlash.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSlashActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      replaceSlash(filteredSlash[Math.min(slashActive, filteredSlash.length - 1)])
    } else if (e.key === 'Escape') {
      closeSlash()
    }
  }

  const TOOLBAR: { icon: typeof Bold; label: string; run: () => void }[] = [
    { icon: Heading1, label: '一级标题', run: () => prefixLine('# ') },
    { icon: Heading2, label: '二级标题', run: () => prefixLine('## ') },
    { icon: Heading3, label: '三级标题', run: () => prefixLine('### ') },
    { icon: Bold, label: '加粗', run: () => wrap('**') },
    { icon: Italic, label: '斜体', run: () => wrap('*') },
    { icon: Strikethrough, label: '删除线', run: () => wrap('~~') },
    { icon: Code, label: '行内代码', run: () => wrap('`') },
    { icon: Link2, label: '链接', run: insertLink },
    { icon: Quote, label: '引用', run: () => prefixLine('> ') },
    { icon: List, label: '无序列表', run: () => prefixLine('- ') },
    { icon: ListOrdered, label: '有序列表', run: () => prefixLine('1. ') },
    { icon: SquareCode, label: '代码块', run: insertCodeBlock },
  ]

  return (
    <div className="md-page">
      <div className="top-bar">
        <button className="back-btn" onClick={() => router.push('/')} aria-label="返回首页">
          <ArrowLeft className="w-4 h-4" />
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
            <TriangleAlert className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="card">
        <div className="card-head">
          <span className="card-title"><SquarePen className="w-4 h-4" /> 编辑器</span>
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
            <div className="md-editor-col">
              <div className="md-toolbar" role="toolbar" aria-label="格式工具栏">
                {TOOLBAR.map(({ icon: Icon, label, run }, i) => (
                  <span key={label} className="tool-slot">
                    <button className="tool-btn" title={label} aria-label={label} onMouseDown={(e) => e.preventDefault()} onClick={run}>
                      <Icon className="w-4 h-4" />
                    </button>
                    {(i === 2 || i === 7) && <span className="tool-divider" aria-hidden />}
                  </span>
                ))}
              </div>
              <div className="md-editor-wrap">
                <textarea
                  ref={textareaRef}
                  className="md-input"
                  value={mdText}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  onScroll={closeSlash}
                  onBlur={() => setTimeout(closeSlash, 120)}
                  spellCheck={false}
                  aria-label="Markdown 输入"
                  placeholder="在此输入 Markdown… 行首输入 / 唤起命令"
                />
                {slash.open && filteredSlash.length > 0 && (
                  <div className="slash-menu" style={{ top: slash.top, left: slash.left }} role="listbox">
                    {filteredSlash.map((item, i) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.key}
                          className={`slash-item ${i === slashActive ? 'active' : ''}`}
                          onMouseEnter={() => setSlashActive(i)}
                          onMouseDown={(e) => { e.preventDefault(); replaceSlash(item) }}
                          role="option"
                          aria-selected={i === slashActive}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          <span className="slash-hint">{item.insert.trim() || '—'}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
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

        <div className="md-stats" role="status" aria-live="polite" aria-label="文本统计">
          <span className="stat"><strong>{stats.words}</strong> 字数</span>
          <span className="stat-sep" aria-hidden>·</span>
          <span className="stat"><strong>{stats.chars}</strong> 字符</span>
          <span className="stat-sep" aria-hidden>·</span>
          <span className="stat"><strong>{stats.charsNoSpace}</strong> 不含空格</span>
          <span className="stat-sep" aria-hidden>·</span>
          <span className="stat"><strong>{stats.lines}</strong> 行</span>
          <span className="stat-sep" aria-hidden>·</span>
          <span className="stat">约 <strong>{stats.readMin}</strong> 分钟阅读</span>
        </div>

        <div className="md-actions">
          <button className="ghost-btn" onClick={loadSample}>
            <WandSparkles className="w-4 h-4" /> 加载示例
          </button>
          <button className="ghost-btn" onClick={copyHtml} disabled={isEmpty}>
            <Copy className="w-4 h-4" /> 复制 HTML
          </button>
          <button className="primary-btn" onClick={downloadMd} disabled={isEmpty}>
            <Download className="w-4 h-4" /> 下载 .md
          </button>
        </div>
      </section>

      <footer className="md-footer">© 2026 flygeon. All rights reserved.</footer>

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
        .md-editor-col { display: flex; flex-direction: column; min-width: 0; }
        .md-toolbar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 2px;
          padding: 6px 8px; background-color: #141414; border: 1px solid #2a2a2a; border-bottom: none;
        }
        .tool-slot { display: inline-flex; align-items: center; }
        .tool-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; background: none; border: none; border-radius: 0;
          color: #999999; cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease;
        }
        .tool-btn:hover { background-color: #262626; color: #ffffff; }
        .tool-divider { width: 1px; height: 18px; background-color: #2f2f2f; margin: 0 5px; }
        .md-editor-wrap { position: relative; flex: 1; min-width: 0; }
        .md-editor-wrap .md-input { min-height: 300px; }
        .slash-menu {
          position: absolute; z-index: 20; min-width: 184px; max-height: 264px; overflow-y: auto;
          background-color: #1a1a1a; border: 1px solid #3a3a3a; box-shadow: 0 8px 28px rgba(0,0,0,0.5);
        }
        .slash-item {
          display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px;
          background: none; border: none; color: #bbbbbb; font-size: 13px; cursor: pointer;
          text-align: left; font-family: inherit;
        }
        .slash-item.active { background-color: #2a2a2a; color: #ffffff; }
        .slash-item > span:first-of-type { flex: 1; }
        .slash-hint { font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 11px; color: #666666; }
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
        .md-body :global(a) { color: #ffffff; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.35); }
        .md-body :global(a:hover) { border-bottom-color: #ffffff; }
        .md-body :global(strong) { color: #ffffff; font-weight: 700; }
        .md-body :global(em) { color: #eeeeee; }
        .md-body :global(code) { background-color: #1f1f1f; border: 1px solid #2a2a2a; border-radius: 0; padding: 1px 6px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12.5px; color: #e8e8e8; }
        .md-body :global(pre) { background-color: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 0; padding: 14px 16px; overflow-x: auto; margin: 10px 0; }
        .md-body :global(pre code) { background: none; border: none; padding: 0; color: #d6d6d6; font-size: 12.5px; }
        .md-body :global(ul), .md-body :global(ol) { margin: 8px 0; padding-left: 22px; }
        .md-body :global(li) { margin: 4px 0; }
        .md-body :global(blockquote) { margin: 10px 0; padding: 8px 14px; border-left: 3px solid #555555; background-color: rgba(255,255,255,0.03); border-radius: 0; color: rgba(255,255,255,0.7); }
        .md-body :global(hr) { border: none; border-top: 1px solid #2a2a2a; margin: 14px 0; }
        .md-stats {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          margin-top: 16px; padding: 10px 14px; background-color: #111111;
          border: 1px solid #2a2a2a; border-radius: 0;
          font-size: 12.5px; color: #888888;
        }
        .md-stats .stat { display: inline-flex; align-items: baseline; gap: 5px; }
        .md-stats .stat strong { color: #ffffff; font-weight: 600; font-variant-numeric: tabular-nums; }
        .md-stats .stat-sep { color: #3a3a3a; }
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