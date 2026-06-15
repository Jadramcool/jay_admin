import { createApp } from 'vue';
import App from './App.vue';
import router, { setupRouterGuards } from './router';
import pinia from './store';
import { setupDirectives } from './directives';

import 'uno.css';
import './style.css';

async function bootstrap() {
  const app = createApp(App);

  app.use(pinia);

  // Store references for cross-module use (must be before router guard registration)
  const { useUserStore, usePermissionStore, useTabStore } = await import('@/store/modules');
  window.__stores = { useUserStore, usePermissionStore, useTabStore };

  // Register guards BEFORE router install so the initial navigation is protected
  setupRouterGuards(router);

  app.use(router);

  setupDirectives(app);

  app.mount('#app');
}

bootstrap();
