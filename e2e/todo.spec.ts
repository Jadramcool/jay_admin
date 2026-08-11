import { expect, login, test } from './fixtures'

test.describe('待办事项', () => {
  test('通过菜单进入待办页并加载统计与列表', async ({ page }) => {
    await login(page)

    await expect(page.getByRole('menuitem', { name: '我的待办' })).toBeVisible()
    await page.getByRole('menuitem', { name: '我的待办' }).click()
    await page.waitForURL(/#\/todo/)

    // 统计卡片
    await expect(page.getByText('待办总数')).toBeVisible()
    await expect(page.getByText('未完成')).toBeVisible()
    // 列表渲染(含子任务)
    await expect(page.getByText('完成周报')).toBeVisible()
    await expect(page.getByText('整理数据')).toBeVisible()
    await expect(page.getByText('评审新功能')).toBeVisible()
  })

  test('新增待办与勾选完成', async ({ page }) => {
    await login(page)
    await page.goto('/#/todo')
    // hash 路由下 goto 不刷新页面,等待待办页独有元素
    await expect(page.getByPlaceholder('输入待办内容，回车添加')).toBeVisible()

    // 新增
    await page.getByPlaceholder('输入待办内容，回车添加').fill('E2E 测试待办')
    await page.getByRole('button', { name: '添加' }).click()
    await expect(page.getByText('E2E 测试待办')).toBeVisible()

    // 勾选完成 → 提示"已完成",统计刷新
    await page.getByText('完成周报').locator('..').locator('.n-checkbox').click()
    await expect(page.locator('body')).toContainText('已完成')
  })
})
