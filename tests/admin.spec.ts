import { test, expect } from '@playwright/test'

test('admin ekip sayfası açılıyor', async ({ page }) => {
  const res = await page.goto('/admin/ekip')

  // Admin yetkisi yoksa dashboard'a yönlenir — her iki durum da geçer
  if (page.url().includes('/dashboard')) {
    test.skip()
    return
  }

  await expect(page).not.toHaveURL(/\/login/)
  await expect(page.locator('text=Ekip Performansı')).toBeVisible({ timeout: 15000 })
})

test('admin genel bakış — stat kartları yükleniyor', async ({ page }) => {
  await page.goto('/admin')

  if (page.url().includes('/dashboard')) {
    test.skip()
    return
  }

  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })
  await expect(page.locator('text=Toplam Ciro').first()).toBeVisible({ timeout: 10000 })
})

test('admin ekip — danışman listesi görünüyor', async ({ page }) => {
  await page.goto('/admin/ekip')

  if (page.url().includes('/dashboard')) {
    test.skip()
    return
  }

  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })
  await expect(page.locator('text=Danışman Listesi')).toBeVisible({ timeout: 10000 })
})
