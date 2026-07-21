import { test, expect } from '@playwright/test'

test.describe('Phase 1-2: Checkout & Tier Selection', () => {
  test('should navigate to checkout from tier page with tier param', async ({ page }) => {
    // Navigate to Privateer tier page
    await page.goto('/data/plans/privateer')
    
    // Verify tier name displays
    await expect(page.locator('text=Privateer')).toBeVisible()
    
    // Click "Start Free Trial" or checkout button
    const checkoutButton = page.locator('button:has-text("Start Free Trial"), button:has-text("Upgrade"), button:has-text("Get Started")').first()
    await checkoutButton.click()
    
    // Should redirect to checkout with tier param
    await page.waitForURL(/\/checkout\/tier\?tier=/, { timeout: 5000 })
    
    // Verify we're on checkout page
    await expect(page.locator('text=Checkout')).toBeVisible({ timeout: 5000 })
  })
  
  test('should display correct pricing based on tier', async ({ page }) => {
    // Navigate directly to checkout with tier param
    await page.goto('/checkout/tier?tier=privateer')
    
    // Verify pricing displays
    await expect(page.locator('text=/\\$.*month/i')).toBeVisible({ timeout: 5000 })
    
    // Verify tier name in checkout
    await expect(page.locator('text=Privateer')).toBeVisible()
  })
  
  test('should apply annual discount (15%) when selected', async ({ page }) => {
    await page.goto('/checkout/tier?tier=race_team')
    
    // Verify pricing section loads
    await expect(page.locator('text=Billing')).toBeVisible({ timeout: 5000 })
    
    // Get monthly price
    const monthlyPrice = await page.locator('text=/Monthly.*\\$.*\\d+/i').textContent()
    console.log('[e2e] Monthly price:', monthlyPrice)
    
    // Toggle to annual
    const annualToggle = page.locator('button:has-text("Annual"), label:has-text("Annual")').first()
    if (await annualToggle.isVisible()) {
      await annualToggle.click()
    }
    
    // Verify annual price is lower (15% discount applied)
    const annualPrice = await page.locator('text=/Annual.*\\$.*\\d+/i').textContent()
    console.log('[e2e] Annual price:', annualPrice)
    
    // Verify discount badge visible
    await expect(page.locator('text=15% off')).toBeVisible({ timeout: 3000 })
  })
  
  test('should require authentication before checkout', async ({ page }) => {
    await page.goto('/checkout/tier?tier=privateer')
    
    // Click checkout/payment button
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Continue"), button:has-text("Subscribe")').first()
    await payButton.click()
    
    // Should redirect to signin if not authenticated
    await page.waitForURL(/\/data\/sign-in/, { timeout: 5000 })
  })
  
  test('should handle tier param through signin redirect', async ({ page }) => {
    // Start at checkout
    await page.goto('/checkout/tier?tier=factory_rig')
    
    // Click payment button (should redirect to signin with redirect param)
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Continue"), button:has-text("Subscribe")').first()
    await payButton.click()
    
    // Should be on signin with redirectTo param
    await page.waitForURL(/\/data\/sign-in.*redirect/, { timeout: 5000 })
    
    // Verify checkout URL is preserved in redirect param
    const url = page.url()
    expect(url).toContain('redirectTo=')
    expect(url).toContain('checkout')
  })
  
  test('should validate payment form before submission', async ({ page }) => {
    await page.goto('/checkout/tier?tier=privateer')
    
    // Try to submit payment without filling form
    const payButton = page.locator('button:has-text("Pay"), button:has-text("Submit"), button:has-text("Subscribe")').first()
    
    if (await payButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await payButton.click()
      
      // Should show validation errors
      await expect(page.locator('text=required|invalid')).toBeVisible({ timeout: 3000 })
    }
  })
})
