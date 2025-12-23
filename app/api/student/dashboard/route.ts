import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDuration } from '@/lib/utils'

export async function GET() {
  try {
    // In production, get userId from session
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    })

    if (!student) {
      return NextResponse.json({
        inProgress: 0,
        todayTime: '0m',
        weekTime: '0m',
        certificates: 0,
        courses: [],
        deadlines: [],
        timeChart: [],
      })
    }

    // Get actual courses from database
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

        const progress = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0

        return {
          id: course.id,
          name: course.titleEn,
          progress,
          completed: completedLessons,
          total: totalLessons,
        }
      })
    )

    const deadlines = [
      {
        course: 'Thailand Course',
        task: 'Complete Module 3',
        date: '2024-01-15',
        daysLeft: 5,
        urgent: true,
      },
      {
        course: 'Legal Framework',
        task: 'Final Test',
        date: '2024-01-20',
        daysLeft: 10,
        urgent: false,
      },
    ]

    const timeChart = [
      { day: 'Mon', minutes: 45 },
      { day: 'Tue', minutes: 60 },
      { day: 'Wed', minutes: 30 },
      { day: 'Thu', minutes: 75 },
      { day: 'Fri', minutes: 50 },
      { day: 'Sat', minutes: 20 },
      { day: 'Sun', minutes: 15 },
    ]

    return NextResponse.json({
      inProgress: courses.length,
      todayTime: '45m',
      weekTime: '4h 35m',
      certificates: 1,
      courses,
      deadlines,
      timeChart,
    })
  } catch (error) {
    console.error('Error fetching student dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

