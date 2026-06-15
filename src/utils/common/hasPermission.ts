import { usePermissionStore } from '@/store/modules/permission'

export function hasPermission(permission: string): boolean {
  const permissionStore = usePermissionStore()
  return permissionStore.buttonPermissionKeys.includes(permission)
}

export async function isAdmin(): Promise<boolean> {
  const { useUserStore } = await import('@/store/modules/user')
  const userStore = useUserStore()
  return userStore.userInfo?.roleType === 'admin'
}
