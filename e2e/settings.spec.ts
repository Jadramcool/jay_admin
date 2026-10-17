import { expect, login, test } from './fixtures'

/**
 * 系统设置(注册表驱动)回归网。
 *
 * 重点覆盖历史踩过的坑:
 *   - 列表/筛选项/值控件由后端注册表元数据渲染(新增设置项前端零改动);
 *   - 保存只提交 `value/expectedVersion/reason`,不再夹带 id/isPublic 等字段
 *     (旧实现把只读字段回传,触发 forbidNonWhitelisted 400 "参数验证失败");
 *   - 不提供新增/删除(设置项声明在代码注册表里);
 *   - 已修改项可重置;历史抽屉可查看并回滚。
 */
function settingRow(page: any, key: string) {
  return page.getByRole('row', { name: new RegExp(key.replace('.', '\\.')) })
}

test.describe('系统设置', () => {
  test('通过菜单进入设置页并加载列表', async ({ page }) => {
    await login(page)

    await page.getByRole('menuitem', { name: '系统管理' }).click()
    await expect(page.getByRole('menuitem', { name: '系统设置' })).toBeVisible()
    await page.getByRole('menuitem', { name: '系统设置' }).click()
    await page.waitForURL(/#\/system\/settings/)

    await expect(page.getByRole('cell', { name: '站点名称' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'site.name' })).toBeVisible()
    await expect(
      page.getByRole('cell', { name: 'security.login.maxRetry' }),
    ).toBeVisible()
    // 来源与可见性标记
    await expect(page.getByRole('cell', { name: '已修改' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: '默认值' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: '公开' }).first()).toBeVisible()
    // 设置项在代码注册表里,列表不提供新增/批量删除
    await expect(page.getByRole('button', { name: '新增' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '批量删除' })).toHaveCount(0)
  })

  test('查询表单按分组过滤', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/settings')
    await expect(page.getByRole('cell', { name: 'site.name' })).toBeVisible()

    // NSelect 的占位符 div 不接收指针事件,要点可点击的 .n-base-selection 容器
    await page
      .locator('.n-form-item')
      .filter({ hasText: '分组' })
      .locator('.n-base-selection')
      .first()
      .click()
    await page
      .locator('.n-base-select-option')
      .filter({ hasText: '安全' })
      .first()
      .click()
    await page.getByRole('button', { name: '查询' }).click()

    await expect(
      page.getByRole('cell', { name: 'security.login.maxRetry' }),
    ).toBeVisible()
    await expect(page.getByRole('cell', { name: 'site.name' })).toHaveCount(0)
  })

  test('编辑弹窗保存只提交白名单字段', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/settings')
    await expect(page.getByRole('cell', { name: 'site.name' })).toBeVisible()

    await settingRow(page, 'site.name').getByRole('button', { name: '编辑' }).click()
    const modal = page.locator('.n-modal')
    await expect(modal.getByText('site.name')).toBeVisible()

    await modal.locator('input').first().fill('E2E 站点名')
    await modal.getByPlaceholder('例如：调整品牌名').fill('e2e 调整')

    const request = page.waitForRequest(
      req =>
        req.method() === 'PUT'
        && req.url().includes('/api/system/settings/site.name'),
    )
    await modal.getByRole('button', { name: '确认' }).click()
    const body = JSON.parse((await request).postData() || '{}')

    // 只允许 value/expectedVersion/reason(白名单);旧实现回传 id/isPublic/type 会 400
    expect(Object.keys(body).sort()).toEqual(['expectedVersion', 'reason', 'value'])

    await expect(page.locator('body')).toContainText('保存成功')
    await expect(page.getByRole('cell', { name: 'E2E 站点名' })).toBeVisible()
  })

  test('已修改项可重置为默认值', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/settings')
    await expect(page.getByRole('cell', { name: 'site.name' })).toBeVisible()

    const resetRequest = page.waitForRequest(
      req =>
        req.method() === 'POST'
        && req.url().includes('/api/system/settings/site.name/reset'),
    )
    await settingRow(page, 'site.name')
      .getByRole('button', { name: '重置' })
      .click()
    // 表格操作列的重置走 NPopconfirm 二次确认(按钮文案:取消 / 确认)
    await page.locator('.n-popover').getByRole('button', { name: '确认' }).click()
    await resetRequest

    await expect(page.locator('body')).toContainText('已重置为默认值')
  })

  test('历史抽屉展示变更记录并可回滚', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/settings')
    await expect(page.getByRole('cell', { name: 'site.name' })).toBeVisible()

    const historyRequest = page.waitForRequest(
      req =>
        req.method() === 'GET'
        && req.url().includes('/api/system/settings/site.name/history'),
    )
    await settingRow(page, 'site.name')
      .getByRole('button', { name: '历史' })
      .click()
    await historyRequest

    const drawer = page.locator('.n-drawer')
    await expect(drawer.getByText('变更历史 · 站点名称')).toBeVisible()
    await expect(drawer.getByText('调整品牌名')).toBeVisible()

    const rollbackRequest = page.waitForRequest(
      req => req.method() === 'POST' && req.url().includes('/rollback'),
    )
    await drawer.getByRole('button', { name: '回滚此次修改' }).first().click()
    await rollbackRequest
    await expect(page.locator('body')).toContainText('已回滚')
  })
})
