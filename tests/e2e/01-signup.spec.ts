import { test, expect } from '@playwright/test'

test.describe('Phase 1-2: Signup & Free Tier', () => {
  test('should create free account and assign Free Rider tier', async ({ page }) => {
    // Navigate to signup
    await page.goto('/data/sign-in?mode=sign-up')
    
    // Verify signup form loads
    await expect(page.locator('text=Create Account')).toBeVisible()
    
    // Generate unique email for this test
    const timestamp = Date.now()
    const testEmail = `test-user-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'
    
    // Fill in signup form
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.fill('input[placeholder*="name" i]', 'Test User')
    
    // Accept terms
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    await termsCheckbox.check()
    
    // COPPA compliance - user is 13+
    const coppaCheckbox = page.locator('input[type="checkbox"]').nth(1)
    if (await coppaCheckbox.isVisible()) {
      await coppaCheckbox.check()
    }
    
    // Submit signup
    await page.click('button:has-text("Sign Up")')
    
    // Should redirect to platform console /data
    await page.waitForURL('/data', { timeout: 10000 })
    await expect(page).toHaveURL(/\/data($|\?)/)
    
    // Verify Free Rider tier badge visible
    await expect(page.locator('text=Free Rider')).toBeVisible({ timeout: 5000 })
    
    // Verify user is logged in (sidebar should show)
    await expect(page.locator('text=Logout')).toBeVisible({ timeout: 5000 })
  })
  
  test('should show error on duplicate email signup', async ({ page }) => {
    const testEmail = 'duplicate-test@example.com'
    const testPassword = 'TestPassword123!'
    
    // First signup
    await page.goto('/data/sign-in?mode=sign-up')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.fill('input[placeholder*="name" i]', 'First User')
    
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    await termsCheckbox.check()
    
    const coppaCheckbox = page.locator('input[type="checkbox"]').nth(1)
    if (await coppaCheckbox.isVisible()) {
      await coppaCheckbox.check()
    }
    
    await page.click('button:has-text("Sign Up")')
    await page.waitForURL('/data', { timeout: 10000 })
    
    // Logout
    await page.click('text=Logout')
    await page.waitForURL(/\/data\/sign-in/, { timeout: 5000 })
    
    // Try duplicate signup
    await page.goto('/data/sign-in?mode=sign-up')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.fill('input[placeholder*="name" i]', 'Second User')
    
    await termsCheckbox.check()
    if (await coppaCheckbox.isVisible()) {
      await coppaCheckbox.check()
    }
    
    await page.click('button:has-text("Sign Up")')
    
    // Should show error instead of redirecting
    await expect(page.locator('text=already exists')).toBeVisible({ timeout: 5000 })
    
    // Form should still be filled (user can correct)
    await expect(page.locator('input[type="email"]')).toHaveValue(testEmail)
  })
  
  test('should require password validation on signup', async ({ page }) => {
    await page.goto('/data/sign-in?mode=sign-up')
    
    const timestamp = Date.now()
    const testEmail = `weakpass-${timestamp}@example.com`
    
    // Try weak password
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', 'weak') // Too short
    await page.fill('input[placeholder*="name" i]', 'Test User')
    
    const termsCheckbox = page.locator('input[type="checkbox"]').first()
    await termsCheckbox.check()
    
    const coppaCheckbox = page.locator('input[type="checkbox"]').nth(1)
    if (await coppaCheckbox.isVisible()) {
      await coppaCheckbox.check()
    }
    
    await page.click('button:has-text("Sign Up")')
    
    // Should show validation error
    await expect(page.locator('text=password')).toBeVisible({ timeout: 5000 })
  })
})
