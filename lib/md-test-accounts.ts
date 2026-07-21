// Plain (non-"use server") module so the TEST_ACCOUNTS array + types can be
// imported by both client components and the server action. A "use server"
// file may only export async functions, so this data must live outside it.

export type TestAccount = {
  email: string
  password: string
  name: string
  tier: string
  label: string
  price: string
  loginUrl: string
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'test-rookie@motorsportsdata.io',
    password: 'TestRookie#1',
    name: 'Test Rookie',
    tier: 'rookie',
    label: 'The Rookie',
    price: '$9/mo',
    loginUrl: '/data/sign-in',
  },
  {
    email: 'test-privateer@motorsportsdata.io',
    password: 'TestPrivateer#1',
    name: 'Test Privateer',
    tier: 'privateer',
    label: 'The Privateer',
    price: '$49/mo',
    loginUrl: '/data/sign-in',
  },
  {
    email: 'test-raceteam@motorsportsdata.io',
    password: 'TestRaceTeam#1',
    name: 'Test Race Team',
    tier: 'race_team',
    label: 'The Race Team',
    price: '$299/mo',
    loginUrl: '/data/sign-in',
  },
  {
    email: 'test-factory@motorsportsdata.io',
    password: 'TestFactory#1',
    name: 'Test Factory',
    tier: 'factory_rig',
    label: 'The Factory Rig',
    price: '$2,499/mo',
    loginUrl: '/data/sign-in',
  },
  // Legendary coach demo account — for Aldon Baker outreach
  {
    email: 'aldonbaker@motorsportsdata.io',
    password: 'Baker#Compound1',
    name: 'Aldon Baker',
    tier: 'coach',
    label: 'The Baker Factory',
    price: 'Coaching Tier',
    loginUrl: '/data/sign-in',
  },
  // Legendary coach demo account — Brian Deegan (coaches his son Haiden)
  {
    email: 'briandeegan@motorsportsdata.io',
    password: 'TheGeneral#1',
    name: 'Brian Deegan',
    tier: 'coach',
    label: 'Deegan MX',
    price: 'Coaching Tier',
    loginUrl: '/data/sign-in',
  },
]

export type SeedResult = {
  account: TestAccount
  status: 'created' | 'already_exists' | 'tier_updated' | 'error'
  detail?: string
}
