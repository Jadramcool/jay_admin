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
})
