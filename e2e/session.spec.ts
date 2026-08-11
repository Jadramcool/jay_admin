import { expect, login, test } from './fixtures'

test.describe('在线用户', () => {
  test('通过菜单进入在线用户页并加载列表', async ({ page }) => {
    await login(page)

    // 展开"系统管理"目录 → 点击"在线用户"
    await page.getByRole('menuitem', { name: '系统管理' }).click()
    await expect(page.getByRole('menuitem', { name: '在线用户' })).toBeVisible()
    await page.getByRole('menuitem', { name: '在线用户' }).click()
    await page.waitForURL(/#\/system\/session/)

    // 统计卡片
    await expect(page.getByText('当前在线')).toBeVisible()
    // 会话列表(含用户信息)
    await expect(page.getByRole('cell', { name: /^admin$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: /^zhangsan$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: /192\.168\.1\.10/ })).toBeVisible()
  })

  test('强制下线会话', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/session')
    await expect(page.getByRole('cell', { name: /^admin$/ })).toBeVisible()

    await page.getByRole('row', { name: /admin/ }).getByRole('button', { name: '强制下线' }).click()
    await page.getByRole('button', { name: '确定' }).click()

    await expect(page.locator('body')).toContainText('已强制下线')
  })
})
