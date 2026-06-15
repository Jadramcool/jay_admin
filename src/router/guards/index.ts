import type { Router } from 'vue-router'
import { createPageTitleGuard } from './page-title-guard'
import { createPermissionGuard } from './permission-guard'

export function setupRouterGuards(router: Router) {
  createPermissionGuard(router)
  createPageTitleGuard(router)
}
