import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { hashPassword } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // In production, use JWT or session tokens
    return NextResponse.json({
      user,
      token: 'demo-token',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


