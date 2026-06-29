import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import type { ResponseModel } from './types'
import axios from 'axios'
import qs from 'qs'
import {
  getRefreshToken,
  getToken,
  removeToken,
  setToken,
} from '@/utils/token'
import { errorHandler } from './error-handler'

const env = import.meta.env

class HttpRequest {
  private service: AxiosInstance
  private pendingMap = new Map<string, AbortController>()
  private refreshTokenPromise: Promise<any> | null = null
  private authFailing = false

  constructor() {
    this.service = axios.create({
      baseURL: env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      paramsSerializer: params =>
        qs.stringify(params, { arrayFormat: 'repeat' }),
    })
    this.setupInterceptors()
  }

  private getRequestKey(config: AxiosRequestConfig): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`
  }

  private addPending(config: InternalAxiosRequestConfig): void {
    const key = this.getRequestKey(config)
    if (this.pendingMap.has(key)) {
      this.pendingMap.get(key)!.abort()
    }
    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingMap.set(key, controller)
  }

  private removePending(config: AxiosRequestConfig): void {
    const key = this.getRequestKey(config)
    this.pendingMap.delete(key)
  }

  private setupInterceptors(): void {
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getToken()
        if (token) {
          (config.headers ??= {} as AxiosRequestHeaders).Authorization
            = `Bearer ${token}`
        }
        // FormData 请求删除 Content-Type，让浏览器自动设置 multipart boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type']
        }
        this.addPending(config)
        return config
      },
      error => Promise.reject(error),
    )

    this.service.interceptors.response.use(
      (response: AxiosResponse<ResponseModel>) => {
        this.removePending(response.config)
        const { data } = response
        if (data.code !== 200 && data.code !== 0) {
          return Promise.reject(new Error(data.message))
        }
        return data.data !== undefined ? (data.data as any) : data
      },
      async (error) => {
        this.removePending(error.config || {})
        if (axios.isCancel(error))
          return Promise.reject(error)

        // 已由 handleAuthFailure 处理过（清 token + 弹"登录已过期"），不再重复
        if (error._authHandled)
          return Promise.reject(error)

        const { response } = error

        // 401 → token 刷新或鉴权失败处理（登录接口除外）
        if (response?.status === 401) {
          // 登录接口的 401 是密码错误，不走 token 刷新
          if (response.config?.url?.includes('/auth/login')) {
            errorHandler(error)
            return Promise.reject(error)
          }
          const ret = await this.handleRefreshToken(error.config)
          return ret
        }

        // 标记了静默失败 → 不弹 toast，直接 reject
        if ((error.config as any)?.silentFail) {
          return Promise.reject(error)
        }

        // 其余所有错误：默认用后端返回的 message 弹 toast
        errorHandler(error)
        return Promise.reject(error)
      },
    )
  }

  private async handleRefreshToken(config: any): Promise<any> {
    if (config._retry) {
      await this.handleAuthFailure()
      const err = new Error('Token refresh loop detected');
      (err as any)._authHandled = true
      return Promise.reject(err)
    }
    config._retry = true

    if (!this.refreshTokenPromise && !this.authFailing) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        this.handleAuthFailure()
        const err = new Error('No refresh token');
        (err as any)._authHandled = true
        return Promise.reject(err)
      }

      this.refreshTokenPromise = axios
        .post(`${env.VITE_API_BASE_URL}/auth/refresh`, { refreshToken })
        .then((res) => {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data
          setToken({ accessToken, refreshToken: newRefreshToken })
          return accessToken
        })
        .catch(async () => {
          await this.handleAuthFailure()
          return null
        })
    }

    const token = await this.refreshTokenPromise
    this.refreshTokenPromise = null
    if (token) {
      (config.headers ??= {} as AxiosRequestHeaders).Authorization
        = `Bearer ${token}`
      return this.service(config)
    }
    const err = new Error('Refresh failed');
    (err as any)._authHandled = true
    return Promise.reject(err)
  }

  private async handleAuthFailure(): Promise<void> {
    if (this.authFailing)
      return
    this.authFailing = true

    try {
      const { useAuthStore } = await import('@/store/modules/auth')
      const authStore = useAuthStore()
      authStore.resetLoginState()
    }
    catch {
      removeToken()
    }

    window.$message?.error?.('登录已过期，请重新登录')

    // Soft redirect via router; fallback to hard redirect if router not available
    try {
      const { default: router } = await import('@/router')
      setTimeout(() => router.push('/login'), 200)
    }
    catch {
      setTimeout(() => {
        window.location.href = '/#/login'
      }, 1500)
    }
  }

  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.service({ ...config, method: 'GET' })
  }

  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.service({ ...config, method: 'POST' })
  }

  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.service({ ...config, method: 'PUT' })
  }

  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.service({ ...config, method: 'DELETE' })
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.service(config)
  }
}

export default new HttpRequest()
