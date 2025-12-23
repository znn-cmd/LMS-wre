import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { testId, userIds, deadline } = await request.json()

    // In production, get userId from session
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const assignments = await Promise.all(
      userIds.map((userId: string) =>
        prisma.testAssignment.create({
          data: {
            testId,
            userId,
            deadline: deadline ? new Date(deadline) : null,
          },
        })
      )
    )

    return NextResponse.json({ assignments })
  } catch (error: any) {
    console.error('Error assigning test:', error)
    return NextResponse.json(
      { error: 'Failed to assign test' },
      { status: 500 }
    )
  }
}


