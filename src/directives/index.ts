import type { App } from 'vue'
import { authDirective } from './modules/auth'

export function setupDirectives(app: App) {
  authDirective(app)
}
