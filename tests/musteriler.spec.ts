import { test, expect } from '@playwright/test'

test('müşteriler sayfası açılıyor', async ({ page }) => {
  await page.goto('/dashboard/musteriler')
  await expect(page).not.toHaveURL(/\/login/)
  // "Müşteriler" topbar başlığı — exact match ile strict mode sorununu önle
  await expect(page.getByRole('heading', { name: 'Müşteriler', exact: true }).or(
    page.locator('h2').filter({ hasText: /^Müşteriler$/ })
  ).first()).toBeVisible({ timeout: 15000 })
})

test('müşteriler — tablo ya da boş mesaj görünüyor', async ({ page }) => {
  await page.goto('/dashboard/musteriler', { timeout: 30000 })
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 20000 })

  const hasList = await page.locator('table').isVisible().catch(() => false)
  const hasEmpty = await page.locator('text=Henüz müşteri yok').isVisible().catch(() => false)
  expect(hasList || hasEmpty).toBe(true)
})

test('+ Yeni butonu — modal açılıyor', async ({ page }) => {
  await page.goto('/dashboard/musteriler')
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })

  await page.click('text=+ Yeni')
  await expect(page.locator('text=Yeni Müşteri Ekle')).toBeVisible({ timeout: 5000 })
})

test('yeni müşteri modal — İptal butonu kapatıyor', async ({ page }) => {
  await page.goto('/dashboard/musteriler')
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })

  await page.click('text=+ Yeni')
  await expect(page.locator('text=Yeni Müşteri Ekle')).toBeVisible()

  await page.click('text=İptal')
  await expect(page.locator('text=Yeni Müşteri Ekle')).not.toBeVisible({ timeout: 5000 })
})
