import { createApp } from 'vue'
import App from './App.vue'
import { setupDirectives } from './directives'
import router, { setupRouterGuards } from './router'
import { registerLoginNavigator } from './router/auth-navigation'
import pinia from './store'
import { registerLocalIconCollections } from './utils/common/register-icons'
import { initMonitor } from './utils/monitor'
import { setupAuthSessionSync } from './utils/token/session-sync'

import 'uno.css'
import './assets/styles/transition.scss'
import './style.scss'
import '@wangeditor/editor/dist/css/style.css'

async function bootstrap() {
  // 注册本地图标集(异步不阻塞)，避免 @iconify/vue 在线拉取境外 API 失败
  registerLocalIconCollections()

  const app = createApp(App)

  app.use(pinia)

  registerLoginNavigator(() => router.replace('/login'))
  setupAuthSessionSync(router)

  // Register guards BEFORE router install so the initial navigation is protected
  setupRouterGuards(router)

  // 错误监控与埋点(幂等;上报失败走 localStorage 缓冲)
  initMonitor(app, router)

  app.use(router)

  setupDirectives(app)

  app.mount('#app')
}

bootstrap()
