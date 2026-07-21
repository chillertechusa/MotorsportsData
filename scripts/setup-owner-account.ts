import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'

const OWNER_EMAIL = 'motorsportsdata@gmail.com'

async function setupOwnerAccount(password: string) {
  try {
    // Check if owner account already exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, OWNER_EMAIL))
      .limit(1)

    if (existingUser.length > 0) {
      console.log(`✓ Owner account already exists: ${OWNER_EMAIL}`)
      return { success: true, message: 'Account already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create owner account
    const newUser = await db
      .insert(userTable)
      .values({
        email: OWNER_EMAIL,
        name: 'Platform Owner',
        password: hashedPassword,
        emailVerified: true,
        createdAt: new Date(),
      })
      .returning()

    console.log(`✓ Owner account created successfully: ${OWNER_EMAIL}`)
    return { success: true, message: 'Owner account created', userId: newUser[0]?.id }
  } catch (error) {
    console.error('✗ Failed to create owner account:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Run if called directly
const password = process.argv[2]
if (!password) {
  console.error('Usage: npx ts-node scripts/setup-owner-account.ts <password>')
  console.error('Example: npx ts-node scripts/setup-owner-account.ts "your-secure-password"')
  process.exit(1)
}

setupOwnerAccount(password)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
