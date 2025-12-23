import { prisma } from './prisma'
import { verifyPassword, hashPassword } from './utils'
import { UserRole } from '@prisma/client'

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  department?: string | null
  team?: string | null
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.isActive) {
    return null
  }

  if (!verifyPassword(password, user.password)) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    department: user.department,
    team: user.team,
  }
}

export async function createUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  department?: string
  team?: string
}) {
  const hashedPassword = hashPassword(data.password)
  
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  })
}


