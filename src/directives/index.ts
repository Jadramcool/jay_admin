import type { App } from 'vue'
import { authDirective } from './modules/auth'
import { watermarkDirective } from './modules/watermark'

export function setupDirectives(app: App) {
  authDirective(app)
  watermarkDirective(app)
}
