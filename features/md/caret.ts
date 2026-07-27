// 计算 textarea 中光标的像素坐标（相对 textarea 左上角）。
// 采用镜像 div 技术：复制 textarea 的关键样式到一个隐藏 div，
// 在光标位置插入 span，读取 span 的 offset 得到坐标。
const MIRROR_PROPS = [
  'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
  'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
  'letterSpacing', 'wordSpacing', 'tabSize', 'whiteSpace', 'wordWrap',
] as const

export interface CaretCoords {
  top: number
  left: number
  height: number
}

export function getCaretCoordinates(el: HTMLTextAreaElement, position: number): CaretCoords {
  const div = document.createElement('div')
  const style = div.style
  const computed = window.getComputedStyle(el)

  style.position = 'absolute'
  style.visibility = 'hidden'
  style.whiteSpace = 'pre-wrap'
  style.wordWrap = 'break-word'

  const styleMap = style as unknown as Record<string, string>
  const computedMap = computed as unknown as Record<string, string>
  for (const prop of MIRROR_PROPS) {
    styleMap[prop] = computedMap[prop]
  }

  div.textContent = el.value.slice(0, position)
  const span = document.createElement('span')
  span.textContent = el.value.slice(position) || '.'
  div.appendChild(span)

  document.body.appendChild(div)
  const coords: CaretCoords = {
    top: span.offsetTop + parseInt(computed.borderTopWidth || '0', 10) - el.scrollTop,
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || '0', 10) - el.scrollLeft,
    height: parseInt(computed.lineHeight || '18', 10),
  }
  document.body.removeChild(div)
  return coords
}
