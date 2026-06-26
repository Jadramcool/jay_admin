import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

/**
 * WebSocket 连接管理 composable
 * 用于建立和维护 Socket.IO 长连接
 */
export function useSocket() {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)

  /**
   * 建立 WebSocket 连接
   * @param token JWT token
   * @param namespace 命名空间，默认 /notice
   */
  function connect(token: string, namespace = '/notice') {
    // 如果已有连接，先断开
    if (socket.value) {
      disconnect()
    }

    const baseUrl = import.meta.env.VITE_API_BASE || ''
    const url = baseUrl ? `${baseUrl.replace(/\/api$/, '')}` : 'http://localhost:3000'

    const s = io(`${url}${namespace}`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    })

    s.on('connect', () => {
      console.log('[WebSocket] 已连接')
      connected.value = true
    })

    s.on('disconnect', (reason) => {
      console.log('[WebSocket] 已断开:', reason)
      connected.value = false
    })

    s.on('connect_error', (err) => {
      console.error('[WebSocket] 连接错误:', err.message)
      connected.value = false
    })

    socket.value = s
  }

  /**
   * 监听事件
   */
  function on(event: string, handler: (...args: any[]) => void) {
    socket.value?.on(event, handler)
  }

  /**
   * 移除事件监听
   */
  function off(event: string, handler?: (...args: any[]) => void) {
    if (handler) {
      socket.value?.off(event, handler)
    }
    else {
      socket.value?.removeAllListeners(event)
    }
  }

  /**
   * 断开连接
   */
  function disconnect() {
    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value.disconnect()
      socket.value = null
    }
    connected.value = false
  }

  /**
   * 发送事件
   */
  function emit(event: string, ...args: any[]) {
    socket.value?.emit(event, ...args)
  }

  return {
    socket,
    connected,
    connect,
    disconnect,
    on,
    off,
    emit,
  }
}
