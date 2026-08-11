import type { App, DirectiveBinding } from 'vue'

/**
 * 全局水印指令 v-watermark
 *
 * 用法: <div v-watermark="'内容'"> 或 v-watermark="['第一行', '第二行']"
 * 特性:
 *   - Canvas 生成旋转文字背景,平铺覆盖元素(pointer-events: none,不阻塞交互)
 *   - MutationObserver 防篡改:水印层被删除/修改时自动重建
 *   - updated 钩子:内容变化时重建
 */

interface WatermarkOptions {
  content: string | string[]
  fontSize?: number
  color?: string
  opacity?: number
  rotate?: number
}

const DEFAULT_OPTIONS: Required<Pick<WatermarkOptions, 'fontSize' | 'color' | 'opacity' | 'rotate'>> = {
  fontSize: 14,
  color: '#000',
  opacity: 0.06,
  rotate: -22,
}

const WATERMARK_CLASS = 'watermark-layer'

function createLayer(el: HTMLElement, raw: string | string[]) {
  const lines = Array.isArray(raw) ? raw.filter(Boolean) : [raw]
  if (lines.length === 0 || lines.every(line => !line.trim()))
    return

  const { fontSize, color, opacity, rotate } = DEFAULT_OPTIONS
  const canvas = document.createElement('canvas')
  const maxLine = Math.max(...lines.map(line => line.length))
  const lineHeight = fontSize * 1.6
  canvas.width = Math.ceil(fontSize * maxLine * 0.9 + 40)
  canvas.height = Math.ceil(lineHeight * lines.length + 40)

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  ctx.font = `${fontSize}px system-ui, sans-serif`
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, (index - (lines.length - 1) / 2) * lineHeight)
  })

  const layer = document.createElement('div')
  layer.className = WATERMARK_CLASS
  layer.style.cssText = [
    'position: fixed',
    'inset: 0',
    'z-index: 9999',
    'pointer-events: none',
    `background-image: url(${canvas.toDataURL()})`,
    'background-repeat: repeat',
  ].join(';')
  el.appendChild(layer)
}

function removeLayer(el: HTMLElement) {
  el.querySelectorAll(`.${WATERMARK_CLASS}`).forEach(node => node.remove())
}

/** 防篡改:观察水印层,被删除/修改时自动重建 */
function attachObserver(el: HTMLElement, value: string | string[], observers: WeakMap<HTMLElement, MutationObserver>) {
  const observer = new MutationObserver((mutations) => {
    const removed = mutations.some((mutation) => {
      return [...mutation.removedNodes].some(
        node => node instanceof HTMLElement && node.classList.contains(WATERMARK_CLASS),
      )
    })
    if (removed && !el.querySelector(`.${WATERMARK_CLASS}`))
      createLayer(el, value)
  })
  observer.observe(el, { childList: true, subtree: true })
  observers.set(el, observer)
}

export function watermarkDirective(app: App) {
  const observers = new WeakMap<HTMLElement, MutationObserver>()

  app.directive('watermark', {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
      createLayer(el, binding.value)
      attachObserver(el, binding.value, observers)
    },
    updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
      removeLayer(el)
      createLayer(el, binding.value)
    },
    unmounted(el: HTMLElement) {
      observers.get(el)?.disconnect()
      observers.delete(el)
      removeLayer(el)
    },
  })
}

/** 独立使用:给元素加防篡改水印(指令方式即可满足,此导出供需要时直接调用) */
export function attachWatermarkGuard(el: HTMLElement, value: string | string[]) {
  createLayer(el, value)
}
