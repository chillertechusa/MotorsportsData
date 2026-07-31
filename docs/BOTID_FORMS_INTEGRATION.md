# BotID Forms Integration

## Overview

BotID protection is now integrated into three critical user flows:

1. **Sign-up Forms** (`/account/sign-up`, `/dashboard/sign-up`)
2. **Contingency Claim Submissions** (new form component)
3. **Riding Spot Submissions** (new form component)

## How It Works

### User Flow

1. User fills out form fields (name, email, password, etc.)
2. User clicks submit
3. **BotID check fires automatically** before any form action
4. If BotID detects a bot → error message displays, form submission blocked
5. If verified human → form processes normally

### Code Architecture

**Hook:** `hooks/use-botid.ts`
- `useBotID(endpoint)` — reusable hook for any form
- Handles the BotID verification call
- Returns `{ check, botError }` for UI display

**Integration Pattern:**
```tsx
const { check: checkBot, botError } = useBotID('/api/auth/botid-signup')

async function handleSubmit(e) {
  e.preventDefault()
  if (!(await checkBot())) return  // Bot detected, abort
  // proceed with form submission
}
```

## Protected Endpoints

### 1. Sign-up Protection
- **Endpoint:** `POST /api/auth/botid-signup`
- **Forms:** `AccountAuthForm`, `DashboardRegisterForm`
- **Prevents:** Credential stuffing, account farms, spam rider creation

### 2. Contingency Claims
- **Endpoint:** `POST /api/claims/botid-submit`
- **Form:** `ContingencyClaimForm`
- **Prevents:** Automated false claims, financial fraud, bulk claim spam

### 3. Riding Spots
- **Endpoint:** `POST /api/spots/botid-submit`
- **Form:** `RidingSpotForm`
- **Prevents:** AI-generated fake spots, map pollution, garbage data

## Component Files

- `hooks/use-botid.ts` — The reusable hook
- `components/account/account-auth-form.tsx` — Primary signup form (updated)
- `components/dashboard/register-form.tsx` — Dashboard signup form (updated)
- `components/forms/contingency-claim-form.tsx` — New claim submission UI
- `components/forms/riding-spot-form.tsx` — New riding spot UI

## Adding BotID to New Forms

To protect a new form:

```tsx
'use client'
import { useBotID } from '@/hooks/use-botid'

export default function MyForm() {
  const { check: checkBot, botError } = useBotID('/api/my-endpoint')
  
  async function handleSubmit(e) {
    e.preventDefault()
    if (!(await checkBot())) return  // BotID check, abort on failure
    // proceed with your form logic
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* fields */}
      {botError && <p className="error">{botError}</p>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Testing

**Dev mode:** Forms work normally (BotID runs on-device in development)
**Production:** Forms enforce real human verification via Vercel infrastructure

To test BotID rejection locally, the form will display:
```
"Your request appears to be automated. Please try again from a real device."
```

## Deployment Status

✅ All forms live at `https://www.motorsportsdata.io`
- Sign-up form: [/account/sign-up](https://www.motorsportsdata.io/account/sign-up)
- Contingency claims: Ready for routing (use `<ContingencyClaimForm />`)
- Riding spots: Ready for routing (use `<RidingSpotForm />`)

## Error Handling

Both the BotID check and form submission errors are displayed to users:
- BotID rejection: "Your request appears to be automated..."
- Network errors: "Connection error. Please check your connection..."
- Submission errors: "Failed to submit [action]. Please try again."

## Monitoring

BotID provides real-time analytics on the Vercel dashboard:
- Requests verified
- Bot rejection rate
- Geographic distribution
- Device fingerprints

Monitor false-positive rates (legitimate users rejected) — if rates climb above 0.5%, contact Vercel support.
