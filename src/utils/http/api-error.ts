import type { AxiosError } from 'axios'
import type {
  ApiErrorKind,
  ApiFieldError,
  ErrorResponse,
} from './types'
import axios from 'axios'

/** 构造业务错误的选项：code/status/traceId/fieldErrors/kind 描述错误语义，message 为后端原文、展示时优先。 */
export interface ApiErrorOptions {
  code?: number
  status?: number
  traceId?: string
  fieldErrors?: ApiFieldError[]
  kind?: ApiErrorKind
  /** 后端返回的业务错误信息，展示时优先于安全兜底文案 */
  message?: string
}

const SAFE_MESSAGES: Record<number, string> = {
  400: '请求无法处理，请检查后重试',
  401: '登录状态已失效，请重新登录',
  403: '您没有执行此操作的权限',
  404: '请求的资源不存在',
  409: '数据已存在或状态冲突，请刷新后重试',
  422: '提交内容有误，请检查后重试',
  429: '请求过于频繁，请稍后重试',
  500: '服务暂时不可用，请稍后重试',
}

const SAFE_CODE_MESSAGES: Record<number, string> = {
  40102: '登录状态已过期，请重新登录',
  40103: '用户名或密码错误',
  40302: '账号已被禁用，请联系管理员',
}

/** 由业务码推导 HTTP 状态：>=10000 截断到百位，4xx/5xx 业务码原样映射，其余返回 undefined。 */
function inferStatus(code?: number): number | undefined {
  if (!code)
    return undefined
  if (code >= 10000)
    return Math.trunc(code / 100)
  if (code >= 400 && code < 600)
    return code
  return undefined
}

/**
 * 按优先级挑选展示文案：传输类错误（取消/网络/超时）→ 后端 message（去空白后视为未提供）→
 * SAFE_CODE_MESSAGES → 按 status 的 SAFE_MESSAGES → 通用兜底文案。
 */
function getSafeMessage(options: ApiErrorOptions): string {
  if (options.kind === 'cancelled')
    return '请求已取消'
  if (options.kind === 'network')
    return '网络连接异常，请检查网络后重试'
  if (options.kind === 'timeout')
    return '请求超时，请稍后重试'

  // 后端返回的业务错误信息优先展示；空白内容视为未提供，继续走兜底
  const backendMessage = typeof options.message === 'string'
    ? options.message.trim()
    : ''
  if (backendMessage)
    return backendMessage

  if (options.code && SAFE_CODE_MESSAGES[options.code])
    return SAFE_CODE_MESSAGES[options.code]

  const status = options.status ?? inferStatus(options.code)
  if (status && SAFE_MESSAGES[status])
    return SAFE_MESSAGES[status]
  if (status && status >= 500)
    return SAFE_MESSAGES[500]
  return '请求失败，请稍后重试'
}

/** 结构化业务错误，承载 code/status/traceId/fieldErrors/kind，展示文案 message 由安全文案规则计算。 */
export class ApiError extends Error {
  readonly code?: number
  readonly status?: number
  readonly traceId?: string
  readonly fieldErrors?: ApiFieldError[]
  readonly kind: ApiErrorKind

  /** 依据选项生成 ApiError，message 走 getSafeMessage 安全兜底规则。 */
  constructor(options: ApiErrorOptions = {}) {
    super(getSafeMessage(options))
    this.name = 'ApiError'
    this.code = options.code
    this.status = options.status ?? inferStatus(options.code)
    this.traceId = options.traceId
    this.fieldErrors = options.fieldErrors
    this.kind = options.kind ?? 'business'
  }
}

/** 类型守卫：判断值是否为 ApiError 实例。 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** 由后端错误包络（code/message/traceId/fieldErrors）与 HTTP status 构建 ApiError。 */
export function createApiError(
  response: Pick<Partial<ErrorResponse>, 'code' | 'fieldErrors' | 'message' | 'traceId'>,
  status?: number,
): ApiError {
  return new ApiError({
    code: typeof response.code === 'number' ? response.code : undefined,
    status,
    traceId: response.traceId,
    fieldErrors: response.fieldErrors,
    message: response.message,
  })
}

/**
 * 将任意抛出的值归一化为 ApiError：ApiError 原样透传，axios 取消/超时/网络失败分类处理，
 * 含响应体时解析包络，其余情况归为 unexpected。
 */
export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error))
    return error

  if (axios.isCancel(error)) {
    return new ApiError({ kind: 'cancelled' })
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Partial<ErrorResponse>>
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return new ApiError({ kind: 'timeout' })
    }
    if (!axiosError.response) {
      return new ApiError({ kind: 'network' })
    }
    return createApiError(axiosError.response.data ?? {}, axiosError.response.status)
  }

  return new ApiError({
    kind: 'unexpected',
    message: error instanceof Error ? error.message : undefined,
  })
}
