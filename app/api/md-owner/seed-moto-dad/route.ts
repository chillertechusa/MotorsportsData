import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, mdTeams, mdRiderProfiles, mdVehicles, mdRaces } from '@/lib/db/schema'
import { v4 as uuid } from 'uuid'

/**
 * Seed a family demo: "Moto Dad" (guardian) + two kids (minor riders)
 * Shows the guardian model in action: one account, multiple rider profiles
 */
export async function POST() {
  // Block in production
  const isSeedingDisabled = process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true'
  if (isSeedingDisabled) {
    return NextResponse.json({ success: false, error: 'Seeding disabled in production.' }, { status: 403 })
  }

  try {
    const demoId = uuid()

    // 1. Create dad account (guardian)
    const dadUser = await db
      .insert(user)
      .values({
        id: uuid(),
        email: `moto-dad-${demoId}@demo.motorsportsdata.io`,
        name: 'Chris Martinez (Dad)',
        dateOfBirth: '1985-06-15',
        role: 'user',
      })
      .returning()
      .then((rows) => rows[0])

    // 2. Create team
    const teamId = uuid()
    await db.insert(mdTeams).values({
      id: teamId,
      ownerId: dadUser.id,
      name: 'Martinez Family Racing',
      foundedAt: new Date('2024-01-15'),
      timezone: 'America/Denver',
    })

    // 3. Add dad as owner rider profile
    await db.insert(mdRiderProfiles).values({
      id: uuid(),
      teamId,
      userId: dadUser.id,
      riderName: 'Chris Martinez',
      bikeNumber: 'DAD',
      isMinor: false,
      dateOfBirth: '1985-06-15',
      ageBracket: 'adult',
    })

    // 4. Create two minor rider profiles (linked to dad's account)
    const jakeProfileId = uuid()
    const sophieProfileId = uuid()

    await db.insert(mdRiderProfiles).values([
      {
        id: jakeProfileId,
        teamId,
        userId: dadUser.id,
        riderName: 'Jake Martinez',
        bikeNumber: '722',
        isMinor: true,
        guardianId: dadUser.id,
        dateOfBirth: '2010-03-22', // 14 years old
        ageBracket: 'teen',
      },
      {
        id: sophieProfileId,
        teamId,
        userId: dadUser.id,
        riderName: 'Sophie Martinez',
        bikeNumber: '24',
        isMinor: true,
        guardianId: dadUser.id,
        dateOfBirth: '2013-07-10', // 11 years old
        ageBracket: 'youth',
      },
    ])

    // 5. Add bikes (Jake's 450, Sophie's 85cc, Dad's CRF250R, tow rig)
    await db.insert(mdVehicles).values([
      {
        id: uuid(),
        teamId,
        riderUserId: dadUser.id,
        vehicleType: 'motocross_bike',
        make: 'Honda',
        model: 'CRF450R',
        year: 2025,
        engineCC: 450,
        engineType: '4-stroke',
        vin: 'demo-crf450r-1',
        notes: "Jake's main race bike for 450 class",
      },
      {
        id: uuid(),
        teamId,
        riderUserId: dadUser.id,
        vehicleType: 'motocross_bike',
        make: 'Yamaha',
        model: 'YZ85 Small Wheel',
        year: 2024,
        engineCC: 85,
        engineType: '2-stroke',
        vin: 'demo-yz85-1',
        notes: "Sophie's 85cc beginner bike",
      },
      {
        id: uuid(),
        teamId,
        riderUserId: dadUser.id,
        vehicleType: 'motocross_bike',
        make: 'Honda',
        model: 'CRF250R',
        year: 2023,
        engineCC: 250,
        engineType: '4-stroke',
        vin: 'demo-crf250r-1',
        notes: "Dad's 250 for fun rides",
      },
      {
        id: uuid(),
        teamId,
        riderUserId: dadUser.id,
        vehicleType: 'tow_rig',
        make: 'Ford',
        model: 'F-150 PowerStroke',
        year: 2022,
        engineCC: 6700,
        engineType: 'diesel',
        vin: 'demo-f150-1',
        notes: 'Family tow rig for races and practice',
      },
    ])

    // 6. Add upcoming race (Pala Raceway)
    await db.insert(mdRaces).values({
      id: uuid(),
      teamId,
      raceName: 'Pala Raceway Round 7',
      raceDate: new Date('2026-08-02'),
      location: 'Pala, CA',
      notes: 'Regional championship race — both kids entered',
    })

    return NextResponse.json({
      success: true,
      message: 'Moto Dad demo seeded',
      demoEmail: dadUser.email,
      demoPassword: 'DemoPass123!',
      familyName: 'Martinez Family Racing',
      riders: ['Jake (14)', 'Sophie (11)', 'Dad (guardian)'],
    })
  } catch (error) {
    console.error('[v0] Moto Dad seed failed:', error)
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 })
  }
}
