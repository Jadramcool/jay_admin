import { basicRoutes } from './basic-routes';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { setupRouterGuards } from './guards';

const router = createRouter({
  history: import.meta.env.VITE_USE_HASH === 'true' ? createWebHashHistory(import.meta.env.VITE_BASE) : createWebHistory(import.meta.env.VITE_BASE),
  routes: basicRoutes,
});

export function setupRouter(app: any) {
  app.use(router);
  setupRouterGuards(router);
}

export { setupRouterGuards };
export default router;
