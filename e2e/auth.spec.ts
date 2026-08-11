import { expect, login, test } from './fixtures'

test.describe('认证与动态路由', () => {
  test('未登录访问受保护页面重定向到登录页', async ({ page }) => {
    await page.goto('/#/system/user')
    await page.waitForURL(/#\/login/)
    await expect(page.getByPlaceholder('用户名', { exact: true })).toBeVisible()
  })

  test('登录失败提示错误并停留在登录页', async ({ page }) => {
    await page.goto('/#/login')
    await page.getByPlaceholder('用户名', { exact: true }).fill('admin')
    await page.getByPlaceholder('密码', { exact: true }).fill('wrong-password')
    await expect(page.locator('img[alt="验证码"]')).toBeVisible()
    await page.getByPlaceholder('验证码', { exact: true }).fill('1234')
    await page.getByRole('button', { name: /登\s*录/ }).click()

    await expect(page.locator('body')).toContainText('用户名或密码错误')
    expect(page.url()).toContain('/login')
  })

  test('登录成功进入首页并渲染动态菜单', async ({ page }) => {
    await login(page)

    await expect(page).toHaveURL(/#\/home/)
    // 动态菜单由 /auth/user/menu 渲染(限定菜单项,避免首页快捷入口等文本歧义)
    await expect(page.getByRole('menuitem', { name: '系统管理' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: '通知管理' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: '个人中心' })).toBeVisible()
  })

  test('登录后显示用户水印且防篡改', async ({ page }) => {
    await login(page)

    // 水印层存在(Canvas 背景,覆盖全屏)
    const layer = page.locator('.watermark-layer')
    await expect(layer).toBeVisible()

    // 防篡改:删除水印层后 MutationObserver 自动重建
    await page.evaluate(() => document.querySelector('.watermark-layer')?.remove())
    await expect(layer).toBeVisible()
  })

  test('退出登录返回登录页并清除会话', async ({ page }) => {
    await login(page)

    // 打开用户下拉菜单 → 退出登录 → 确认弹窗
    await page.locator('.n-dropdown').first().isVisible().catch(() => {})
    await page.getByText('系统管理员').first().click()
    await page.getByText('退出登录').click()
    await page.getByRole('button', { name: '确定' }).click()

    await page.waitForURL(/#\/login/)
    // 再次访问受保护页仍被重定向(会话已清除)
    await page.goto('/#/system/user')
    await page.waitForURL(/#\/login/)
  })
})
