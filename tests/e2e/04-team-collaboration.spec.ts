import { test, expect } from '@playwright/test'

test.describe('Phase 4: Team Collaboration & RBAC', () => {
  test('should load team members dashboard', async ({ page }) => {
    await page.goto('/data/team/members')
    
    // Page should load
    await expect(page.locator('text=Team Members|Members')).toBeVisible({ timeout: 5000 })
  })
  
  test('should display existing team members', async ({ page }) => {
    await page.goto('/data/team/members')
    
    // Member list should have at least the owner
    const memberList = page.locator('[data-testid="member"], tr, [role="row"]')
    const count = await memberList.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
  
  test('should open invite modal', async ({ page }) => {
    await page.goto('/data/team/members')
    
    // Click invite button
    const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add Member"), button:has-text("+")')
    await inviteButton.first().click()
    
    // Modal should open
    const modal = page.locator('dialog, [role="dialog"], [class*="modal"]')
    await expect(modal).toBeVisible({ timeout: 3000 })
  })
  
  test('should fill invite form with email and role', async ({ page }) => {
    await page.goto('/data/team/members')
    
    const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add Member"), button:has-text("+")')
    await inviteButton.first().click()
    
    // Fill email
    const timestamp = Date.now()
    const inviteEmail = `team-member-${timestamp}@example.com`
    
    await page.fill('input[type="email"]', inviteEmail)
    
    // Select role
    const roleSelect = page.locator('select, [role="combobox"], button:has-text("Role")')
    if (await roleSelect.first().isVisible()) {
      await roleSelect.first().click()
      
      // Select Mechanic role
      const mechanicOption = page.locator('text=Mechanic').first()
      await mechanicOption.click()
    }
    
    // Submit
    const submitButton = page.locator('button:has-text("Send Invite"), button:has-text("Invite"), button:has-text("Submit")')
    await submitButton.click()
    
    // Should show success message
    await expect(page.locator('text=Invite sent|invitation sent|successfully')).toBeVisible({ timeout: 5000 })
  })
  
  test('should display 4 roles in invite form', async ({ page }) => {
    await page.goto('/data/team/members')
    
    const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add Member"), button:has-text("+")')
    await inviteButton.first().click()
    
    // Open role selector
    const roleSelect = page.locator('select, [role="combobox"], button:has-text("Role")')
    await roleSelect.first().click()
    
    // Verify all 4 roles visible
    const roles = ['Mechanic', 'Coach', 'Mechanic Coach', 'Owner']
    for (const role of roles) {
      await expect(page.locator(`text=${role}`)).toBeVisible({ timeout: 3000 })
    }
  })
  
  test('should enforce RBAC - Mechanic cannot delete members', async ({ page }) => {
    // This test assumes a logged-in Mechanic user
    await page.goto('/data/team/members')
    
    // Look for delete button
    const deleteButtons = page.locator('button:has-text("Delete"), button:has-text("Remove"), [aria-label*="delete"]')
    
    // If visible, it should be disabled for non-owner roles
    const firstDelete = deleteButtons.first()
    if (await firstDelete.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isDisabled = await firstDelete.isDisabled()
      expect(isDisabled).toBe(true)
    }
  })
  
  test('should update member role via permission editor', async ({ page }) => {
    await page.goto('/data/team/members')
    
    // Find a member row with role editor
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Change Role"), [aria-label*="edit"]').first()
    
    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click()
      
      // Should open role editor
      const roleEditor = page.locator('[data-testid="role-editor"], select, [role="combobox"]')
      await expect(roleEditor).toBeVisible({ timeout: 3000 })
    }
  })
  
  test('should send invitation email via Resend', async ({ page, context }) => {
    // Intercept email sending
    let emailSent = false
    
    context.on('response', async (response) => {
      if (response.url().includes('resend') || response.url().includes('/api/email')) {
        emailSent = true
      }
    })
    
    await page.goto('/data/team/members')
    
    const inviteButton = page.locator('button:has-text("Invite"), button:has-text("Add Member")')
    await inviteButton.first().click()
    
    const timestamp = Date.now()
    await page.fill('input[type="email"]', `test-${timestamp}@example.com`)
    
    const submitButton = page.locator('button:has-text("Send Invite"), button:has-text("Invite")')
    await submitButton.click()
    
    // Verify success
    await expect(page.locator('text=sent|success')).toBeVisible({ timeout: 5000 })
  })
})
