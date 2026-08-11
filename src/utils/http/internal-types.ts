import type { InternalAxiosRequestConfig } from 'axios'
import type { RequestOptions } from './types'

/** HTTP 客户端内部状态，不属于业务请求的公开 API。 */
export interface InternalRequestConfig<D = unknown>
  extends InternalAxiosRequestConfig<D>, RequestOptions {
  _retry?: boolean
  _replayCount?: 0 | 1
}
