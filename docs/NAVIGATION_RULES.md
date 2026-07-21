# Navigation Rules

## Sign-On Button Rule

**Rule: Every "Sign In" or "Sign On" button/link MUST point to `/data/sign-in`**

### Rationale
- Consistent user experience across the entire platform
- Single source of truth for authentication entry point
- Prevents users from being redirected to irrelevant pages like pricing

### Implementation
- Primary sign-in page: `/data/sign-in`
- All navigation buttons, header links, and call-to-action buttons labeled "Sign In" or "Sign On" must use this route
- Pass `redirect` query parameter to return users to their intended destination after sign-in
  - Example: `/data/sign-in?redirect=/data/dashboard`

### Where to Apply
- Header navigation (MdNav component)
- Pricing page CTAs
- Landing page sign-in links
- Any other entry point to authentication

### Components to Check
- `/components/md-nav.tsx` — main header navigation
- `/app/data/pricing/page.tsx` — pricing page call-to-actions
- Any other page with sign-in links

### Current Status
✅ Header "Sign In" link → `/data/sign-in?redirect=/data`
