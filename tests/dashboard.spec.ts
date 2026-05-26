import { test, expect } from '@playwright/test'

test.beforeEach(async () => {
  if (!process.env.TEST_EMAIL) test.skip()
})

test('dashboard sayfası açılıyor', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).not.toHaveURL(/\/login/)
  // Topbar başlığı "Dashboard", ya da admin kullanıcısı ise "Genel Bakış"
  await expect(
    page.locator('text=Dashboard').or(page.locator('text=Genel Bakış')).first()
  ).toBeVisible({ timeout: 15000 })
})

test('dashboard — stat kartları yükleniyor', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })

  const cards = page.locator('[style*="border-radius: 12px"]')
  await expect(cards.first()).toBeVisible()
})

test('dashboard sidebar — menü linkleri görünüyor', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.locator('text=Müşteriler').first()).toBeVisible({ timeout: 10000 })
  await expect(page.locator('text=Potansiyel Müşteriler')).toBeVisible()
})
