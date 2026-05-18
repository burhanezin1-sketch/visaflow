import { test, expect } from '@playwright/test'

test('dashboard sayfası açılıyor', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).not.toHaveURL(/\/login/)
  await expect(page.locator('text=Genel Bakış')).toBeVisible({ timeout: 15000 })
})

test('dashboard — stat kartları yükleniyor', async ({ page }) => {
  await page.goto('/dashboard')
  // Yükleniyor spinner'ı kaybolsun
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })

  // En az bir sayısal değer içeren kart görünmeli
  const cards = page.locator('[style*="border-radius: 12px"]')
  await expect(cards.first()).toBeVisible()
})

test('dashboard sidebar — menü linkleri görünüyor', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.locator('text=Müşteriler')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('text=Leads')).toBeVisible()
})
