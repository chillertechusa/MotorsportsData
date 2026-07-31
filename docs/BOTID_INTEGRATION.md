# BotID Integration — Gate Drop Bot Protection

Gate Drop uses [Vercel BotID](https://vercel.com/docs/security/botid) to protect high-value endpoints from automated spam, AI copilots, and script abuse.

## Protected Endpoints

### 1. Sign-up / Registration
**Route:** `POST /api/auth/botid-signup`

Prevents spam rider accounts, credential stuffing, and account farms used for contingency claim abuse.

```bash
curl -X POST http://localhost:3000/api/auth/botid-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@example.com",
    "password": "secure123",
    "name": "Alex Rider"
  }'
```

**Response (Human):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "botIdVerified": true
}
```

**Response (Bot Detected):**
```json
{
  "error": "Request appears to be automated. Please try again from a real device.",
  "status": 401
}
```

---

### 2. Contingency Claim Submission
**Route:** `POST /api/claims/botid-submit`

Prevents automated false claim submissions and financial fraud. This is the most critical endpoint — a single bot farm could file thousands of fake claims and drain contingency pools.

```bash
curl -X POST http://localhost:3000/api/claims/botid-submit \
  -H "Content-Type: application/json" \
  -d '{
    "riderId": "rider-123",
    "eventId": "event-456",
    "resultProof": "https://...",
    "contingencyProgramId": "prog-789"
  }'
```

**Response (Human):**
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "claimId": "CLAIM-1719792000000",
  "botIdVerified": true
}
```

---

### 3. Riding Spot Submission
**Route:** `POST /api/spots/botid-submit`

Prevents spam, AI-generated fake spots, and data pollution in the community riding spot map.

```bash
curl -X POST http://localhost:3000/api/spots/botid-submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Glamis Sand Dunes",
    "latitude": 35.0489,
    "longitude": -120.1206,
    "description": "World-class sand riding. Huge dunes, perfect for jumps.",
    "difficulty": "intermediate",
    "terrain": "sand"
  }'
```

**Response (Human):**
```json
{
  "success": true,
  "message": "Riding spot submitted for approval",
  "spotId": "SPOT-1719792000000",
  "status": "pending_moderation",
  "botIdVerified": true
}
```

---

## How It Works

BotID runs on **Vercel infrastructure** and analyzes:
- Request origin and device fingerprint
- Browser patterns and TLS fingerprint
- IP reputation and geolocation
- Request timing and behavior anomalies

It returns `{ isBot: true }` or `{ isBot: false }` with ~99.9% accuracy.

**Key properties:**
- Works client-side (JavaScript + Request headers) — no additional tokens needed
- Blocks AI copilots, automated scripts, and bot farms
- Allows legitimate human requests from any device
- Returns fast (< 1ms overhead)

---

## Integration Checklist

When connecting these endpoints to your frontend forms:

- [ ] **Sign-up form** calls `POST /api/auth/botid-signup` on submit
- [ ] **Claim form** calls `POST /api/claims/botid-submit` on submit
- [ ] **Spot submission form** calls `POST /api/spots/botid-submit` on submit
- [ ] **Error handling** displays `error.message` if bot detected (401)
- [ ] **Loading state** disabled during request (prevent double-submit)
- [ ] **Success state** redirects or shows confirmation after claim/spot approval

---

## Example React Hook

```typescript
// hooks/useBotIdSubmit.ts
import { useState } from 'react'

export function useBotIdSubmit(endpoint: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (data: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
```

---

## Monitoring & Metrics

BotID blocks are logged to `console` with `[BotID]` prefix. In production, integrate with your analytics:

- Count of bot-detected requests per endpoint
- Success rate of human requests
- Geographic distribution of blocks
- Temporal patterns (time of day, day of week)

---

## Deployment

All three endpoints are **production-ready**. They:
- ✅ Build successfully in Next.js 16 production mode
- ✅ Ship to Vercel with zero additional config
- ✅ Work on Edge Runtime (fast cold starts)
- ✅ Use Vercel's infrastructure for bot detection

**Deploy with:** `git push` or `vercel deploy`

---

## Further Reading

- [Vercel BotID Docs](https://vercel.com/docs/security/botid)
- [BotID API Reference](https://www.npmjs.com/package/botid)
- [Prevent Abuse Guide](https://vercel.com/docs/security/preventing-abuse)
