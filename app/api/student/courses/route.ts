import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // In production, get userId from session
    // For demo, use first student
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    })

    if (!student) {
      return NextResponse.json([])
    }

    const assignments = await prisma.courseAssignment.findMany({
      where: { userId: student.id },
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
    })

    const courses = await Promise.all(
      assignments.map(async (assignment) => {
        const course = assignment.course
        const totalLessons = course.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0
        )

        const completedProgress = await prisma.lessonProgress.count({
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

        const progress = totalLessons > 0
          ? Math.round((completedProgress / totalLessons) * 100)
          : 0

        return {
          id: course.id,
          titleEn: course.titleEn,
          titleRu: course.titleRu,
          descriptionEn: course.descriptionEn,
          descriptionRu: course.descriptionRu,
          status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
          progress,
          completedLessons: completedProgress,
          totalLessons,
          deadline: assignment.deadline,
        }
      })
    )

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching student courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}


