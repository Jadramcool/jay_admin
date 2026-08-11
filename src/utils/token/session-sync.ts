import type { Router } from 'vue-router'
import type { TokenStorageChange } from './index'
import { useAuthStore } from '@/store/modules'
import { subscribeTokenStorage } from './index'

export interface SessionSyncActions {
  clearSession: () => void
  redirectToLogin: () => void | Promise<unknown>
  syncSession: () => void
}

export function applyTokenStorageChange(
  change: TokenStorageChange,
  actions: SessionSyncActions,
): void {
  if (change === 'session-updated') {
    actions.syncSession()
    return
  }

  actions.clearSession()
  void actions.redirectToLogin()
}

export function setupAuthSessionSync(router: Router): () => void {
  return subscribeTokenStorage((change) => {
    const authStore = useAuthStore()
    applyTokenStorageChange(change, {
      clearSession: () => authStore.resetLoginState('cross-tab-logout'),
      redirectToLogin: () => router.replace('/login'),
      syncSession: () => authStore.syncToken(),
    })
  })
}
