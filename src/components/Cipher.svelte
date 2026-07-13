<script>
  import { fade } from 'svelte/transition'

  let { onBack = () => {} } = $props()

  const MODES = [
    { value: 'encrypt', label: '加密' },
    { value: 'decrypt', label: '解密' }
  ]
  let mode = $state('encrypt')
  const modeIndex = $derived(MODES.findIndex((m) => m.value === mode))

  let text = $state('')
  let passphrase = $state('')
  let output = $state('')
  let error = $state('')
  let isWorking = $state(false)
  let toast = $state('')

  // ---- 算法选择：口令加密(AES) / Base64 / 兽音译者 ----
  const ALGOS = [
    { value: 'aes', label: '口令加密', icon: 'fa-solid fa-lock' },
    { value: 'base64', label: 'Base64', icon: 'fa-solid fa-code' },
    { value: 'beast', label: '兽音译者', icon: 'fa-solid fa-paw' }
  ]
  let algo = $state('aes')
  const algoIndex = $derived(ALGOS.findIndex((a) => a.value === algo))
  const needPass = $derived(algo === 'aes')
  const inputLabel = $derived(
    algo === 'beast'
      ? (mode === 'encrypt' ? '普通文本' : '兽语密文')
      : algo === 'base64'
      ? (mode === 'encrypt' ? '明文文本' : 'Base64 文本')
      : (mode === 'encrypt' ? '明文文本' : '密文（Base64）')
  )
  const inputPlaceholder = $derived(
    algo === 'beast'
      ? (mode === 'encrypt' ? '输入普通文本，如：今天吃点啥' : '粘贴兽语，如：~呜嗷…啊')
      : algo === 'base64'
      ? (mode === 'encrypt' ? '输入要编码的文本…' : '粘贴 Base64 文本…')
      : (mode === 'encrypt' ? '输入要加密的文本…' : '粘贴密文（Base64）…')
  )
  const outName = $derived(
    algo === 'beast'
      ? (mode === 'encrypt' ? 'beast' : 'plaintext')
      : algo === 'base64'
      ? (mode === 'encrypt' ? 'base64' : 'plaintext')
      : (mode === 'decrypt' ? 'plaintext' : 'cipher')
  )

  const cryptoOk = $derived(typeof window !== 'undefined' && !!window.crypto?.subtle)
  const weakPass = $derived(passphrase.length > 0 && passphrase.length < 4)

  let toastTimer = null
  function showToast(msg) {
    toast = msg
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast = ''), 1800)
  }

  // ---- Base64 编解码（健壮处理大文件） ----
  function bytesToBase64(bytes) {
    let bin = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
    }
    return btoa(bin)
  }
  function base64ToBytes(b64) {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }

  const enc = new TextEncoder()
  const dec = new TextDecoder()

  // ---- 兽音译者（趣味编码，参考 blog.dominoh.com 算法移植） ----
  // 可自定义 4 个字（默认：嗷 呜 啊 ~）。编码位置：
  //   dict[0]=嗷(0)  dict[1]=呜(1)  dict[2]=啊(2)  dict[3]=~(3)
  // 前缀 = dict[3]+dict[1]+dict[0]（如 ~呜嗷），后缀 = dict[2]（如 啊）
  // ---- 兽音译者：编码按输入顺序，解密不依赖输入顺序 ----
  // 编码：直接使用用户“输入的 4 个字”（按输入顺序）参与编码，不做规范化，
  // 因此输入顺序不同会得到不同的密文。
  // 解密：首尾标记自带字符位序（前缀=第4+第2+第1字，后缀=第3字），
  // 故解密时直接从密文结构反推位序——无论框内 4 字以何种顺序输入都能还原。
  const DEFAULT_BEAST = '嗷呜啊~' // 默认 4 个兽音字符（任意顺序均可）
  let beastChars = $state('嗷呜啊~')

  // 校验：必须恰好 4 个字符且互不重复
  function validateBeastInput(s) {
    const arr = [...s]
    if (arr.length !== 4) return '请输入恰好 4 个兽音字符'
    if (new Set(arr).size !== 4) return '4 个兽音字符不可重复'
    return ''
  }
  const beastInputError = $derived(validateBeastInput(beastChars))

  function resetBeastChars() {
    beastChars = DEFAULT_BEAST
  }

  // 由字符集派生映射表与首尾标记（前缀=第4+第2+第1字，后缀=第3字）
  function buildBeast(chars) {
    const map = {}
    for (let i = 0; i < 4; i++) map[chars[i]] = i
    return {
      map,
      prefix: chars[3] + chars[1] + chars[0],
      suffix: chars[2]
    }
  }

  function cpToHex4(ch) {
    let h = ch.codePointAt(0).toString(16)
    if (h.length > 4) h = h.slice(-4) // 超出 BMP 截断（与参考算法一致，仅支持基本平面）
    return h.padStart(4, '0')
  }

  function beastEncode(text, chars) {
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

  // 解密：直接从密文结构反推位序，不依赖框内 4 字的输入顺序。
  // 前缀(3字)=chars[3]+chars[1]+chars[0]、后缀(1字)=chars[2]，
  // 故 chars[0]=s[2]、chars[1]=s[1]、chars[2]=s末位、chars[3]=s[0]。
  function beastDecode(input) {
    const s = input.trim()
    const a = [...s] // 按码点展开，兼容任意字符
    if (a.length < 5) throw new Error('密文过短或格式不正确')
    const chars = [a[2], a[1], a[a.length - 1], a[0]]
    if (new Set(chars).size !== 4) throw new Error('兽语字符集异常（需恰好 4 个不同字符）')
    const { map, prefix, suffix } = buildBeast(chars)
    if (!s.startsWith(prefix) || !s.endsWith(suffix)) {
      throw new Error('不是有效的兽语（首尾标记不匹配）')
    }
    const body = s.slice(prefix.length, s.length - suffix.length)
    if (body.length % 2 !== 0) throw new Error('兽语长度异常')
    let hex = ''
    let m = 0
    for (let i = 0; i < body.length; i += 2) {
      const c1 = body[i]
      const c2 = body[i + 1]
      if (!(c1 in map) || !(c2 in map)) {
        throw new Error('包含非兽语字符')
      }
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

  function beastRun() {
    error = ''
    output = ''
    const err = validateBeastInput(beastChars)
    if (err) {
      error = err
      return
    }
    const chars = beastChars // 按用户输入顺序编码（不做规范化）
    const src = text
    if (!src.trim()) {
      error = mode === 'encrypt' ? '请输入要编码的文本' : '请粘贴兽语密文'
      return
    }
    try {
      output = mode === 'encrypt' ? beastEncode(src, chars) : beastDecode(src)
      showToast(mode === 'encrypt' ? '编码完成' : '解码完成')
    } catch (e) {
      error = (mode === 'encrypt' ? '编码失败：' : '解码失败：') + (e?.message || '格式不正确')
    }
  }

  function base64Run() {
    error = ''
    output = ''
    const src = text
    if (!src.trim()) {
      error = mode === 'encrypt' ? '请输入要编码的文本' : '请粘贴 Base64 文本'
      return
    }
    try {
      if (mode === 'encrypt') {
        output = bytesToBase64(enc.encode(src))
      } else {
        let bytes
        try {
          bytes = base64ToBytes(src.trim())
        } catch {
          error = 'Base64 格式不正确'
          return
        }
        output = dec.decode(bytes)
      }
      showToast(mode === 'encrypt' ? '编码完成' : '解码完成')
    } catch (e) {
      error = '处理失败：' + (e?.message || '未知错误')
    }
  }

  function setAlgo(a) {
    if (algo === a) return
    algo = a
    output = ''
    error = ''
  }

  async function deriveKey(pass, salt) {
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, [
      'deriveKey'
    ])
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  async function doEncrypt() {
    error = ''
    output = ''
    if (!cryptoOk) {
      error = '当前环境不支持 Web Crypto（需 HTTPS 或 localhost）'
      return
    }
    if (!text.trim()) {
      error = '请输入要加密的文本'
      return
    }
    if (!passphrase) {
      error = '请输入口令'
      return
    }
    isWorking = true
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const key = await deriveKey(passphrase, salt)
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text))
      const out = new Uint8Array(salt.length + iv.length + ct.byteLength)
      out.set(salt, 0)
      out.set(iv, salt.length)
      out.set(new Uint8Array(ct), salt.length + iv.length)
      output = bytesToBase64(out)
      showToast('加密完成')
    } catch (e) {
      error = '加密失败：' + (e?.message || '未知错误')
    } finally {
      isWorking = false
    }
  }

  async function doDecrypt() {
    error = ''
    output = ''
    if (!cryptoOk) {
      error = '当前环境不支持 Web Crypto（需 HTTPS 或 localhost）'
      return
    }
    if (!text.trim()) {
      error = '请粘贴密文'
      return
    }
    if (!passphrase) {
      error = '请输入口令'
      return
    }
    isWorking = true
    try {
      let data
      try {
        data = base64ToBytes(text.trim())
      } catch {
        error = '密文格式不正确（需有效的 Base64 字符串）'
        return
      }
      if (data.length < 29) {
        error = '密文长度不足，可能不完整'
        return
      }
      const salt = data.subarray(0, 16)
      const iv = data.subarray(16, 28)
      const ct = data.subarray(28)
      const key = await deriveKey(passphrase, salt)
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
      output = dec.decode(pt)
      showToast('解密完成')
    } catch {
      error = '解密失败：口令错误或密文损坏'
    } finally {
      isWorking = false
    }
  }

  function run() {
    if (algo === 'beast') beastRun()
    else if (algo === 'base64') base64Run()
    else if (mode === 'encrypt') doEncrypt()
    else doDecrypt()
  }

  function setMode(m) {
    if (mode === m) return
    mode = m
    output = ''
    error = ''
  }

  async function copyOutput() {
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
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (!ok) throw new Error('copy failed')
      }
      showToast('已复制结果')
    } catch {
      error = '复制失败，请手动选择复制'
    }
  }

  function downloadOutput() {
    if (!output) return
    try {
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = outName + '.txt'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      error = '下载失败：' + (e?.message || '未知错误')
    }
  }

  import { onDestroy } from 'svelte'
  onDestroy(() => {
    if (toastTimer) clearTimeout(toastTimer)
  })
