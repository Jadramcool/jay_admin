import type { App } from 'vue'
import type { Router } from 'vue-router'
import { getToken } from '@/utils/token'

/**
 * 前端错误监控与埋点
 *
 * 采集:JS 运行时错误 / Promise 拒绝 / Vue 组件错误 / 路由访问
 * 上报:批量防抖(5 条或 5 秒)POST /api/metrics/events;
 *       失败时写入 localStorage 缓冲,下次上报重试(上限 50 条)
 */

interface MonitorEvent {
  type: 'error' | 'pageview'
  category?: string
  message?: string
  stack?: string
  url?: string
  route?: string
  extra?: Record<string, unknown>
}

const STORAGE_KEY = 'JDM_MONITOR_QUEUE'
const FLUSH_INTERVAL = 5000
const FLUSH_THRESHOLD = 5
const MAX_BUFFER = 50

const queue: MonitorEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null

function readBuffer(): MonitorEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MonitorEvent[]) : []
  }
  catch {
    return []
  }
}

function writeBuffer(events: MonitorEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_BUFFER)))
  }
  catch {
    /* storage 不可用时静默丢弃 */
  }
}

function push(event: MonitorEvent) {
  queue.push(event)
  if (queue.length >= FLUSH_THRESHOLD)
    flush()
  else
    scheduleFlush()
}

function scheduleFlush() {
  if (timer)
    return
  timer = setTimeout(() => {
    timer = null
    flush()
  }, FLUSH_INTERVAL)
}

async function flush() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  const events = [...queue, ...readBuffer()]
  if (events.length === 0)
    return
  queue.length = 0

  try {
    const res = await fetch('/api/metrics/events', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ events }),
    })
    if (res.ok)
      writeBuffer([])
    else
      writeBuffer(events)
  }
  catch {
    writeBuffer(events)
  }
}

function truncate(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value
}

declare global {
  interface Window {
    __JDM_MONITOR__?: boolean
  }
}

/** 初始化监控(幂等) */
export function initMonitor(app: App, router: Router) {
  if (window.__JDM_MONITOR__)
    return
  window.__JDM_MONITOR__ = true

  const currentRoute = () => router.currentRoute.value.fullPath

  // JS 运行时错误
  window.addEventListener('error', (event) => {
    push({
      type: 'error',
      category: 'JS_ERROR',
      message: truncate(event.message, 500),
      stack: truncate(event.error?.stack || '', 4000),
      url: location.href,
      route: currentRoute(),
    })
  })

  // Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as Error | unknown
    push({
      type: 'error',
      category: 'UNHANDLED_REJECTION',
      message: truncate(String((reason as Error)?.message ?? reason), 500),
      stack: truncate((reason as Error)?.stack || '', 4000),
      url: location.href,
      route: currentRoute(),
    })
  })

  // Vue 组件错误
  app.config.errorHandler = (err, _instance, info) => {
    push({
      type: 'error',
      category: 'VUE_ERROR',
      message: truncate(String((err as Error)?.message ?? err), 500),
      stack: truncate((err as Error)?.stack || '', 4000),
      url: location.href,
      route: currentRoute(),
      extra: { info },
    })
  }

  // 路由访问埋点
  router.afterEach((to) => {
    push({
      type: 'pageview',
      category: 'ROUTE_CHANGE',
      route: to.fullPath,
      url: location.href,
    })
  })

  // 页面卸载/切后台时尽力上报
  window.addEventListener('beforeunload', () => flush())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden')
      flush()
  })
}
