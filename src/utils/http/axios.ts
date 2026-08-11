import type {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios'
import type { InternalRequestConfig } from './internal-types'
import type {
  ArrayBufferRequestConfig,
  BlobRequestConfig,
  JsonRequestConfig,
  RequestConfig,
  ResponseModel,
  UploadRequestConfig,
} from './types'
import axios from 'axios'
import qs from 'qs'
import { navigateToLogin } from '@/router/auth-navigation'
import { useAuthStore } from '@/store/modules/auth'
import {
  getRefreshToken,
  getToken,
  removeToken,
  setToken,
} from '@/utils/token'
import { ApiError, createApiError, normalizeApiError } from './api-error'
import { logAuthLifecycle } from './auth-audit'
import { errorHandler } from './error-handler'
import { shouldShowGlobalError } from './error-policy'
import {
  isErrorResponse,
  unwrapResponseData,
} from './response-transform'
import { TokenRefreshCoordinator } from './token-refresh-coordinator'

const env = import.meta.env

/**
 * HTTP 客户端：注入 Bearer Token、按请求键取消重复请求、统一解包响应包络，
 * 401 时经协调器单飞刷新令牌并重放原请求，会话失效则统一兜底登出。
 */
class HttpRequest {
  private service: AxiosInstance
  private pendingMap = new Map<string, AbortController>()
  private refreshCoordinator = new TokenRefreshCoordinator()
  private authFailurePromise: Promise<void> | null = null

  /** 创建 axios 实例并注册请求/响应拦截器。 */
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

  /**
   * 由 method/url/params/data 生成请求唯一键，用于相同请求的去重；
   * FormData 经 JSON 序列化会失真，据此生成的去重键可能不可靠。
   */
  private getRequestKey(config: RequestConfig): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`
  }

  /** 将请求登记进 pendingMap 并中断此前相同的在途请求；skipDuplicate 时跳过。 */
  private addPending(config: InternalRequestConfig): void {
    if (config.skipDuplicate)
      return

    const key = this.getRequestKey(config)
    this.pendingMap.get(key)?.abort()

    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingMap.set(key, controller)
  }

  /** 请求落定后从 pendingMap 移除对应登记。 */
  private removePending(config?: RequestConfig): void {
    if (!config || config.skipDuplicate)
      return
    this.pendingMap.delete(this.getRequestKey(config))
  }

  /**
   * 注册请求/响应拦截器：请求侧注入 Token（skipAuth 除外）、FormData 去掉 Content-Type 并登记去重；
   * 响应侧解包包络、登录成功后重置刷新会话，401 且未跳过自动刷新时走令牌刷新重放，否则按策略提示后抛出。
   */
  private setupInterceptors(): void {
    this.service.interceptors.request.use(
      (rawConfig) => {
        const config = rawConfig as InternalRequestConfig
        const token = getToken()
        if (token && !config.skipAuth) {
          (config.headers ??= {} as AxiosRequestHeaders).Authorization
            = `Bearer ${token}`
        }
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type']
        }
        this.addPending(config)
        return config
      },
      error => Promise.reject(normalizeApiError(error)),
    )

    this.service.interceptors.response.use(
      (response: AxiosResponse<unknown>): AxiosResponse => {
        const config = response.config as InternalRequestConfig
        this.removePending(config)
        const { data } = response

        try {
          const result = unwrapResponseData(data)
          if (config.url?.includes('/auth/login')) {
            this.refreshCoordinator.reset()
            this.authFailurePromise = null
          }
          return result as AxiosResponse
        }
        catch (error) {
          const apiError = normalizeApiError(error)
          if (shouldShowGlobalError(apiError, config.silentFail))
            errorHandler(apiError)
          throw apiError
        }
      },
      async (error) => {
        const config = error.config as InternalRequestConfig | undefined
        this.removePending(config)
        const apiError = normalizeApiError(error)

        if (apiError.kind === 'cancelled')
          return Promise.reject(apiError)

        if (
          apiError.status === 401
          && !config?.skipAuthRefresh
          && !config?.url?.includes('/auth/login')
        ) {
          return this.handleRefreshToken(config)
        }

        if (shouldShowGlobalError(apiError, config?.silentFail))
          errorHandler(apiError)
        return Promise.reject(apiError)
      },
    )
  }

  /** 调用刷新接口换取新令牌对并写入存储，返回新的 access token；失败抛出归一化的 ApiError。 */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post<ResponseModel<Api.RefreshResult>>(
        `${env.VITE_API_BASE_URL}/auth/refresh`,
        { refreshToken },
      )
      if (isErrorResponse(response.data))
        throw createApiError(response.data)

      const result = response.data.data
      setToken({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || refreshToken,
      })
      useAuthStore().syncToken()
      return result.accessToken
    }
    catch (error) {
      throw normalizeApiError(error)
    }
  }

  /**
   * 401 恢复编排：阻止同一请求重复重放，经协调器合并并发刷新，成功后重打 Authorization 头
   * 并重放原请求，返回重放后的请求 Promise；刷新失败则触发会话失效兜底。
   */
  private async handleRefreshToken(
    config?: InternalRequestConfig,
  ): Promise<unknown> {
    if (!config) {
      const apiError = new ApiError({ code: 40102, status: 401 })
      errorHandler(apiError)
      return Promise.reject(apiError)
    }

    if (config._retry || config._replayCount === 1) {
      await this.handleAuthFailure('replayed-request-unauthorized')
      return Promise.reject(new ApiError({ code: 40102, status: 401 }))
    }
    config._retry = true
    config._replayCount = 1

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      await this.handleAuthFailure('missing-refresh-token')
      return Promise.reject(new ApiError({ code: 40102, status: 401 }))
    }

    const current = this.refreshCoordinator.snapshot
    logAuthLifecycle(
      current.state === 'refreshing' ? 'refresh-joined' : 'refresh-started',
      {
        attempt: current.state === 'refreshing' ? current.attempt : current.attempt + 1,
        path: config.url,
        replayCount: config._replayCount,
        state: current.state,
      },
    )

    try {
      const token = await this.refreshCoordinator.run(() =>
        this.refreshAccessToken(refreshToken),
      )
      if (!token) {
        throw new ApiError({ code: 40102, status: 401 })
      }

      const snapshot = this.refreshCoordinator.snapshot
      logAuthLifecycle('refresh-succeeded', {
        attempt: snapshot.attempt,
        path: config.url,
        state: snapshot.state,
      })
      const headers = (config.headers ??= {} as AxiosRequestHeaders)
      headers.Authorization = `Bearer ${token}`
      logAuthLifecycle('request-replayed', {
        path: config.url,
        replayCount: config._replayCount,
      })
      return this.service(config)
    }
    catch (error) {
      const apiError = normalizeApiError(error)
      const snapshot = this.refreshCoordinator.snapshot
      logAuthLifecycle('refresh-failed', {
        attempt: snapshot.attempt,
        path: config.url,
        reason: apiError.kind,
        state: snapshot.state,
      })
      await this.handleAuthFailure('refresh-failed')
      return Promise.reject(apiError)
    }
  }

  /** 单飞处理会话失效：合并并发 401 失败，清除登录态、提示登录过期并延迟跳转登录页。 */
  private handleAuthFailure(reason: string): Promise<void> {
    if (this.authFailurePromise)
      return this.authFailurePromise

    this.authFailurePromise = (async () => {
      try {
        useAuthStore().resetLoginState(reason)
      }
      catch {
        removeToken()
        logAuthLifecycle('auth-cleared', { reason })
      }

      window.$message?.error?.('登录状态已失效，请重新登录')

      setTimeout(() => {
        void navigateToLogin()
      }, 200)
    })()

    return this.authFailurePromise
  }

  /** GET 请求，返回解包后的业务数据。 */
  get<T = unknown, P = unknown>(config: JsonRequestConfig<never, P>): Promise<T> {
    return this.service({ ...config, method: 'GET' }) as Promise<T>
  }

  /** POST 请求，返回解包后的业务数据。 */
  post<T = unknown, D = unknown, P = unknown>(config: JsonRequestConfig<D, P>): Promise<T> {
    return this.service({ ...config, method: 'POST' }) as Promise<T>
  }

  /** PUT 请求，返回解包后的业务数据。 */
  put<T = unknown, D = unknown, P = unknown>(config: JsonRequestConfig<D, P>): Promise<T> {
    return this.service({ ...config, method: 'PUT' }) as Promise<T>
  }

  /** DELETE 请求，返回解包后的业务数据。 */
  delete<T = unknown, D = unknown, P = unknown>(config: JsonRequestConfig<D, P>): Promise<T> {
    return this.service({ ...config, method: 'DELETE' }) as Promise<T>
  }

  /** 以 FormData 发起 multipart 上传请求。 */
  upload<T = unknown, P = unknown>(config: UploadRequestConfig<P>): Promise<T> {
    return this.service({ ...config, method: 'POST' }) as Promise<T>
  }

  /** GET 下载请求，按 responseType 返回 Blob 或 ArrayBuffer。 */
  download<P = unknown>(config: BlobRequestConfig<P>): Promise<Blob>
  download<P = unknown>(config: ArrayBufferRequestConfig<P>): Promise<ArrayBuffer>
  download<P = unknown>(config: BlobRequestConfig<P> | ArrayBufferRequestConfig<P>): Promise<Blob | ArrayBuffer> {
    return this.service({
      ...config,
      method: 'GET',
      responseType: config.responseType ?? 'blob',
    }) as Promise<Blob | ArrayBuffer>
  }

  /** 最底层的通用透传入口，适用于需要自定义配置的请求。 */
  request<T = unknown, D = unknown, P = unknown>(config: RequestConfig<D, P>): Promise<T> {
    return this.service(config) as Promise<T>
  }
}

export default new HttpRequest()
