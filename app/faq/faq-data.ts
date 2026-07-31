/**
 * Single source of truth for the FAQ.
 *
 * Shared by the server page (which emits FAQPage structured data) and the
 * client accordion UI, so the rich-result markup can never drift from the
 * answers users actually see — Google treats that mismatch as spam.
 */
export type FaqCategory = {
  category: string
  items: { q: string; a: string }[]
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    category: 'Contingency & Sponsor Money',
    items: [
      {
        q: 'What is contingency and why am I leaving money on the table?',
        a: 'Contingency is money manufacturers and brands pay you for race results, but every brand has its own claim form, deadline, and proof requirements. The average privateer leaves roughly $2,800 unclaimed per season simply because the paperwork never gets filed. Motorsports Data watches your results and tells you exactly which claims you are eligible for and when they are due.',
      },
      {
        q: 'How does contingency automation actually work?',
        a: 'You log your race results once. We match them against the contingency programs you are enrolled in, generate the claim with the required proof attached, and track it through to payment so nothing expires silently.',
      },
      {
        q: 'Can I show sponsors what they got for their money?',
        a: 'Yes. The sponsor dashboard produces ROI reports covering exposure, results, and spend, which is what sponsors ask for at renewal time. You can export it as a PDF to send directly.',
      },
    ],
  },
  {
    category: 'Plans & Billing',
    items: [
      {
        q: 'What do the plans cost?',
        a: 'Rookie is $9/mo for ages 4 to 12, Privateer is $49/mo for semi-pro and club racers, Race Team is $299/mo for up to 8 riders with 11 scoped team roles, and Factory Rig is $2,499/mo for full factory squads with unlimited riders and staff.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. Cancel at any time from your account settings. There are no penalties and no cancellation questions.',
      },
      {
        q: 'Can I upgrade or downgrade between tiers?',
        a: 'Yes. You can change plans at any time and charges are prorated, so moving from Privateer to Race Team mid-season is straightforward.',
      },
      {
        q: 'Does the platform pay for itself?',
        a: 'Privateer costs $588 a year. Recovering a single season of typically unclaimed contingency, around $2,800, more than covers the subscription.',
      },
    ],
  },
  {
    category: 'AI Doctor & Bike File',
    items: [
      {
        q: 'How accurate is the AI Doctor diagnosis?',
        a: 'The AI Doctor is trained on thousands of real motocross diagnostic cases. It narrows down likely causes from your symptom description, severity, and bike model. Always confirm with a shop before major repairs or engine work.',
      },
      {
        q: 'Which bikes are supported?',
        a: 'Any motocross bike, two-stroke or four-stroke, including YZ, CR, RM, KX, CRF, WR, DR, KLX and KX450 platforms. Setup specs are maintained for current models.',
      },
      {
        q: 'Can I get help with jetting?',
        a: 'Yes. Provide your altitude, weather, and how the bike feels on the track, and the AI Doctor recommends pilot, needle, and main jet changes with the reasoning behind each one.',
      },
      {
        q: 'Is there a severity rating?',
        a: 'Yes. Every diagnosis is rated as "Ride it, monitor" for minor issues that are safe to race, "Fix before next session" for problems affecting performance, or "Do not ride" for critical safety risks.',
      },
    ],
  },
  {
    category: 'Teams & Coaching',
    items: [
      {
        q: 'How do I invite a coach?',
        a: 'Open the Team tab, choose Invite, and enter their email. They receive a link to accept and are granted scoped access to the rider data you choose to share.',
      },
      {
        q: 'What can coaches see?',
        a: 'Coaches see the bike file, setup history, ride log, and readiness status for riders who invited them. Access is scoped by role and every view is written to an audit log.',
      },
      {
        q: 'How many team roles are there?',
        a: 'Race Team and Factory Rig support 11 distinct roles, including mechanic, team manager, trainer, and data analyst, each with its own scoped permissions so people only see what they need.',
      },
    ],
  },
  {
    category: 'WMX & Youth Racing',
    items: [
      {
        q: 'Do you support women\u2019s motocross?',
        a: 'Yes, as a first-class part of the platform rather than an afterthought. WMX classes, schedules, and contingency programs are supported directly alongside the men\u2019s classes.',
      },
      {
        q: 'Can I track my kids\u2019 bikes and results?',
        a: 'Yes. Parents create one account and add a rider profile for each child, then see every bike, readiness status, and race on the schedule. Kids can have their own login as well.',
      },
      {
        q: 'What age can kids have their own account?',
        a: 'Riders 18 and over create their own account. Riders 13 to 17 need parental consent under COPPA, and riders under 13 require a full guardian-managed setup.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    items: [
      {
        q: 'Is my data private?',
        a: 'Yes. All rider data is encrypted in transit and at rest. Coaches, teams, and shops only receive the data you explicitly share with them. See the Privacy Policy for full detail.',
      },
      {
        q: 'Do you sell or export my data?',
        a: 'Never. Your rider data is yours and is not sold or shared with third parties.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Open Settings, then Account, then Delete Account. All of your data is permanently removed within 30 days.',
      },
      {
        q: 'How do I change my password?',
        a: 'Open Settings, then Security, then Change Password. You will need your current password and access to your email for verification.',
      },
    ],
  },
]

/** Flattened list used to build the FAQPage structured data. */
export const FAQ_ITEMS: { q: string; a: string }[] = FAQ_CATEGORIES.flatMap(
  (category) => category.items,
)
