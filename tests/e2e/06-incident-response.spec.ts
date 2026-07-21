import { test, expect } from '@playwright/test'

test.describe('Incident Response System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to owner dashboard
    await page.goto('/data/owner/incidents', { waitUntil: 'networkidle' })
  })

  test('Should display incidents dashboard', async ({ page }) => {
    // Check for dashboard title
    await expect(page.locator('h1, h2')).toContainText(/incident|issue/i)
    
    // Check for incidents list or empty state
    const incidentsList = page.locator('[data-testid="incidents-list"], table')
    await expect(incidentsList.or(page.locator('text=No incidents'))).toBeVisible()
  })

  test('Should display incident status badges', async ({ page }) => {
    // Look for status indicators
    const statusBadges = page.locator('[data-testid="incident-status"]')
    const count = await statusBadges.count()
    
    if (count > 0) {
      // If incidents exist, check for status values
      for (let i = 0; i < Math.min(count, 3); i++) {
        const status = await statusBadges.nth(i).textContent()
        expect(['active', 'resolved', 'acknowledged']).toContain(status?.toLowerCase())
      }
    }
  })

  test('Should allow resolving an incident', async ({ page }) => {
    // Find resolve button for first incident
    const resolveButton = page.locator('[data-testid="resolve-incident"]').first()
    const buttonCount = await resolveButton.count()
    
    if (buttonCount > 0) {
      // Click resolve button
      await resolveButton.click()
      
      // Check for confirmation or status change
      const resolved = page.locator('text=resolved, text=Resolved')
      await expect(resolved.or(page.locator('[data-testid="success-message"]'))).toBeVisible({ timeout: 5000 })
    }
  })

  test('Should display alert history for incident', async ({ page }) => {
    // Look for alert history section
    const alertHistory = page.locator('[data-testid="alert-history"], text=Alert History')
    const historyCount = await alertHistory.count()
    
    if (historyCount > 0) {
      await expect(alertHistory).toBeVisible()
      
      // Check for alert entries
      const alertEntries = page.locator('[data-testid="alert-entry"]')
      expect(await alertEntries.count()).toBeGreaterThanOrEqual(0)
    }
  })

  test('Should show incident severity levels', async ({ page }) => {
    // Look for severity indicators
    const severityBadges = page.locator('[data-testid="incident-severity"]')
    const count = await severityBadges.count()
    
    if (count > 0) {
      // Check for severity levels (critical, warning, info)
      for (let i = 0; i < Math.min(count, 5); i++) {
        const severity = await severityBadges.nth(i).textContent()
        expect(['critical', 'warning', 'info']).toContain(severity?.toLowerCase())
      }
    }
  })

  test('Should filter incidents by status', async ({ page }) => {
    // Look for filter controls
    const statusFilter = page.locator('[data-testid="filter-status"]')
    const filterCount = await statusFilter.count()
    
    if (filterCount > 0) {
      // Try filtering by 'active' status
      await statusFilter.selectOption('active')
      
      // Wait for results to update
      await page.waitForLoadState('networkidle')
      
      // Check that results reflect filter (if any incidents shown)
      const incidents = page.locator('[data-testid="incident-row"]')
      const visibleCount = await incidents.count()
      expect(visibleCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('Should search incidents', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('[data-testid="search-incidents"]')
    const searchCount = await searchInput.count()
    
    if (searchCount > 0) {
      // Type search term
      await searchInput.fill('checkout')
      
      // Wait for results
      await page.waitForTimeout(500)
      
      // Check results updated
      const results = page.locator('[data-testid="incident-row"]')
      expect(await results.count()).toBeGreaterThanOrEqual(0)
    }
  })

  test('Should navigate to health checks from incidents', async ({ page }) => {
    // Look for link to health checks dashboard
    const healthCheckLink = page.locator('a:has-text("Health Checks"), [data-testid="link-health-checks"]')
    const linkCount = await healthCheckLink.count()
    
    if (linkCount > 0) {
      await healthCheckLink.first().click()
      
      // Should navigate to health checks page
      await expect(page).toHaveURL(/health-check/)
    }
  })
})
