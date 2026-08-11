import type { ErrorResponse, ResponseModel } from './types'
import { createApiError } from './api-error'

/** 判断值是否具有 { code, ... } 的响应包络结构。 */
export function isResponseModel(value: unknown): value is ResponseModel {
  return typeof value === 'object' && value !== null && 'code' in value
}

/** 业务码既非 0 也非 200 时视为错误响应。 */
export function isErrorResponse(response: ResponseModel): response is ErrorResponse {
  return response.code !== 0 && response.code !== 200
}

/** 统一解包 JSON 响应：错误包络抛出 createApiError，非包络数据（如 Blob、ArrayBuffer）原样透传。 */
export function unwrapResponseData(data: unknown): unknown {
  if (!isResponseModel(data))
    return data
  if (isErrorResponse(data))
    throw createApiError(data)
  return data.data
}
