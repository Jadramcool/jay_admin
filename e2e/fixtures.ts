import type { Page } from '@playwright/test'
import process from 'node:process'
import { test as base, expect } from '@playwright/test'
import { installApiMocks } from './mocks/api'

/**
 * E2E fixture:
 * - 默认拦截 /api 返回 mock 数据,不依赖后端与数据库
 * - 设置 USE_REAL_API=1 时走真实后端(需先启动 jdm-nest-server)
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    if (!process.env.USE_REAL_API)
      await installApiMocks(page)
    await use(page)
  },
})

export { expect }

/** 登录并等待进入首页(动态路由注册完成后)。注意:项目为 hash 路由,登录需验证码 */
export async function login(page: Page, username = 'admin', password = 'admin123') {
  await page.goto('/#/login')
  // 登录/注册为 3D 翻转卡片,两面输入框同时在 DOM 中,需精确匹配
  await page.getByPlaceholder('用户名', { exact: true }).fill(username)
  await page.getByPlaceholder('密码', { exact: true }).fill(password)
  // 等待验证码图片加载后填写(mock 宽松,不校验内容)
  await expect(page.locator('img[alt="验证码"]')).toBeVisible()
  await page.getByPlaceholder('验证码', { exact: true }).fill('1234')
  await page.getByRole('button', { name: /登\s*录/ }).click()
  await page.waitForURL(/#\/home/)
}
