import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { activeTime, endTime } = await request.json()

    // In production, get userId from session
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: {
          lessonId: id,
          userId: student.id,
        },
      },
      update: {
        status: 'COMPLETED',
        endTime: endTime ? new Date(endTime) : new Date(),
        activeTime: activeTime || 0,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        lessonId: id,
        userId: student.id,
        status: 'COMPLETED',
        startTime: new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
        activeTime: activeTime || 0,
        completedAt: new Date(),
      },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    )
  }
}


