export type TokenRefreshState = 'failed' | 'idle' | 'refreshing'

export interface TokenRefreshSnapshot {
  attempt: number
  state: TokenRefreshState
}

/**
 * 合并并发刷新请求，并在刷新失败后阻止旧会话继续尝试刷新。
 * 登录成功后必须调用 reset() 开启新会话。
 */
export class TokenRefreshCoordinator {
  private attempt = 0
  private refreshPromise: Promise<string> | null = null
  private state: TokenRefreshState = 'idle'

  /** 只读快照，暴露当前尝试次数与刷新状态。 */
  get snapshot(): Readonly<TokenRefreshSnapshot> {
    return { attempt: this.attempt, state: this.state }
  }

  /**
   * 单飞执行刷新：并发调用方共享同一个在途 Promise；刷新成功回到 idle，
   * 失败后会话永久锁定为 failed，须 reset() 后才能开启新一轮。返回共享的 Promise。
   */
  run(refresh: () => Promise<string>): Promise<string> {
    if (this.refreshPromise)
      return this.refreshPromise

    if (this.state === 'failed')
      return Promise.reject(new Error('Token refresh session has failed'))

    this.attempt += 1
    this.state = 'refreshing'

    const refreshPromise = refresh()
      .then((token) => {
        this.state = 'idle'
        return token
      })
      .catch((error: unknown) => {
        this.state = 'failed'
        throw error
      })
      .finally(() => {
        if (this.refreshPromise === refreshPromise)
          this.refreshPromise = null
      })

    this.refreshPromise = refreshPromise
    return refreshPromise
  }

  /** 重置协调器，为新登录会话重新武装。 */
  reset(): void {
    this.attempt = 0
    this.refreshPromise = null
    this.state = 'idle'
  }
}
