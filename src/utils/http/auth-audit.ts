import type { TokenRefreshState } from './token-refresh-coordinator'

export type AuthLifecycleEvent
  = | 'auth-cleared'
    | 'refresh-failed'
    | 'refresh-joined'
    | 'refresh-started'
    | 'refresh-succeeded'
    | 'request-replayed'
    | 'session-established'

export interface AuthAuditDetails {
  attempt?: number
  path?: string
  reason?: string
  replayCount?: number
  state?: TokenRefreshState
}

/** 仅记录生命周期元数据，禁止传入或输出 Token 原文。 */
export function logAuthLifecycle(
  event: AuthLifecycleEvent,
  details: AuthAuditDetails = {},
): void {
  if (!import.meta.env.DEV)
    return

  console.warn('[Auth Lifecycle]', {
    event,
    occurredAt: new Date().toISOString(),
    ...details,
  })
}
