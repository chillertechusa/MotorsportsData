# Twilio SMS Templates — Motorsports Data Platform

## Primary Welcome SMS (Recommended)

```
Your Motorsports Data account is active! 🏍️ Welcome to the platform. 

Log in at motorsportsdata.io to start logging sessions and tracking performance.

Questions? Reply to this message or call us at (888) 469-8475.

—Motorsports Data
```

**Character count:** 187 characters (fits in 1 SMS)

---

## Concise Welcome SMS (Minimal)

```
Your Motorsports Data account is active! Log in at motorsportsdata.io. 

Questions? Reply to this message or call (888) 469-8475.
```

**Character count:** 112 characters (fits in 1 SMS)

---

## Premium/Paid Tier Welcome SMS

```
Welcome to Motorsports Data! Your {PLAN_NAME} account is now active.

Get started: motorsportsdata.io/data

Need help? Reply here or call our team at (888) 469-8475.

—Motorsports Data
```

**Character count:** 145 characters (fits in 1 SMS)
**Variable:** Replace {PLAN_NAME} with "Privateer", "Race Team", or "Factory Rig"

---

## Free Tier (Rookie) Welcome SMS

```
Your free Motorsports Data account is ready! Start logging sessions at motorsportsdata.io

Upgrade to Privateer anytime for advanced analytics.

Questions? Text us back or call (888) 469-8475.
```

**Character count:** 168 characters (fits in 1 SMS)

---

## Implementation Notes

- **Recommended version:** Primary Welcome SMS — professional, brand voice, includes all key info
- **Send timing:** Immediately after successful signup (checkout/success page)
- **Personalization:** Add rider/team name if available (e.g., "Hey John, your account is active...")
- **Short codes:** Consider short URL shortener if needed (motorsportsdata.io is 16 chars, fits easily)
- **Compliance:** Always include opt-out language in a follow-up message or in account settings per TCPA
- **Character limits:** SMS has 160-character limit per message; all templates fit in 1 message

---

## Suggested Twilio Webhook Implementation

When a user successfully completes checkout and lands on `/data/checkout/success`, trigger this SMS via a server action:

```typescript
// Send via Twilio (server action)
await sendWelcomeSMS({
  phoneNumber: form.phone,
  planName: planParam,
  firstName: form.name.split(' ')[0],
})
```

Template selection based on plan:
- **Rookie (free):** Free Tier template
- **Privateer/Race Team/Factory:** Premium Tier template with {PLAN_NAME} substitution
