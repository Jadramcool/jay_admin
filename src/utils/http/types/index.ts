import type {
  AxiosRequestConfig,
  ResponseType,
} from 'axios'

export interface ApiFieldError {
  field: string
  message: string
}

export interface SuccessResponse<T = unknown> {
  code: 0 | 200
  message: string
  data: T
}

export interface ErrorResponse {
  code: number
  message: string
  data: null
  traceId?: string
  fieldErrors?: ApiFieldError[]
}

export type ResponseModel<T = unknown> = SuccessResponse<T> | ErrorResponse

export interface RequestOptions {
  /** 关闭全局错误提示；异常仍会向调用方抛出。 */
  silentFail?: boolean
  /** 不携带 access token，适用于登录、注册和刷新等公开接口。 */
  skipAuth?: boolean
  /** 不参与相同请求的自动取消。 */
  skipDuplicate?: boolean
  /** 401 时不触发自动刷新，适用于退出等终止会话的请求。 */
  skipAuthRefresh?: boolean
  /** 单次请求超时时间，单位为毫秒。 */
  timeout?: number
  /** Axios 支持的响应解析方式；普通业务接口保持默认的 json。 */
  responseType?: ResponseType
}

export interface RequestConfig<D = unknown, P = unknown>
  extends Omit<AxiosRequestConfig<D>, 'params' | 'responseType' | 'timeout'>,
  RequestOptions {
  params?: P
}

export type JsonRequestConfig<D = unknown, P = unknown>
  = Omit<RequestConfig<D, P>, 'responseType'> & { responseType?: 'json' }

export type UploadRequestConfig<P = unknown>
  = Omit<JsonRequestConfig<FormData, P>, 'data' | 'method'> & { data: FormData }

export type BlobRequestConfig<P = unknown>
  = Omit<RequestConfig<never, P>, 'data' | 'method' | 'responseType'> & {
    responseType?: 'blob'
  }

export type ArrayBufferRequestConfig<P = unknown>
  = Omit<RequestConfig<never, P>, 'data' | 'method' | 'responseType'> & {
    responseType: 'arraybuffer'
  }

export type ApiErrorKind
  = | 'business'
    | 'cancelled'
    | 'network'
    | 'timeout'
    | 'unexpected'
