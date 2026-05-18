import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test('doğru şifre ile giriş — dashboard\'a yönlenir', async ({ page }) => {
  const email = process.env.TEST_EMAIL!
  const password = process.env.TEST_PASSWORD!

  await page.goto('/login')
  await expect(page.locator('input[type="email"]')).toBeVisible()

  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/dashboard|\/admin/, { timeout: 15000 })
  expect(page.url()).toMatch(/\/(dashboard|admin)/)
})

test('yanlış şifre — hata mesajı görünür', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[type="email"]', 'yanlis@test.com')
  await page.fill('input[type="password"]', 'yanlis_sifre_123')
  await page.click('button[type="submit"]')

  await expect(page.locator('.vp-error')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.vp-error')).toContainText('hatalı')
})

test('giriş yapılmadan dashboard\'a git — login\'e yönlenir', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForURL(/\/login/, { timeout: 10000 })
  expect(page.url()).toContain('/login')
})
