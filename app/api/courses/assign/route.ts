import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { courseId, userIds, deadline } = await request.json()

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
        prisma.courseAssignment.create({
          data: {
            courseId,
            userId,
            assignedBy: admin.id,
            deadline: deadline ? new Date(deadline) : null,
          },
        })
      )
    )

    return NextResponse.json({ assignments })
  } catch (error: any) {
    console.error('Error assigning course:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Course already assigned to one or more users' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to assign course' },
      { status: 500 }
    )
  }
}


