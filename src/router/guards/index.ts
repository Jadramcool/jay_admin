import type { Router } from 'vue-router';
import { createPermissionGuard } from './permission-guard';
import { createPageTitleGuard } from './page-title-guard';

export function setupRouterGuards(router: Router) {
  createPermissionGuard(router);
  createPageTitleGuard(router);
}
