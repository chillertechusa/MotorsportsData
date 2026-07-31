/**
 * Bike Doctor Email Templates
 * Used for marketing, onboarding, and transactional emails
 */

export const emailTemplates = {
  /**
   * Welcome email for new riders
   */
  welcomeRider: {
    subject: 'Welcome to Bike Doctor — Your AI Motocross Mechanic',
    html: `
      <!doctype html>
      <html>
      <body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
              <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #27272a;background:linear-gradient(135deg,#18181b 0%,#27272a 100%);">
                <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#a3e635;font-weight:700;">Bike Doctor</p>
                <h1 style="margin:8px 0 0;font-size:24px;color:#fafafa;font-weight:800;">Welcome, Rider!</h1>
              </td></tr>
              <tr><td style="padding:24px 32px;">
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#d4d4d8;">
                  Your Bike Doctor account is ready. Describe any issue your bike has — on the track or in the pits — and get instant AI diagnosis with fix instructions.
                </p>
                <ul style="margin:16px 0;padding:0;list-style:none;color:#d4d4d8;font-size:14px;line-height:1.8;">
                  <li style="margin:8px 0;">✓ AI diagnosis (jetting, setup, brakes, tires)</li>
                  <li style="margin:8px 0;">✓ Maintenance schedule by hours</li>
                  <li style="margin:8px 0;">✓ Ride log & body tracking</li>
                  <li style="margin:8px 0;">✓ Send diagnoses to your local shop</li>
                </ul>
                <div style="text-align:center;margin:28px 0 8px;">
                  <a href="https://www.bikedoctor.io/data/rider" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">Get Started</a>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  },

  /**
   * Coach tier marketing email
   */
  coachMarketing: {
    subject: 'Become a Bike Doctor Coach — Monitor Your Riders\' Progress',
    html: `
      <!doctype html>
      <html>
      <body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
              <tr><td style="padding:28px 32px;background:#18181b;border:1px solid #27272a;border-radius:12px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#fafafa;font-weight:800;">Coach Connect — $49/month</h1>
                <p style="margin:0 0 20px;color:#d4d4d8;font-size:14px;line-height:1.6;">
                  Get read-only access to your riders' bikes, setup notes, and ride logs. See readiness, track progress, and give better feedback.
                </p>
                <ul style="margin:16px 0;padding:0;list-style:none;color:#d4d4d8;font-size:13px;">
                  <li style="margin:6px 0;">✓ Monitor up to 50 athletes</li>
                  <li style="margin:6px 0;">✓ Real-time readiness tracking</li>
                  <li style="margin:6px 0;">✓ Setup & jetting notes</li>
                  <li style="margin:6px 0;">✓ Injury/soreness alerts</li>
                </ul>
                <div style="text-align:center;margin:24px 0;">
                  <a href="https://www.bikedoctor.io/pricing" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">Upgrade to Coach</a>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  },

  /**
   * Shop tier marketing email
   */
  shopMarketing: {
    subject: 'Shop Connect — Receive Work Orders Directly from Riders',
    html: `
      <!doctype html>
      <html>
      <body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
              <tr><td style="padding:28px 32px;background:#18181b;border:1px solid #27272a;border-radius:12px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#fafafa;font-weight:800;">Shop Connect — $99/month</h1>
                <p style="margin:0 0 20px;color:#d4d4d8;font-size:14px;line-height:1.6;">
                  Riders send you pre-filled work orders with AI diagnostics. Receive orders directly, reduce diagnostic time, increase service quality.
                </p>
                <ul style="margin:16px 0;padding:0;list-style:none;color:#d4d4d8;font-size:13px;">
                  <li style="margin:6px 0;">✓ Pre-filled work orders from riders</li>
                  <li style="margin:6px 0;">✓ AI diagnostic summaries</li>
                  <li style="margin:6px 0;">✓ Clutch DMS integration</li>
                  <li style="margin:6px 0;">✓ Unlimited order volume</li>
                </ul>
                <div style="text-align:center;margin:24px 0;">
                  <a href="https://www.bikedoctor.io/pricing" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">Upgrade to Shop</a>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  },

  /**
   * Re-engagement email for inactive users
   */
  reengagement: {
    subject: 'We miss you — Your bike needs a checkup',
    html: `
      <!doctype html>
      <html>
      <body style="margin:0;padding:0;background:#09090b;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
              <tr><td style="padding:24px;background:#18181b;border:1px solid #27272a;border-radius:12px;color:#d4d4d8;font-size:14px;">
                <p style="margin:0 0 16px;color:#fafafa;font-weight:600;font-size:16px;">It's been a while...</p>
                <p>Log a ride, update your setup notes, or get a diagnosis for that weird sound your bike made last weekend.</p>
                <div style="text-align:center;margin:20px 0;">
                  <a href="https://www.bikedoctor.io/data/rider" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:13px;text-decoration:none;padding:10px 24px;border-radius:8px;">Back to Bike Doctor</a>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  },
}

export type EmailTemplate = keyof typeof emailTemplates
