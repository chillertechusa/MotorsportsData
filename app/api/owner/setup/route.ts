import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    console.log('[v0] Owner setup POST received, password length:', password?.length)

    if (!password || password.length < 12) {
      console.log('[v0] Password validation failed:', password?.length)
      return Response.json({ error: 'Password must be at least 12 characters' }, { status: 400 })
    }

    // Use Better Auth to create the owner account with proper password hashing
    console.log('[v0] Calling auth.api.signUpEmail for motorsportsdata@gmail.com')
    const result = await auth.api.signUpEmail({
      body: {
        email: 'motorsportsdata@gmail.com',
        password,
        name: 'Platform Owner',
      },
    })

    console.log('[v0] SignUpEmail result:', result?.user?.id ? 'Success' : 'Failed - no user returned')

    if (!result?.user) {
      return Response.json({ error: 'Failed to create owner account - no user in response' }, { status: 400 })
    }

    console.log('[v0] Owner account created successfully:', result.user.id)
    return Response.json({ 
      success: true, 
      message: 'Owner account created successfully',
      userId: result.user.id 
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[v0] Owner setup error:', { message: msg, error })
    
    // Better Auth throws when email already exists
    if (/already|exists|duplicate/i.test(msg)) {
      console.log('[v0] Owner account already exists')
      return Response.json({ error: 'Owner account already exists' }, { status: 409 })
    }
    
    return Response.json({ error: msg || 'Failed to create owner account' }, { status: 500 })
  }
}
