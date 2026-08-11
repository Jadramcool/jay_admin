import { normalizeApiError } from './api-error'

/** 判断一次失败是否应触发全局提示，不改变错误向业务层抛出的语义。 */
export function shouldShowGlobalError(
  error: unknown,
  silentFail = false,
): boolean {
  if (silentFail)
    return false
  return normalizeApiError(error).kind !== 'cancelled'
}
