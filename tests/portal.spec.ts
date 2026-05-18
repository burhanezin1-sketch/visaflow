import { test, expect } from '@playwright/test'

// Portal auth gerektirmiyor — storageState'e gerek yok
test.use({ storageState: { cookies: [], origins: [] } })

test('geçersiz token — hata sayfası gösterir', async ({ page }) => {
  await page.goto('/portal/gecersiz-token-000')
  await page.waitForLoadState('networkidle', { timeout: 15000 })

  // Hata mesajı ya da yönlendirme beklenir
  const hasError = await page.locator('text=Geçersiz').isVisible().catch(() => false)
    || await page.locator('text=Bulunamadı').isVisible().catch(() => false)
    || await page.locator('text=bulunamadı').isVisible().catch(() => false)
    || await page.locator('text=hatalı').isVisible().catch(() => false)
  expect(hasError).toBe(true)
})

test('geçerli portal token — KVKK ekranı çıkıyor', async ({ page }) => {
  const token = process.env.TEST_PORTAL_TOKEN
  if (!token) {
    test.skip()
    return
  }

  await page.goto(`/portal/${token}`)
  await page.waitForLoadState('networkidle', { timeout: 15000 })

  // KVKK onay ekranı ya da portal içeriği görünmeli
  const hasKvkk = await page.locator('text=KVKK').isVisible().catch(() => false)
    || await page.locator('text=Aydınlatma').isVisible().catch(() => false)
    || await page.locator('text=onay').isVisible().catch(() => false)
  const hasPortal = await page.locator('text=Portal').isVisible().catch(() => false)

  expect(hasKvkk || hasPortal).toBe(true)
})
