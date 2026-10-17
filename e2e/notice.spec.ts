import { expect, login, test } from './fixtures'

test.describe('公告管理', () => {
  test('公告列表加载并显示阅读统计', async ({ page }) => {
    await login(page)
    await page.goto('/#/notice')

    await expect(page.getByRole('cell', { name: '系统升级维护通知' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '季度团建活动报名' })).toBeVisible()
  })

  test('已清理公告可筛选并恢复', async ({ page }) => {
    await login(page)
    await page.goto('/#/notice')
    await expect(page.getByRole('cell', { name: /系统升级维护通知/ })).toBeVisible()

    // 默认列表不含已清理公告
    await expect(page.getByRole('cell', { name: /历史安全须知/ })).toHaveCount(0)

    // 切到「已清理」
    // NSelect 的占位符 div 不接收指针事件,要点可点击的 .n-base-selection 容器
    await page
      .locator('.n-form-item')
      .filter({ hasText: '清理状态' })
      .locator('.n-base-selection')
      .first()
      .click()
    await page.locator('.n-base-select-option').filter({ hasText: '已清理' }).first().click()
    await page.getByRole('button', { name: '查询' }).click()

    await expect(page.getByRole('cell', { name: /历史安全须知/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: '已清理' }).first()).toBeVisible()

    // 恢复
    const restoreRequest = page.waitForRequest(req => req.method() === 'PUT' && req.url().includes('/api/notice/restore/3'))
    await page.getByRole('row', { name: /历史安全须知/ }).getByRole('button', { name: '恢复' }).click()
    await page.locator('.n-popover').getByRole('button', { name: '确认' }).click()
    await restoreRequest
    await expect(page.locator('body')).toContainText('已恢复公告「历史安全须知」')
  })

  test('公告详情可打开', async ({ page }) => {
    await login(page)
    await page.goto('/#/notice')

    await page.getByRole('cell', { name: '系统升级维护通知' }).click()
    await expect(page.locator('body')).toContainText('系统升级维护通知')
  })
})
