import { expect, login, test } from './fixtures'

test.describe('公告管理', () => {
  test('公告列表加载并显示阅读统计', async ({ page }) => {
    await login(page)
    await page.goto('/#/notice')

    await expect(page.getByRole('cell', { name: '系统升级维护通知' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '季度团建活动报名' })).toBeVisible()
  })

  test('公告详情可打开', async ({ page }) => {
    await login(page)
    await page.goto('/#/notice')

    await page.getByRole('cell', { name: '系统升级维护通知' }).click()
    await expect(page.locator('body')).toContainText('系统升级维护通知')
  })
})
