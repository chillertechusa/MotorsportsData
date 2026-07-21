import { test, expect } from '@playwright/test'

test.describe('System Health Checks', () => {
  test('should verify auth system is working', async ({ page }) => {
    // Hit health check endpoint for auth
    const response = await page.request.get('/api/health/auth')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('should verify database connection', async ({ page }) => {
    // Hit health check endpoint for database
    const response = await page.request.get('/api/health/database')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('should verify Square integration', async ({ page }) => {
    // Hit health check endpoint for Square
    const response = await page.request.get('/api/health/square')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.configured).toBe(true)
  })

  test('should verify feature gating system', async ({ page }) => {
    // Hit health check endpoint for feature gates
    const response = await page.request.get('/api/health/feature-gates')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.tiersLoaded).toBeGreaterThan(0)
  })

  test('should verify payment recovery cron is active', async ({ page }) => {
    // Hit health check endpoint for cron jobs
    const response = await page.request.get('/api/health/cron')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.paymentRecovery.enabled).toBe(true)
  })
})
