import { expect, login, test } from './fixtures'

test.describe('系统配置', () => {
  test('通过菜单进入配置页并加载列表', async ({ page }) => {
    await login(page)

    await page.getByRole('menuitem', { name: '系统管理' }).click()
    await expect(page.getByRole('menuitem', { name: '系统配置' })).toBeVisible()
    await page.getByRole('menuitem', { name: '系统配置' }).click()
    await page.waitForURL(/#\/system\/config/)

    await expect(page.getByRole('cell', { name: /^site_name$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: /^JDM 管理系统$/ })).toBeVisible()
    // 系统内置配置正常渲染
    await expect(page.getByRole('cell', { name: /^security\.login\.maxRetry$/ })).toBeVisible()
  })

  test('新增配置流程', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/config')
    // hash 路由下 goto 不刷新页面,等待配置页独有元素
    await expect(page.getByRole('cell', { name: /^site_name$/ })).toBeVisible()

    await page.getByRole('button', { name: '新增', exact: true }).click()
    // 弹窗与查询表单存在相同 placeholder,限定在弹窗容器内操作
    const modal = page.locator('.n-modal-container')
    await modal.getByPlaceholder('请输入配置名称').fill('测试配置')
    await modal.getByPlaceholder('例如：site_name').fill('e2e.test.config')
    await modal.getByPlaceholder('请输入配置值').fill('hello')
    await modal.getByRole('button', { name: '确认' }).click()

    await expect(page.locator('body')).toContainText('创建成功')
  })
})
