import { Buffer } from 'node:buffer'
import { expect, login, test } from './fixtures'

test.describe('用户管理', () => {
  test('列表加载并渲染用户行', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/user')

    await expect(page.getByRole('cell', { name: /^admin$/ })).toBeVisible()
    await expect(page.getByRole('cell', { name: '系统管理员' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '张三' })).toBeVisible()
  })

  test('按用户名关键字筛选', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/user')

    await page.getByPlaceholder('请输入用户名', { exact: true }).fill('zhangsan')
    await page.getByRole('button', { name: '查询' }).click()

    await expect(page.getByRole('cell', { name: /^zhangsan$/ })).toBeVisible()
    // 其他用户不应出现(admin 不匹配筛选)
    await expect(page.getByRole('cell', { name: /^admin$/ })).not.toBeVisible()
  })

  test('新增用户流程:表单校验、提交、返回列表', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/user/edit')

    // 未填写必填项直接提交 → 触发表单校验,不发起请求
    await page.getByRole('button', { name: '创建' }).click()
    await expect(page.locator('body')).toContainText('请输入用户名')

    // 填写完整后提交(新增模式按钮为"创建")
    await page.getByPlaceholder('请输入', { exact: true }).fill('e2e_user')
    await page.getByPlaceholder('请输入密码', { exact: true }).fill('123456')
    await page.getByPlaceholder('请输入姓名', { exact: true }).fill('E2E 测试')
    await page.getByRole('button', { name: '创建' }).click()

    // 成功后返回列表页
    await page.waitForURL(/#\/system\/user$/)
    await expect(page.locator('body')).toContainText('创建成功')
  })

  test('导出与导入入口及导入流程', async ({ page }) => {
    await login(page)
    await page.goto('/#/system/user')

    // 工具栏提供导出/导入按钮
    await expect(page.getByRole('button', { name: '导出' })).toBeVisible()
    await expect(page.getByRole('button', { name: '导入' })).toBeVisible()

    // 打开导入弹窗:模板下载入口 + 文件选择 + 导入结果
    await page.getByRole('button', { name: '导入' }).click()
    await expect(page.getByRole('button', { name: '下载模板' })).toBeVisible()
    await expect(page.getByText('请先下载模板，按模板格式填写后上传')).toBeVisible()

    await page.setInputFiles('input[type=file]', {
      name: 'users.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('mock'),
    })
    await page.getByRole('button', { name: '开始导入' }).click()
    await expect(page.locator('body')).toContainText('共 2 条')
    await expect(page.locator('body')).toContainText('成功 2 条')
  })
})
