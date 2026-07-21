import { test, expect } from '@playwright/test'

test.describe('Free Rider Signup Flow', () => {
  test('should sign up as Free Rider and enter console', async ({ page }) => {
    // Start on homepage
    await page.goto('/')
    
    // Click Sign In button
    await page.click('a:has-text("Sign In")')
    expect(page.url()).toContain('/data/sign-in')
    
    // Fill signup form (free tier = no checkout)
    const randomEmail = `test-${Date.now()}@example.com`
    await page.fill('input[name="email"]', randomEmail)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
    
    // Submit signup
    await page.click('button:has-text("Create Account")')
    
    // Should redirect directly to console (no checkout for free)
    await page.waitForURL('/data', { timeout: 10000 })
    expect(page.url()).toContain('/data')
    
    // Verify Free Rider tier is active
    const tierBadge = await page.locator('[data-testid="tier-badge"]').textContent()
    expect(tierBadge).toContain('Free Rider')
    
    // Verify locked features show upgrade button
    const upgradeBtns = await page.locator('button:has-text("Upgrade")').count()
    expect(upgradeBtns).toBeGreaterThan(0)
  })

  test('should skip paid tier CTA if already signed in', async ({ page }) => {
    // This simulates: user is signed in → visits tier page → should skip to checkout
    await page.goto('/data/plans/privateer')
    
    // If already signed in, CTA button should go straight to checkout, not sign-in
    await page.click('button:has-text("Upgrade to Privateer")')
    
    await page.waitForURL(/\/checkout\/tier/, { timeout: 10000 })
    expect(page.url()).toContain('/checkout/tier?tier=privateer')
  })
})
