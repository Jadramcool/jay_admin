import type { Router } from 'vue-router'
import { useAppStore, useAuthStore, usePermissionStore, useUserStore } from '@/store/modules'
import request from '@/utils/http/axios'

const WHITE_LIST: string[] = ['/login', '/404', '/403']

let initialCheckDone = false

async function getUserInfo(): Promise<Api.UserInfo | null> {
  try {
    return await request.get<Api.UserInfo>({ url: '/auth/user/info' })
  }
  catch {
    return null
  }
}

async function getMenus(): Promise<System.Menu[] | null> {
  try {
    return await request.get<System.Menu[]>({ url: '/auth/user/menu' })
  }
  catch {
    return null
  }
}

function finishInitialLoad() {
  if (!initialCheckDone) {
    initialCheckDone = true
    useAppStore().globalLoading = false
  }
}

export function createPermissionGuard(router: Router) {
  router.beforeEach(async (to: any) => {
    try {
      const permissionStore = usePermissionStore()
      const authStore = useAuthStore()
      const userStore = useUserStore()
      const { token } = authStore

      // ========== 无 token ==========
      if (!token) {
        finishInitialLoad()
        if (to.path === '/login')
          return true
        const redirect = to.path === '/' ? undefined : to.path
        return { path: '/login', query: redirect ? { redirect } : undefined }
      }

      // ========== 有 token ==========
      if (to.path === '/login')
        return { path: '/' }
      if (WHITE_LIST.includes(to.path))
        return true

      // 用户信息尚未加载 → 并行请求
      if (!userStore.userInfo?.id) {
        const [user, menus] = await Promise.all([getUserInfo(), getMenus()])

        if (!user) {
          authStore.resetLoginState()
          finishInitialLoad()
          return { path: '/login' }
        }

        userStore.setUser(user)

        if (!menus) {
          authStore.resetLoginState()
          window.$message?.error?.('无法获取权限信息，请重新登录')
          finishInitialLoad()
          return { path: '/login' }
        }

        // 统一走 createRoutes：空菜单也会生成仅含根路由的结构并置位
        // accessRoutes（若不置位，零菜单用户会在下方 !accessRoutes 分支被误判登出）
        permissionStore.setPermissions(menus)
        permissionStore.setMenus(menus)
        permissionStore.setRoutes(menus)
        await router.addRoute(permissionStore.accessRoutes!)

        return { path: to.path, query: to.query, hash: to.hash, replace: true }
      }

      // 用户信息已加载 → 检查路由是否存在
      finishInitialLoad()
      if (to.name && to.name !== 'NotFound' && router.hasRoute(to.name))
        return true

      // 路由不存在 → 是否因为没有 accessRoutes？
      if (!permissionStore.accessRoutes) {
        authStore.resetLoginState()
        return { path: '/login' }
      }

      return {
        path: '/404',
        query: { path: to.fullPath },
        replace: true,
      }
    }
    catch (error) {
      if (import.meta.env.DEV)
        console.error('路由守卫异常:', error)
      finishInitialLoad()
      return { path: '/login' }
    }
  })
}
