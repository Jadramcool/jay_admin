import { normalizeApiError } from './api-error'

/**
 * 归一化错误并统一提示：取消类错误静默忽略，DEV 环境打印元数据，
 * 5xx 且带 traceId 时在提示语后追加追踪 ID。silentFail 的放行判断由 error-policy 完成。
 */
export function errorHandler(error: unknown): void {
  const apiError = normalizeApiError(error)
  if (apiError.kind === 'cancelled')
    return

  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      code: apiError.code,
      status: apiError.status,
      traceId: apiError.traceId,
      fieldErrors: apiError.fieldErrors,
      message: apiError.message,
      kind: apiError.kind,
    })
  }

  const traceSuffix
    = apiError.status && apiError.status >= 500 && apiError.traceId
      ? `（追踪 ID：${apiError.traceId}）`
      : ''
  window.$message?.error?.(`${apiError.message}${traceSuffix}`)
}
