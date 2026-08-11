import process from 'node:process'
import { defineConfig } from '@playwright/test'

/**
 * Playwright E2E 配置
 *
 * 默认通过 page.route 拦截 /api 请求返回 mock 数据(见 e2e/mocks/api.ts),
 * 不依赖后端与数据库;设置 USE_REAL_API=1 可走真实后端(需先启动 jdm-nest-server)。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  // 串行执行:所有测试共享同一个 vite dev server,并行会触发首次编译竞争导致超时
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    locale: 'zh-CN',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
