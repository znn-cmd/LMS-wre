import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // In production, get userId from session
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    })

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: student
                  ? {
                      where: { userId: student.id },
                      take: 1,
                    }
                  : false,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    )

    const completedLessons = student
      ? await prisma.lessonProgress.count({
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
      : 0

    const progress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    // Add progress info to each lesson
    const modulesWithProgress = course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        progress: lesson.progress?.[0] || null,
      })),
    }))

    return NextResponse.json({
      ...course,
      modules: modulesWithProgress,
      progress,
      completedLessons,
      totalLessons,
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const course = await prisma.course.update({
      where: { id },
      data: {
        titleEn: data.titleEn,
        titleRu: data.titleRu,
        descriptionEn: data.descriptionEn,
        descriptionRu: data.descriptionRu,
        status: data.status,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}
