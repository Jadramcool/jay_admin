import { expect, login, test } from './fixtures'

test.describe('数据字典', () => {
  test('通过动态菜单进入字典页并加载类型列表', async ({ page }) => {
    await login(page)

    // 展开"系统管理"目录 → 可见"数据字典"子菜单(mock 菜单数据驱动)
    await page.getByRole('menuitem', { name: '系统管理' }).click()
    await expect(page.getByRole('menuitem', { name: '数据字典' })).toBeVisible()
    await page.getByRole('menuitem', { name: '数据字典' }).click()
    await page.waitForURL(/#\/system\/dict/)

    await expect(page.getByRole('cell', { name: /^sex$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: /^性别$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: /^notice_type$/ })).toBeVisible()
  })

  test('新增字典类型流程', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/dict')
    // hash 路由下 goto 不刷新页面,需等 dict 页渲染完成后再操作
    // (避免误点首页"新增用户"快捷按钮)
    await expect(page.getByPlaceholder('请输入类型编码')).toBeVisible()

    await page.getByRole('button', { name: '新增', exact: true }).click()
    await page.getByPlaceholder('如 sex').fill('user_role')
    await page.getByPlaceholder('如 性别').fill('用户角色')
    await page.getByRole('button', { name: '确定' }).click()

    await expect(page.locator('body')).toContainText('创建成功')
  })

  test('字典项管理:查看与新增', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/dict')
    await expect(page.getByPlaceholder('请输入类型编码')).toBeVisible()

    // 打开"性别"类型的字典项管理
    await page.getByRole('row', { name: /sex/ }).getByRole('button', { name: '字典项' }).click()

    // 项列表渲染
    await expect(page.getByRole('cell', { name: /^MALE$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: /^男$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: /^FEMALE$/ })).toBeVisible()

    // 新增字典项
    await page.getByRole('button', { name: '新增字典项' }).click()
    await page.getByPlaceholder('如 MALE').fill('UNKNOWN')
    await page.getByPlaceholder('如 男').fill('未知')
    await page.getByRole('button', { name: '添加' }).click()

    await expect(page.locator('body')).toContainText('创建成功')
  })
})
