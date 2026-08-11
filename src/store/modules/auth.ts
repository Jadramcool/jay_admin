import { defineStore } from 'pinia'
import { logAuthLifecycle } from '@/utils/http/auth-audit'
import { getToken, removeToken, setToken as saveToken } from '@/utils/token'
import { usePermissionStore } from './permission'
import { useTabStore } from './tab'
import { useUserStore } from './user'

interface AuthState {
  token: string | undefined
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: getToken() || undefined,
  }),
  actions: {
    syncToken() {
      this.token = getToken() || undefined
    },
    setToken(data: { accessToken: string, refreshToken: string }) {
      saveToken(data)
      this.syncToken()
      logAuthLifecycle('session-established')
    },
    resetToken() {
      removeToken()
      this.syncToken()
    },
    resetLoginState(reason = 'manual') {
      this.resetToken()
      useUserStore().$reset()
      usePermissionStore().$reset()
      useTabStore().$reset()
      logAuthLifecycle('auth-cleared', { reason })
    },
    async logout() {
      try {
        const { UserApi } = await import('@/api/user/user')
        await UserApi.logout()
      }
      catch {
        // ignore logout API error
      }
      this.resetLoginState('logout')
      window.location.href = '/#/login'
    },
  },
})
