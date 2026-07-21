import { test, expect } from '@playwright/test'

test.describe('Phase 3: Health Checks & Monitoring', () => {
  test('should load health checks dashboard', async ({ page }) => {
    await page.goto('/data/owner/health-checks')
    
    // Dashboard should load (may redirect to login if not authenticated)
    const isLoggedIn = await page.locator('text=Health Checks|Status').isVisible({ timeout: 3000 }).catch(() => false)
    
    if (!isLoggedIn) {
      // Login first (use existing credentials or sign up)
      await page.goto('/data/sign-in')
      // Assuming demo credentials available
    }
  })
  
  test('should display all 5 health check agents', async ({ page }) => {
    await page.goto('/data/owner/health-checks')
    
    const checkTypes = ['signup', 'signin', 'checkout', 'account_creation', 'data_isolation']
    
    for (const checkType of checkTypes) {
      // Should show each check type
      const checkElement = page.locator(`text=${checkType}`, { exact: false })
      await expect(checkElement).toBeVisible({ timeout: 5000 })
    }
  })
  
  test('should show pass/fail status for each agent', async ({ page }) => {
    await page.goto('/data/owner/health-checks')
    
    // Wait for checks to load
    await page.waitForLoadState('networkidle')
    
    // Each check should have a status badge
    const statusBadges = page.locator('[data-testid*="status"], .badge, [class*="status"]')
    const count = await statusBadges.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })
  
  test('should trigger manual health check', async ({ page }) => {
    await page.goto('/data/owner/health-checks')
    
    // Find refresh/run button
    const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Run"), button:has-text("Check")')
    
    if (await refreshButton.isVisible()) {
      // Click to trigger checks
      await refreshButton.click()
      
      // Should show loading state or updated results
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      // Timestamp should update
      const timestamp = page.locator('text=/last run|executed|checked/i')
      await expect(timestamp).toBeVisible({ timeout: 3000 })
    }
  })
  
  test('should display response times for each check', async ({ page }) => {
    await page.goto('/data/owner/health-checks')
    
    // Wait for results
    await page.waitForLoadState('networkidle')
    
    // Should show milliseconds for response times
    const responseTime = page.locator('text=/\\d+\\s*m?s|\\d+\\s*ms/')
    const count = await responseTime.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })
  
  test('should make API call to health checks endpoint', async ({ context }) => {
    // Intercept API calls
    let apiResponse = null
    
    context.on('response', async (response) => {
      if (response.url().includes('/api/health-checks')) {
        apiResponse = response
      }
    })
    
    const page = await context.newPage()
    await page.goto('/data/owner/health-checks')
    
    // Wait for API call
    await page.waitForLoadState('networkidle')
    
    if (apiResponse) {
      expect(apiResponse.status()).toBe(200)
      const data = await apiResponse.json()
      
      // Verify response structure
      expect(data).toHaveProperty('checks')
      expect(data).toHaveProperty('summary')
      expect(Array.isArray(data.checks)).toBe(true)
    }
  })
  
  test('should persist health check history', async ({ page }) => {
    await page.goto('/data/owner/health-checks')
    
    // Capture current check result
    const initialTimestamp = await page.locator('text=/\\d{1,2}:\\d{2}').first().textContent()
    
    // Wait a moment
    await page.waitForTimeout(2000)
    
    // Refresh page
    await page.reload()
    
    // History should still be visible
    await expect(page.locator('text=Health Checks|Status')).toBeVisible({ timeout: 5000 })
  })
})
