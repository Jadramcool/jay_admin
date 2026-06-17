import { createApp } from 'vue'
import App from './App.vue'
import { setupDirectives } from './directives'
import router, { setupRouterGuards } from './router'
import pinia from './store'

import 'uno.css'
import './style.scss'

async function bootstrap() {
  const app = createApp(App)

  app.use(pinia)

  // Store references for cross-module use (must be before router guard registration)
  const { useUserStore, usePermissionStore, useTabStore } = await import('@/store/modules')
  window.__stores = { useUserStore, usePermissionStore, useTabStore }

  // Register guards BEFORE router install so the initial navigation is protected
  setupRouterGuards(router)

  app.use(router)

  setupDirectives(app)

  app.mount('#app')
}

bootstrap()
