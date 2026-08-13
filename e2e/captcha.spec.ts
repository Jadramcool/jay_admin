import { expect, test } from './fixtures'

test.describe('登录验证码', () => {
  test('登录页加载验证码图片', async ({ page }) => {
    await page.goto('/#/login')

    const image = page.locator('img[alt="验证码"]')
    await expect(image).toBeVisible()
    // 图片为 base64 SVG
    const src = await image.getAttribute('src')
    expect(src).toMatch(/^data:image\/svg\+xml;base64,/)
  })

  test('点击验证码图片触发刷新', async ({ page }) => {
    // 先注册监听再加载页面(加载 1 次 + 点击 1 次 = 2)
    let captchaRequests = 0
    page.on('request', (req) => {
      if (req.url().includes('/api/auth/captcha'))
        captchaRequests += 1
    })

    await page.goto('/#/login')
    await expect(page.locator('img[alt="验证码"]')).toBeVisible()

    await page.locator('img[alt="验证码"]').click()
    await expect
      .poll(async () => captchaRequests)
      .toBeGreaterThanOrEqual(2)
  })

  test('验证码关闭时不显示输入框且登录无需验证码', async ({ page }) => {
    // 覆盖 mock:后端返回 enabled: false(后注册的 route 优先)
    await page.route('**/auth/captcha', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 200, message: 'OK', data: { enabled: false } }),
      })
    })

    await page.goto('/#/login')
    // 无验证码输入框与图片
    await expect(page.locator('img[alt="验证码"]')).toHaveCount(0)
    await expect(page.getByPlaceholder('验证码', { exact: true })).toHaveCount(0)

    // 不填验证码直接登录成功
    await page.getByPlaceholder('用户名', { exact: true }).fill('admin')
    await page.getByPlaceholder('密码', { exact: true }).fill('admin123')
    await page.getByRole('button', { name: /登\s*录/ }).click()
    await page.waitForURL(/#\/home/)
  })
})
