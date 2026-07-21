# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: premium-checkout-flow.spec.ts >> Premium Tier Checkout Flow (Matryoshka) >> should sign up → checkout → upgrade tier in one flow
- Location: tests/e2e/premium-checkout-flow.spec.ts:4:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/vercel-sandbox/.cache/ms-playwright/firefox-1532/firefox/firefox
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     pnpm exec playwright install                           ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```