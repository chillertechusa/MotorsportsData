# Platform Owner Account Recovery

## Account: motorsportsdata@gmail.com

### Scenario 1: Forgot Password (Most Common)

1. Go to `/data/forgot-password`
2. Enter: `motorsportsdata@gmail.com`
3. Check your email for password reset link
4. Click link and set new password
5. Sign in at `/data/owner/login`

**Time to recovery:** ~5 minutes (depends on email delivery)

---

### Scenario 2: Email Inaccessible

If you can't access the email recovery:

1. You need the **Emergency Code** (stored in environment variable `OWNER_EMERGENCY_CODE`)
2. Call the emergency recovery endpoint with current password (if you remember it):

```bash
curl -X POST http://localhost:3000/api/owner/emergency-reset \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "your-current-password",
    "emergencyCode": "YOUR_EMERGENCY_CODE"
  }'
```

3. If verification succeeds, you can use forgot-password flow
4. If you don't remember current password, contact your admin

**Time to recovery:** ~2 minutes

---

### Scenario 3: Complete Lockout

If you can't access email AND don't remember password:

**CRITICAL:** This requires database intervention

Contact your database admin to:
1. Query the owner user record: `SELECT id, email FROM user WHERE email = 'motorsportsdata@gmail.com'`
2. Generate a password reset token manually using Better Auth utilities
3. Send password reset link directly

OR

Reset the emergency code and use emergency recovery with backup password.

---

## Setting Up Emergency Code

**Do this immediately after account creation:**

1. Generate a secure random code:
```bash
openssl rand -base64 32
```

2. Store in environment variable (Vercel Project Settings):
```
OWNER_EMERGENCY_CODE=<generated-code>
```

3. **Save this code in a secure location** (password manager, physical vault, etc.)

4. **Never commit to git** - keep in environment variables only

---

## Best Practices

- Use a password manager for the owner password
- Store emergency code separately from password
- Test password reset flow quarterly
- Document the recovery procedure for your team
- Set up backup email alias for motorsportsdata@gmail.com account

---

## What NOT to Do

- ❌ Don't hardcode password anywhere
- ❌ Don't share emergency code in code or git
- ❌ Don't lose backup of emergency code
- ❌ Don't forget to update emergency code if you change it
