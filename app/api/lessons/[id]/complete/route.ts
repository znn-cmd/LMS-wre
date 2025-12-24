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

    // Get lesson with course info
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
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

    // Check if course is completed
    const course = lesson.module.course
    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    )

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: student.id,
        status: 'COMPLETED',
        lesson: {
          module: {
            courseId: course.id,
          },
        },
      },
    })

    const courseCompleted = totalLessons > 0 && completedLessons >= totalLessons

    // If course is completed, find associated test
    let testId = null
    if (courseCompleted) {
      const test = await prisma.test.findFirst({
        where: {
          courseId: course.id,
        },
        select: {
          id: true,
        },
      })
      testId = test?.id || null
    }

    return NextResponse.json({
      ...progress,
      courseCompleted,
      testId,
    })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    )
  }
}


