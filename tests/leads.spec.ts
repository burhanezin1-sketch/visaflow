import { test, expect } from '@playwright/test'

test('leads sayfası açılıyor', async ({ page }) => {
  await page.goto('/dashboard/leads')
  await expect(page).not.toHaveURL(/\/login/)
  await expect(page.locator('text=Potansiyel Müşteriler')).toBeVisible({ timeout: 15000 })
})

test('leads — tablo ya da boş mesaj görünüyor', async ({ page }) => {
  await page.goto('/dashboard/leads')
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })

  const hasTable = await page.locator('table').isVisible().catch(() => false)
  const hasEmpty = await page.locator('text=Henüz lead yok').isVisible().catch(() => false)
  expect(hasTable || hasEmpty).toBe(true)
})

test('leads — bekleyen lead varsa Sahiplen butonu görünüyor', async ({ page }) => {
  await page.goto('/dashboard/leads')
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })

  const sahiplenBtn = page.locator('button', { hasText: 'Sahiplen' }).first()
  const hasSahiplen = await sahiplenBtn.isVisible().catch(() => false)

  if (hasSahiplen) {
    // Sahiplen butonuna tıkla — hata fırlatmamalı
    await sahiplenBtn.click()
    // Sayfa çökmemeli, hala leads sayfasında olmalı
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.locator('text=Lead Listesi')).toBeVisible({ timeout: 10000 })
  } else {
    // Bekleyen lead yok — test geçer
    test.skip()
  }
})

test('leads — bekliyor sayacı görünüyor', async ({ page }) => {
  await page.goto('/dashboard/leads')
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor'), { timeout: 15000 })
  await expect(page.locator('text=bekliyor')).toBeVisible({ timeout: 10000 })
})
