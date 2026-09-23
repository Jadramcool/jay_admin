import { expect, login, test } from './fixtures'

/**
 * 首页双视图(按 system:operation-log:list 权限切换):
 * - 管理员(持有审计查询权)→ 运营看板
 * - 普通用户 → 个人工作台(今日概览 + 待办 + 公告),且不发 system-info 请求
 */
test.describe('首页工作台/看板视图', () => {
  test('管理员登录展示运营看板', async ({ page }) => {
    await login(page)

    await expect(page.getByText('数据概览')).toBeVisible()
    await expect(page.getByText('趋势分析')).toBeVisible()
    // 看板视图不渲染工作台卡片
    await expect(page.getByText('待办事项')).toHaveCount(0)
    await expect(page.getByText('我的公告')).toHaveCount(0)
  })

  test('普通用户登录展示个人工作台', async ({ page }) => {
    // system-info 已收口:首页不应发起该请求(监控页才调用)
    const sysInfoRequests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('/api/dashboard/system-info'))
        sysInfoRequests.push(req.url())
    })

    await login(page, 'zhangsan', '123456')

    // 今日概览 + 两张工作台卡片(用卡片标题元素定位,避免与菜单文本重名)
    const cardTitle = (name: string) => page.locator('.n-card-header__main', { hasText: name })
    await expect(page.getByText('待办进度')).toBeVisible()
    await expect(page.getByText('未读公告')).toBeVisible()
    await expect(cardTitle('待办事项')).toBeVisible()
    await expect(cardTitle('我的公告')).toBeVisible()

    // 待办卡:快捷添加入口与已完成折叠
    await expect(page.getByPlaceholder('添加待办，回车创建…')).toBeVisible()
    await expect(page.getByRole('button', { name: /已完成 \(\d+\)/ })).toBeVisible()

    // 公告卡:类型标签与未读标识(未读优先排序,首条带红点)
    await expect(page.locator('.wn__tag', { hasText: '通知' }).first()).toBeVisible()

    // 看板组件不渲染
    await expect(page.getByText('数据概览')).toHaveCount(0)
    await expect(page.getByText('趋势分析')).toHaveCount(0)

    await expect(sysInfoRequests).toHaveLength(0)
  })
})
