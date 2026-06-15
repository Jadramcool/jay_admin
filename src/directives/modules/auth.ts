import type { App } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'

export function authDirective(app: App) {
  app.directive('auth', {
    mounted(el: HTMLElement, binding) {
      const permission = binding.value
      if (!permission)
        return

      const permissionStore = usePermissionStore()
      const hasPermission = permissionStore.buttonPermissionKeys.includes(permission)

      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    },
  })
}
