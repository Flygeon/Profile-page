/**
 * Svelte action: 鼠标在卡片内移动时产生跟随光标的径向渐变效果
 * 用法: <div class="card" use:cardGradient>...</div>
 */
export function cardGradient(node) {
  function handleMove(e) {
    node.style.setProperty('--mouse-x', `${e.clientX}px`)
    node.style.setProperty('--mouse-y', `${e.clientY}px`)
  }

  function handleLeave() {
    node.style.removeProperty('--mouse-x')
    node.style.removeProperty('--mouse-y')
  }

  node.addEventListener('mousemove', handleMove)
  node.addEventListener('mouseleave', handleLeave)

  return {
    destroy() {
      node.removeEventListener('mousemove', handleMove)
      node.removeEventListener('mouseleave', handleLeave)
    }
  }
}
