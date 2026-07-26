'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Info, TriangleAlert, ShieldHalf, Lock, LockOpen, Code2, PawPrint, RotateCcw, Loader2, Copy, Download } from 'lucide-react'

const MODES = [
  { value: 'encrypt' as const, label: '加密' },
  { value: 'decrypt' as const, label: '解密' },
]

const ALGOS = [
  { value: 'aes' as const, label: '口令加密', icon: Lock },
  { value: 'base64' as const, label: 'Base64', icon: Code2 },
  { value: 'beast' as const, label: '兽音译者', icon: PawPrint },
]

const DEFAULT_BEAST = '嗷呜啊~'

export default function CipherPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [algo, setAlgo] = useState<'aes' | 'base64' | 'beast'>('aes')
  const [text, setText] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isWorking, setIsWorking] = useState(false)
  const [toast, setToast] = useState('')
  const [beastChars, setBeastChars] = useState(DEFAULT_BEAST)

  const modeIndex = MODES.findIndex((m) => m.value === mode)
  const algoIndex = ALGOS.findIndex((a) => a.value === algo)
  const needPass = algo === 'aes'
  const weakPass = passphrase.length > 0 && passphrase.length < 4

  const validateBeastInput = (s: string) => {
    const arr = [...s]
    if (arr.length !== 4) return '请输入恰好 4 个兽音字符'
    if (new Set(arr).size !== 4) return '4 个兽音字符不可重复'
    return ''
  }

  const beastInputError = validateBeastInput(beastChars)

  const resetBeastChars = () => {
    setBeastChars(DEFAULT_BEAST)
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }, [])

  const bytesToBase64 = (bytes: Uint8Array) => {
    let bin = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
    }
    return btoa(bin)
  }

  const base64ToBytes = (b64: string) => {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }

  const enc = new TextEncoder()
  const dec = new TextDecoder()

  const buildBeast = (chars: string) => {
    const map: Record<string, number> = {}
    for (let i = 0; i < 4; i++) map[chars[i]] = i
    return {
      map,
      prefix: chars[3] + chars[1] + chars[0],
      suffix: chars[2],
    }
  }

  const cpToHex4 = (ch: string) => {
    let h = ch.codePointAt(0)!.toString(16)
    if (h.length > 4) h = h.slice(-4)
    return h.padStart(4, '0')
  }

  const beastEncode = (text: string, chars: string) => {
    const { prefix, suffix } = buildBeast(chars)
    let hex = ''
    for (const ch of text) hex += cpToHex4(ch)
    let code = ''
    let n = 0
    for (const ch of hex) {
      let k = parseInt(ch, 16) + (n % 16)
      if (k >= 16) k -= 16
      const q = Math.floor(k / 4)
      const p = k % 4
      code += chars[q] + chars[p]
      n++
    }
    return prefix + code + suffix
  }

  const beastDecode = (input: string) => {
    const s = input.trim()
    const a = [...s]
    if (a.length < 5) throw new Error('密文过短或格式不正确')
    const chars = [a[2], a[1], a[a.length - 1], a[0]]
    if (new Set(chars).size !== 4) throw new Error('兽语字符集异常')
    const { map, prefix, suffix } = buildBeast(chars.join(''))
    if (!s.startsWith(prefix) || !s.endsWith(suffix)) {
      throw new Error('不是有效的兽语')
    }
    const body = s.slice(prefix.length, s.length - suffix.length)
    if (body.length % 2 !== 0) throw new Error('兽语长度异常')
    let hex = ''
    let m = 0
    for (let i = 0; i < body.length; i += 2) {
      const c1 = body[i]
      const c2 = body[i + 1]
      if (!(c1 in map) || !(c2 in map)) throw new Error('包含非兽语字符')
      let k = map[c1] * 4 + map[c2] - (m % 16)
      if (k < 0) k += 16
      if (k >= 16) k -= 16
      hex += k.toString(16)
      m++
    }
    let text = ''
    for (let i = 0; i + 4 <= hex.length; i += 4) {
      text += String.fromCodePoint(parseInt(hex.slice(i, i + 4), 16))
    }
    return text
  }

  const beastRun = () => {
    setError('')
    setOutput('')
    const err = validateBeastInput(beastChars)
    if (err) {
      setError(err)
      return
    }
    if (!text.trim()) {
      setError(mode === 'encrypt' ? '请输入要编码的文本' : '请粘贴兽语密文')
      return
    }
    try {
      setOutput(mode === 'encrypt' ? beastEncode(text, beastChars) : beastDecode(text))
      showToast(mode === 'encrypt' ? '编码完成' : '解码完成')
    } catch (e) {
      setError((mode === 'encrypt' ? '编码失败：' : '解码失败：') + (e as Error).message)
    }
  }

  const base64Run = () => {
    setError('')
    setOutput('')
    if (!text.trim()) {
      setError(mode === 'encrypt' ? '请输入要编码的文本' : '请粘贴 Base64 文本')
      return
    }
    try {
      if (mode === 'encrypt') {
        setOutput(bytesToBase64(enc.encode(text)))
      } else {
        let bytes
        try {
          bytes = base64ToBytes(text.trim())
        } catch {
          setError('Base64 格式不正确')
          return
        }
        setOutput(dec.decode(bytes))
      }
      showToast(mode === 'encrypt' ? '编码完成' : '解码完成')
    } catch (e) {
      setError('处理失败：' + (e as Error).message)
    }
  }

  const deriveKey = async (pass: string, salt: Uint8Array) => {
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey'])
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 150000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  const doEncrypt = async () => {
    setError('')
    setOutput('')
    if (!text.trim()) {
      setError('请输入要加密的文本')
      return
    }
    if (!passphrase) {
      setError('请输入口令')
      return
    }
    setIsWorking(true)
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const key = await deriveKey(passphrase, salt)
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text))
      const out = new Uint8Array(salt.length + iv.length + ct.byteLength)
      out.set(salt, 0)
      out.set(iv, salt.length)
      out.set(new Uint8Array(ct), salt.length + iv.length)
      setOutput(bytesToBase64(out))
      showToast('加密完成')
    } catch (e) {
      setError('加密失败：' + (e as Error).message)
    } finally {
      setIsWorking(false)
    }
  }

  const doDecrypt = async () => {
    setError('')
    setOutput('')
    if (!text.trim()) {
      setError('请粘贴密文')
      return
    }
    if (!passphrase) {
      setError('请输入口令')
      return
    }
    setIsWorking(true)
    try {
      let data
      try {
        data = base64ToBytes(text.trim())
      } catch {
        setError('密文格式不正确')
        return
      }
      if (data.length < 29) {
        setError('密文长度不足')
        return
      }
      const salt = data.subarray(0, 16)
      const iv = data.subarray(16, 28)
      const ct = data.subarray(28)
      const key = await deriveKey(passphrase, salt)
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
      setOutput(dec.decode(pt))
      showToast('解密完成')
    } catch {
      setError('解密失败：口令错误或密文损坏')
    } finally {
      setIsWorking(false)
    }
  }

  const run = () => {
    if (algo === 'beast') beastRun()
    else if (algo === 'base64') base64Run()
    else if (mode === 'encrypt') doEncrypt()
    else doDecrypt()
  }

  const setAlgoHandler = (a: 'aes' | 'base64' | 'beast') => {
    if (algo === a) return
    setAlgo(a)
    setOutput('')
    setError('')
  }

  const setModeHandler = (m: 'encrypt' | 'decrypt') => {
    if (mode === m) return
    setMode(m)
    setOutput('')
    setError('')
  }

  const copyOutput = async () => {
    if (!output) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(output)
      } else {
        const ta = document.createElement('textarea')
        ta.value = output
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      showToast('已复制结果')
    } catch {
      setError('复制失败')
    }
  }

  const downloadOutput = () => {
    if (!output) return
    try {
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (algo === 'beast' ? (mode === 'encrypt' ? 'beast' : 'plaintext') : algo === 'base64' ? (mode === 'encrypt' ? 'base64' : 'plaintext') : (mode === 'decrypt' ? 'plaintext' : 'cipher')) + '.txt'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      setError('下载失败：' + (e as Error).message)
    }
  }

  const inputLabel = algo === 'beast'
    ? (mode === 'encrypt' ? '普通文本' : '兽语密文')
    : algo === 'base64'
    ? (mode === 'encrypt' ? '明文文本' : 'Base64 文本')
    : (mode === 'encrypt' ? '明文文本' : '密文（Base64）')

  return (
    <div className="cipher-page">
      <div className="top-bar">
        <button className="back-btn" onClick={() => router.push('/')} aria-label="返回首页">
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <div className="page-title">
          <h1>文本加解密</h1>
          <p>口令加密 · Base64 · 兽音译者</p>
        </div>
      </div>

      <div className="info-banner">
        <Info className="w-4 h-4" />
        <span>仅供临时传小秘密，<b>非高安全场景</b>，请勿用于真正敏感的数据。</span>
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
          <span className="card-title"><ShieldHalf className="w-4 h-4" /> 加解密</span>
          <div className="segmented" role="group" aria-label="模式">
            {MODES.map((m) => (
              <button
                key={m.value}
                className={`seg-btn ${mode === m.value ? 'active' : ''}`}
                onClick={() => setModeHandler(m.value)}
              >
                {m.label}
              </button>
            ))}
            <div className="seg-indicator" style={{ transform: `translateX(${modeIndex * 100}%)` }}></div>
          </div>
        </div>

        <div className="algo-row">
          <span className="field-label">算法</span>
          <div className="segmented algo" role="group" aria-label="算法">
            {ALGOS.map((a) => (
              <button
                key={a.value}
                className={`seg-btn ${algo === a.value ? 'active' : ''}`}
                onClick={() => setAlgoHandler(a.value)}
              >
                <a.icon className="w-4 h-4" /> {a.label}
              </button>
            ))}
            <div className="seg-indicator algo" style={{ transform: `translateX(${algoIndex * 100}%)` }}></div>
          </div>
        </div>

        {algo === 'beast' && (
          <>
            <p className="beast-hint">
              <PawPrint className="w-4 h-4" /> 兽音译者为趣味编码，结果可被任意人还原，<b>不含保密性</b>，请勿用于真实秘密。
            </p>
            <div className="beast-dict">
              <div className="beast-dict-head">
                <span className="field-label" style={{ margin: 0 }}>兽音字符（输入 4 个，顺序不限）</span>
                <button type="button" className="mini-btn" onClick={resetBeastChars} aria-label="恢复默认兽音">
                  <RotateCcw className="w-4 h-4" /> 恢复默认
                </button>
              </div>
              <input
                className="beast-chars-input"
                type="text"
                maxLength={4}
                value={beastChars}
                onChange={(e) => setBeastChars(e.target.value)}
                aria-label="兽音字符，4 个"
                placeholder="嗷呜啊~"
              />
              {beastInputError && <p className="field-hint">{beastInputError}</p>}
              <p className="beast-tip">提示：这 4 个字符仅决定编码外观，<b>顺序不影响</b>加解密结果；解密时还能从密文自动还原字符集。</p>
            </div>
          </>
        )}

        <div className="field">
          <label className="field-label" htmlFor="cipher-text">
            {inputLabel}
          </label>
          <textarea
            id="cipher-text"
            className="cipher-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label={mode === 'encrypt' ? '明文文本' : '密文'}
            placeholder={mode === 'encrypt' ? '输入要加密的文本…' : '粘贴密文（Base64）…'}
          />
        </div>

        {needPass && (
          <div className="field">
            <label className="field-label" htmlFor="cipher-pass">口令</label>
            <input
              id="cipher-pass"
              className="cipher-pass"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              aria-label="口令"
              placeholder="用于加解密的口令"
              autoComplete="off"
            />
            {weakPass && <p className="field-hint">口令较短，建议使用更长、更随机的口令以提升安全性。</p>}
          </div>
        )}

        <button className="primary-btn" onClick={run} disabled={isWorking}>
          {isWorking ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> 处理中…</>
          ) : algo === 'beast' ? (
            <><PawPrint className="w-4 h-4" /> {mode === 'encrypt' ? '开始编码' : '开始解码'}</>
          ) : algo === 'base64' ? (
            <><Code2 className="w-4 h-4" /> {mode === 'encrypt' ? '开始编码' : '开始解码'}</>
          ) : mode === 'encrypt' ? (
            <><Lock className="w-4 h-4" /> 开始加密</>
          ) : (
            <><LockOpen className="w-4 h-4" /> 开始解密</>
          )}
        </button>

        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="output-block"
            >
              <div className="output-head">
                <span className="field-label">结果</span>
                <div className="output-actions">
                  <button className="mini-btn" onClick={copyOutput} aria-label="复制结果">
                    <Copy className="w-4 h-4" /> 复制
                  </button>
                  <button className="mini-btn" onClick={downloadOutput} aria-label="下载结果">
                    <Download className="w-4 h-4" /> 下载
                  </button>
                </div>
              </div>
              <textarea className="output-area" value={output} readOnly aria-label="结果" />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="cipher-footer">© 2026 flygeon. All rights reserved.</footer>

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
        .cipher-page {
          position: relative;
          z-index: 2;
          max-width: 720px;
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
        .info-banner {
          display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; margin-bottom: 16px;
          background-color: rgba(90,140,230,0.1); border: 1px solid rgba(90,140,230,0.35); border-radius: 0;
          color: #a9c7ff; font-size: 13px; line-height: 1.5;
        }
        .info-banner i { margin-top: 2px; flex-shrink: 0; }
        .info-banner b { color: #ffffff; }
        .card {
          background-color: rgba(26,26,26,0.55); border: 1px solid #2a2a2a; border-radius: 0;
          padding: 20px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
        .card-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #ffffff; }
        .card-title i { color: #888888; font-size: 13px; }
        .segmented { position: relative; display: grid; grid-template-columns: repeat(2,1fr); background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 0; padding: 4px; }
        .seg-btn { position: relative; z-index: 1; padding: 7px 4px; background: none; border: none; border-radius: 0; color: #888888; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.25s ease; font-family: inherit; }
        .seg-btn.active { color: #ffffff; }
        .seg-indicator { position: absolute; top: 4px; left: 4px; width: calc((100% - 8px) / 2); height: calc(100% - 8px); background-color: #2a2a2a; border-radius: 0; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); z-index: 0; }
        .algo-row { margin-bottom: 18px; }
        .segmented.algo { grid-template-columns: repeat(3,1fr); }
        .seg-indicator.algo { width: calc((100% - 8px) / 3); }
        .seg-btn i { margin-right: 5px; font-size: 12px; }
        .beast-hint {
          display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; margin-bottom: 16px;
          background-color: rgba(110,231,168,0.08); border: 1px solid rgba(110,231,168,0.3); border-radius: 0;
          color: #9fe9c4; font-size: 12.5px; line-height: 1.5;
        }
        .beast-hint i { margin-top: 2px; flex-shrink: 0; }
        .beast-hint b { color: #ffffff; }
        .beast-dict { margin-bottom: 18px; padding: 14px 16px; background-color: #111111; border: 1px solid #2a2a2a; border-radius: 0; }
        .beast-dict-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
        .beast-chars-input { width: 100%; height: 46px; text-align: center; font-size: 20px; letter-spacing: 8px; background-color: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 0; color: #ffffff; outline: none; transition: border-color 0.2s ease; font-family: inherit; box-sizing: border-box; }
        .beast-chars-input:focus { border-color: #6ee7a8; }
        .beast-tip { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 12px; line-height: 1.5; }
        .field { margin-bottom: 18px; }
        .field-label { display: block; font-size: 13px; color: #cccccc; margin-bottom: 10px; }
        .cipher-input { width: 100%; min-height: 140px; resize: vertical; background-color: #111111; border: 1px solid #2a2a2a; border-radius: 0; padding: 14px; color: #e8e8e8; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; line-height: 1.6; outline: none; transition: border-color 0.2s ease; }
        .cipher-input:focus { border-color: #555555; }
        .cipher-pass { width: 100%; height: 42px; background-color: #111111; border: 1px solid #2a2a2a; border-radius: 0; padding: 0 14px; color: #e8e8e8; font-size: 14px; outline: none; transition: border-color 0.2s ease; font-family: inherit; }
        .cipher-pass:focus { border-color: #555555; }
        .field-hint { font-size: 11px; color: rgba(255,200,120,0.7); margin-top: 8px; line-height: 1.5; }
        .primary-btn { width: 100%; height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background-color: #ffffff; color: #0a0a0a; border: none; border-radius: 0; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); font-family: inherit; }
        .primary-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 6px 20px rgba(255,255,255,0.14); }
        .primary-btn:active:not(:disabled) { transform: scale(0.98); }
        .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; background-color: #555555; color: #aaaaaa; }
        .output-block { margin-top: 18px; }
        .output-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .output-actions { display: flex; gap: 8px; }
        .mini-btn { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 12px; background: none; border: 1px solid #333333; border-radius: 0; color: #bbbbbb; font-size: 12px; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .mini-btn:hover { border-color: #666666; color: #ffffff; }
        .output-area { width: 100%; min-height: 120px; resize: vertical; background-color: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 0; padding: 14px; color: #d6d6d6; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12.5px; line-height: 1.6; outline: none; word-break: break-all; }
        .error-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; margin-bottom: 16px; background-color: rgba(220,60,60,0.12); border: 1px solid rgba(220,80,80,0.4); border-radius: 0; color: #ff9a9a; font-size: 13px; }
        .toast { position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%); z-index: 50; padding: 10px 20px; background-color: rgba(20,20,20,0.92); border: 1px solid #3a3a3a; border-radius: 0; color: #ffffff; font-size: 13px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .cipher-footer { text-align: center; color: #555555; font-size: 13px; margin-top: 30px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 720px) {
          .cipher-page { padding: 40px 16px 30px; }
          .page-title h1 { font-size: 22px; }
          .top-bar { flex-direction: column; gap: 12px; }
        }
      `}</style>
    </div>
  )
}
