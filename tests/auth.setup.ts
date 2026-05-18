import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

setup('login ve session kaydet', async ({ page }) => {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD

  if (!email || !password) {
    throw new Error('TEST_EMAIL ve TEST_PASSWORD env variable gerekli')
  }

  await page.goto('/login')
  await expect(page).toHaveURL(/\/login/)

  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/dashboard|\/admin/, { timeout: 15000 })

  await page.context().storageState({ path: authFile })
})
