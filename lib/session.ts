import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getCurrentUser() {
  try {
    // In production, use cookies or JWT tokens
    // For now, we'll use a simple approach with headers
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        team: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}


