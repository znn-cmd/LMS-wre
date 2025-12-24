import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId, courseId, deadline } = await request.json()

    // Check if already assigned
    const existing = await prisma.courseAssignment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Course already assigned' },
        { status: 400 }
      )
    }

    const assignment = await prisma.courseAssignment.create({
      data: {
        courseId,
        userId,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        course: {
          select: {
            id: true,
            titleEn: true,
            titleRu: true,
          },
        },
      },
    })

    return NextResponse.json(assignment)
  } catch (error: any) {
    console.error('Error assigning course:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to assign course' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, courseId } = await request.json()

    await prisma.courseAssignment.delete({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unassigning course:', error)
    return NextResponse.json(
      { error: 'Failed to unassign course' },
      { status: 500 }
    )
  }
}

