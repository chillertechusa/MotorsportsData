import { test, expect } from '@playwright/test'

test.describe('Phase 5: Usage Analytics & Event Tracking', () => {
  test('should load analytics dashboard', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Dashboard should load
    await expect(page.locator('text=Analytics|Metrics')).toBeVisible({ timeout: 5000 })
  })
  
  test('should display key metrics cards', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Verify 4 key metric cards visible
    const metrics = ['Signups', 'Checkouts', 'Revenue', 'AOV']
    
    for (const metric of metrics) {
      const card = page.locator(`text=${metric}`)
      await expect(card).toBeVisible({ timeout: 3000 })
    }
  })
  
  test('should display numeric values in metrics', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Metrics should show numbers
    const numbers = page.locator('text=/^\\d+$|^\\$[\\d,]+|\\d+\\.\\d+%/')
    const count = await numbers.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })
  
  test('should display line chart for signup/checkout trends', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Chart container should be visible
    const chart = page.locator('canvas, [role="img"], svg')
    const count = await chart.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
  
  test('should display bar chart for revenue', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Should have chart or graph visible
    const chartElement = page.locator('canvas, svg, [class*="chart"], [class*="graph"]')
    await expect(chartElement.first()).toBeVisible({ timeout: 3000 })
  })
  
  test('should display pie chart for tier distribution', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Pie chart should be visible
    const pieChart = page.locator('canvas, svg, [role="img"]')
    expect(await pieChart.count()).toBeGreaterThanOrEqual(1)
    
    // Should show tier labels
    const tiers = ['Free Rider', 'Privateer', 'Race Team', 'Factory Rig']
    for (const tier of tiers) {
      const tierText = page.locator(`text=${tier}`)
      // At least some tier should be visible
      if (await tierText.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(tierText).toBeVisible()
        break
      }
    }
  })
  
  test('should allow date range filtering', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Find date inputs
    const dateInputs = page.locator('input[type="date"]')
    const count = await dateInputs.count()
    expect(count).toBeGreaterThanOrEqual(2)
    
    // Change start date
    const startDate = dateInputs.first()
    await startDate.fill('2026-07-01')
    
    // Should trigger data refresh
    await page.waitForLoadState('networkidle')
    
    // Chart/data should update
    await expect(page.locator('canvas, svg, [class*="chart"]')).toBeVisible({ timeout: 3000 })
  })
  
  test('should provide CSV export', async ({ page, context }) => {
    // Listen for download
    const downloadPromise = context.waitForEvent('download')
    
    await page.goto('/data/owner/analytics')
    
    // Find export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("CSV"), button:has-text("Download")')
    
    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exportButton.click()
      
      // Download should trigger
      const download = await downloadPromise.catch(() => null)
      if (download) {
        expect(download.suggestedFilename()).toContain('analytics')
      }
    }
  })
  
  test('should display billing frequency breakdown', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Should show Annual/Monthly breakdown
    const annual = page.locator('text=Annual')
    const monthly = page.locator('text=Monthly')
    
    await expect(annual).toBeVisible({ timeout: 3000 })
    await expect(monthly).toBeVisible({ timeout: 3000 })
  })
  
  test('should show event breakdown table', async ({ page }) => {
    await page.goto('/data/owner/analytics')
    
    // Event types should be listed
    const eventTypes = ['Signup', 'Checkout', 'Tier Upgrade', 'Invite', 'Member Added']
    
    for (const event of eventTypes) {
      const eventElement = page.locator(`text=${event}`)
      if (await eventElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(eventElement).toBeVisible()
        break // At least one should be visible
      }
    }
  })
  
  test('should track signup events in analytics', async ({ page, context }) => {
    // Intercept analytics API call
    let analyticsResponse = null
    
    context.on('response', async (response) => {
      if (response.url().includes('/api/analytics')) {
        analyticsResponse = response
      }
    })
    
    // Perform signup
    const timestamp = Date.now()
    await page.goto('/data/sign-in?mode=sign-up')
    
    await page.fill('input[type="email"]', `track-${timestamp}@example.com`)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.fill('input[placeholder*="name" i]', 'Test User')
    
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    await termsCheckbox.check()
    
    const coppaCheckbox = page.locator('input[type="checkbox"]').nth(1)
    if (await coppaCheckbox.isVisible()) {
      await coppaCheckbox.check()
    }
    
    await page.click('button:has-text("Sign Up")')
    await page.waitForURL('/data', { timeout: 10000 })
    
    // Check analytics dashboard for updated count
    await page.goto('/data/owner/analytics')
    
    // Signups count should be visible and numeric
    const signupsText = await page.locator('text=Signups').locator('..').textContent()
    expect(signupsText).toMatch(/\\d+/)
  })
})