</script>

<div class="cipher-page">
  <div class="top-bar">
    <button class="back-btn" onclick={onBack} aria-label="返回首页">
      <i class="fa-solid fa-arrow-left"></i>
      <span>返回</span>
    </button>
    <div class="page-title">
      <h1>文本加解密</h1>
      <p>口令加密 · Base64 · 兽音译者</p>
    </div>
  </div>

  <div class="info-banner">
    <i class="fa-solid fa-circle-info"></i>
    <span>仅供临时传小秘密，<b>非高安全场景</b>，请勿用于真正敏感的数据。</span>
  </div>

  {#if error}
    <div class="error-banner" transition:fade={{ duration: 200 }}>
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>{error}</span>
    </div>
  {/if}

  <section class="card">
    <div class="card-head">
      <span class="card-title"><i class="fa-solid fa-shield-halved"></i> 加解密</span>
      <div class="segmented" role="group" aria-label="模式">
        {#each MODES as m}
          <button class="seg-btn" class:active={mode === m.value} onclick={() => setMode(m.value)}>
            {m.label}
          </button>
        {/each}
        <div class="seg-indicator" style="transform: translateX({modeIndex * 100}%)"></div>
      </div>
    </div>

    <div class="algo-row">
      <span class="field-label">算法</span>
      <div class="segmented algo" role="group" aria-label="算法">
        {#each ALGOS as a}
          <button class="seg-btn" class:active={algo === a.value} onclick={() => setAlgo(a.value)}>
            <i class={a.icon}></i> {a.label}
          </button>
        {/each}
        <div class="seg-indicator algo" style="transform: translateX({algoIndex * 100}%)"></div>
      </div>
    </div>

    {#if algo === 'beast'}
      <p class="beast-hint">
        <i class="fa-solid fa-paw"></i> 兽音译者为趣味编码，结果可被任意人还原，<b>不含保密性</b>，请勿用于真实秘密。
      </p>
      <div class="beast-dict">
        <div class="beast-dict-head">
          <span class="field-label" style="margin:0">兽音字符（输入 4 个，顺序不限）</span>
          <button type="button" class="mini-btn" onclick={resetBeastChars} aria-label="恢复默认兽音">
            <i class="fa-solid fa-rotate-left"></i> 恢复默认
          </button>
        </div>
        <input
          class="beast-chars-input"
          type="text"
          maxlength="4"
          bind:value={beastChars}
          aria-label="兽音字符，4 个"
          placeholder="嗷呜啊~"
        />
        {#if beastInputError}
          <p class="field-hint">{beastInputError}</p>
        {/if}
        <p class="beast-tip">提示：这 4 个字符仅决定编码外观，<b>顺序不影响</b>加解密结果；解密时还能从密文自动还原字符集。</p>
      </div>
    {/if}

    <div class="field">
      <label class="field-label" for="cipher-text">
        {inputLabel}
      </label>
      <textarea
        id="cipher-text"
        class="cipher-input"
        bind:value={text}
        spellcheck="false"
        aria-label={mode === 'encrypt' ? '明文文本' : '密文'}
        placeholder={mode === 'encrypt' ? '输入要加密的文本…' : '粘贴密文（Base64）…'}
      ></textarea>
    </div>

    {#if needPass}
    <div class="field">
      <label class="field-label" for="cipher-pass">口令</label>
      <input
        id="cipher-pass"
        class="cipher-pass"
        type="password"
        bind:value={passphrase}
        aria-label="口令"
        placeholder="用于加解密的口令"
        autocomplete="off"
      />
      {#if weakPass}
        <p class="field-hint">口令较短，建议使用更长、更随机的口令以提升安全性。</p>
      {/if}
    </div>
    {/if}

    <button class="primary-btn" onclick={run} disabled={isWorking || (algo === 'aes' && !cryptoOk)}>
      {#if isWorking}
        <i class="fa-solid fa-spinner fa-spin"></i> 处理中…
      {:else if algo === 'beast'}
        <i class="fa-solid fa-paw"></i> {mode === 'encrypt' ? '开始编码' : '开始解码'}
      {:else if algo === 'base64'}
        <i class="fa-solid fa-code"></i> {mode === 'encrypt' ? '开始编码' : '开始解码'}
      {:else if mode === 'encrypt'}
        <i class="fa-solid fa-lock"></i> 开始加密
      {:else}
        <i class="fa-solid fa-unlock"></i> 开始解密
      {/if}
    </button>

    {#if output}
      <div class="output-block" transition:fade={{ duration: 200 }}>
        <div class="output-head">
          <span class="field-label">结果</span>
          <div class="output-actions">
            <button class="mini-btn" onclick={copyOutput} aria-label="复制结果">
              <i class="fa-regular fa-copy"></i> 复制
            </button>
            <button class="mini-btn" onclick={downloadOutput} aria-label="下载结果">
              <i class="fa-solid fa-download"></i> 下载
            </button>
          </div>
        </div>
        <textarea class="output-area" value={output} readonly aria-label="结果"></textarea>
      </div>
    {/if}
  </section>

  <footer class="cipher-footer">© 2026 flygeon. All rights reserved.</footer>
</div>

{#if toast}
  <div class="toast" transition:fade={{ duration: 200 }}>{toast}</div>
{/if}

<style>
  .cipher-page {
    position: relative;
    z-index: 2;
    max-width: 720px;
    margin: 0 auto;
    padding: 56px 20px 40px;
    min-height: 100vh;
    animation: fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .top-bar {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 14px;
    background-color: #111111;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #dddddd;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    font-family: inherit;
  }
  .back-btn:hover {
    background-color: #222222;
    border-color: #666666;
    color: #ffffff;
    transform: scale(1.05);
  }

  .page-title h1 {
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }
  .page-title p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
    margin-top: 4px;
  }

  .info-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background-color: rgba(90, 140, 230, 0.1);
    border: 1px solid rgba(90, 140, 230, 0.35);
    border-radius: 12px;
    color: #a9c7ff;
    font-size: 13px;
    line-height: 1.5;
  }
  .info-banner i {
    margin-top: 2px;
    flex-shrink: 0;
  }
  .info-banner b {
    color: #ffffff;
  }

  .card {
    background-color: rgba(26, 26, 26, 0.55);
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .card-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
  .card-title i {
    color: #888888;
    font-size: 13px;
  }

  .segmented {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 4px;
  }
  .seg-btn {
    position: relative;
    z-index: 1;
    padding: 7px 4px;
    background: none;
    border: none;
    border-radius: 9px;
    color: #888888;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.25s ease;
    font-family: inherit;
  }
  .seg-btn.active {
    color: #ffffff;
  }
  .seg-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc((100% - 8px) / 2);
    height: calc(100% - 8px);
    background-color: #2a2a2a;
    border-radius: 9px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  .algo-row {
    margin-bottom: 18px;
  }
  .segmented.algo {
    grid-template-columns: repeat(3, 1fr);
  }
  .seg-indicator.algo {
    width: calc((100% - 8px) / 3);
  }
  .seg-btn i {
    margin-right: 5px;
    font-size: 12px;
  }

  .beast-hint {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    background-color: rgba(110, 231, 168, 0.08);
    border: 1px solid rgba(110, 231, 168, 0.3);
    border-radius: 12px;
    color: #9fe9c4;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .beast-hint i {
    margin-top: 2px;
    flex-shrink: 0;
  }
  .beast-hint b {
    color: #ffffff;
  }

  .beast-dict {
    margin-bottom: 18px;
    padding: 14px 16px;
    background-color: #111111;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
  }
  .beast-dict-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }
  .beast-chars-input {
    width: 100%;
    height: 46px;
    text-align: center;
    font-size: 20px;
    letter-spacing: 8px;
    background-color: #0d0d0d;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    color: #ffffff;
    outline: none;
    transition: border-color 0.2s ease;
    font-family: inherit;
    box-sizing: border-box;
  }
  .beast-chars-input:focus {
    border-color: #6ee7a8;
  }
  .beast-tip {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 12px;
    line-height: 1.5;
  }

  .field {
    margin-bottom: 18px;
  }
  .field-label {
    display: block;
    font-size: 13px;
    color: #cccccc;
    margin-bottom: 10px;
  }

  .cipher-input {
    width: 100%;
    min-height: 140px;
    resize: vertical;
    background-color: #111111;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 14px;
    color: #e8e8e8;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 13px;
    line-height: 1.6;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .cipher-input:focus {
    border-color: #555555;
  }

  .cipher-pass {
    width: 100%;
    height: 42px;
    background-color: #111111;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 0 14px;
    color: #e8e8e8;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease;
    font-family: inherit;
  }
  .cipher-pass:focus {
    border-color: #555555;
  }

  .field-hint {
    font-size: 11px;
    color: rgba(255, 200, 120, 0.7);
    margin-top: 8px;
    line-height: 1.5;
  }

  .primary-btn {
    width: 100%;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #ffffff;
    color: #0a0a0a;
    border: none;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
  }
  .primary-btn:hover:not(:disabled) {
    transform: scale(1.03);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.14);
  }
  .primary-btn:active:not(:disabled) {
    transform: scale(0.98);
  }
  .primary-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: #555555;
    color: #aaaaaa;
  }

  .output-block {
    margin-top: 18px;
  }
  .output-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .output-actions {
    display: flex;
    gap: 8px;
  }
  .mini-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 30px;
    padding: 0 12px;
    background: none;
    border: 1px solid #333333;
    border-radius: 999px;
    color: #bbbbbb;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  .mini-btn:hover {
    border-color: #666666;
    color: #ffffff;
  }
  .output-area {
    width: 100%;
    min-height: 120px;
    resize: vertical;
    background-color: #0d0d0d;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 14px;
    color: #d6d6d6;
    font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
    font-size: 12.5px;
    line-height: 1.6;
    outline: none;
    word-break: break-all;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background-color: rgba(220, 60, 60, 0.12);
    border: 1px solid rgba(220, 80, 80, 0.4);
    border-radius: 12px;
    color: #ff9a9a;
    font-size: 13px;
  }

  .toast {
    position: fixed;
    left: 50%;
    bottom: 40px;
    transform: translateX(-50%);
    z-index: 50;
    padding: 10px 20px;
    background-color: rgba(20, 20, 20, 0.92);
    border: 1px solid #3a3a3a;
    border-radius: 999px;
    color: #ffffff;
    font-size: 13px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .cipher-footer {
    text-align: center;
    color: #555555;
    font-size: 13px;
    margin-top: 30px;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 720px) {
    .cipher-page {
      padding: 40px 16px 30px;
    }
    .page-title h1 {
      font-size: 22px;
    }
    .top-bar {
      flex-direction: column;
      gap: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cipher-page {
      animation: none;
    }
    .seg-indicator {
      transition: none;
    }
  }
</style>
