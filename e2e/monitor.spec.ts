import { expect, login, test } from './fixtures'

test.describe('前端监控', () => {
  test('通过菜单进入监控页并加载统计与事件列表', async ({ page }) => {
    await login(page)

    // 展开"系统管理"目录 → 点击"前端监控"
    await page.getByRole('menuitem', { name: '系统管理' }).click()
    await expect(page.getByRole('menuitem', { name: '前端监控' })).toBeVisible()
    await page.getByRole('menuitem', { name: '前端监控' }).click()
    await page.waitForURL(/#\/monitor/)

    // 统计卡片
    await expect(page.getByText('事件总数')).toBeVisible()
    await expect(page.getByText('错误总数')).toBeVisible()
    await expect(page.getByText('页面访问')).toBeVisible()
    // 事件列表(mock 事件跨测试累积,用 first 避免重复项歧义)
    await expect(page.getByRole('cell', { name: /Cannot read properties of undefined/ }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'JS_ERROR' }).first()).toBeVisible()
  })

  test('前端错误自动上报到监控接口', async ({ page }) => {
    await login(page)

    // 注入运行时错误 → 采集器应捕获并批量上报 /api/metrics/events
    const reportPromise = page.waitForRequest(
      req => req.url().includes('/api/metrics/events') && req.method() === 'POST',
      { timeout: 10_000 },
    )
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('e2e injected error')
      }, 0)
    })

    const report = await reportPromise
    const body = report.postData() || ''
    expect(body).toContain('e2e injected error')
    expect(body).toContain('JS_ERROR')
  })
})
