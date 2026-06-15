import { defineStore } from 'pinia';
import { getToken, setToken as saveToken, removeToken, getRefreshToken, removeRefreshToken } from '@/utils/token';

interface AuthState {
  token: string | undefined;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: getToken() || undefined,
  }),
  actions: {
    setToken(data: { accessToken: string; refreshToken: string }) {
      saveToken(data);
      this.token = data.accessToken;
    },
    resetToken() {
      this.token = undefined;
      removeToken();
      removeRefreshToken();
    },
    resetLoginState() {
      this.resetToken();
      // Dynamic imports avoid circular dependencies between stores
      import('@/store/modules').then(({ useUserStore, usePermissionStore, useTabStore }) => {
        useUserStore?.().$reset();
        usePermissionStore?.().$reset();
        useTabStore?.().$reset();
      }).catch(() => {
        // Fallback: window.__stores for compatibility
        const stores = window.__stores || {};
        stores.useUserStore?.().$reset();
        stores.usePermissionStore?.().$reset();
        stores.useTabStore?.().$reset();
      });
    },
    async logout() {
      try {
        const { UserApi } = await import('@/api/user/user');
        await UserApi.logout();
      } catch {
        // ignore logout API error
      }
      this.resetLoginState();
      window.location.href = '/#/login';
    },
  },
  persist: {
    pick: ['token'],
  },
});
