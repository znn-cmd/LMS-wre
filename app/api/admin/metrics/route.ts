import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDuration } from '@/lib/utils'

export async function GET() {
  try {
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({ where: { isActive: true } })
    const blockedUsers = totalUsers - activeUsers

    const totalAssignments = await prisma.courseAssignment.count()
    const completedProgress = await prisma.lessonProgress.count({
      where: { status: 'COMPLETED' },
    })

    const allProgress = await prisma.lessonProgress.findMany({
      where: { status: 'COMPLETED' },
      select: { activeTime: true },
    })

    const totalActiveTime = allProgress.reduce((sum, p) => sum + p.activeTime, 0)
    const avgLessonTime = allProgress.length > 0 
      ? formatDuration(Math.floor(totalActiveTime / allProgress.length))
      : '0m'

    const testAttempts = await prisma.testAttempt.findMany({
      where: { status: 'COMPLETED' },
      select: { score: true, testId: true },
    })

    const failedTests = testAttempts.filter(t => (t.score || 0) < 70).length
    const testFailureRate = testAttempts.length > 0
      ? Math.round((failedTests / testAttempts.length) * 100)
      : 0

    // Get user activity for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentProgress = await prisma.lessonProgress.findMany({
      where: {
        updatedAt: { gte: sevenDaysAgo },
      },
      select: {
        updatedAt: true,
        userId: true,
      },
    })

    // Group by day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const userActivityMap = new Map<string, Set<string>>()

    recentProgress.forEach((p) => {
      const day = dayNames[p.updatedAt.getDay()]
      if (!userActivityMap.has(day)) {
        userActivityMap.set(day, new Set())
      }
      userActivityMap.get(day)?.add(p.userId)
    })

    const userActivity = dayNames.map((day) => ({
      date: day,
      active: userActivityMap.get(day)?.size || 0,
    }))

    // Get course completion rates
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        titleEn: true,
        modules: {
          include: {
            lessons: true,
          },
        },
      },
      take: 3,
    })

    const courseCompletion = await Promise.all(
      courses.map(async (course) => {
        const totalLessons = course.modules.reduce(
          (sum, m) => sum + m.lessons.length,
          0
        )
        if (totalLessons === 0) {
          return { name: course.titleEn, completion: 0 }
        }

        const lessonIds = course.modules.flatMap((m) =>
          m.lessons.map((l) => l.id)
        )

        const completedLessons = await prisma.lessonProgress.count({
          where: {
            lessonId: { in: lessonIds },
            status: 'COMPLETED',
          },
        })

        const assignments = await prisma.courseAssignment.count({
          where: { courseId: course.id },
        })

        const completion =
          assignments > 0
            ? Math.round((completedLessons / (totalLessons * assignments)) * 100)
            : 0

        return { name: course.titleEn, completion }
      })
    )

    // Calculate actual time statistics
    const allTimes = allProgress.map((p) => p.activeTime)
    const minTime =
      allTimes.length > 0 ? formatDuration(Math.min(...allTimes)) : '0m'
    const maxTime =
      allTimes.length > 0 ? formatDuration(Math.max(...allTimes)) : '0m'

    const timeStats = {
      min: minTime,
      avg: avgLessonTime,
      max: maxTime,
    }

    // Calculate average test time
    const allTestTimes = testAttempts
      .map((t: any) => t.timeSpent || 0)
      .filter((t) => t > 0)
    const avgTestTime =
      allTestTimes.length > 0
        ? formatDuration(Math.floor(allTestTimes.reduce((a, b) => a + b, 0) / allTestTimes.length))
        : '0m'

    // Calculate average course completion time (sum of all lessons in a course)
    const avgCourseTime = totalActiveTime > 0 && courses.length > 0
      ? formatDuration(Math.floor(totalActiveTime / courses.length))
      : '0m'

    return NextResponse.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      inTrainingPercent: totalAssignments > 0 ? Math.round((totalAssignments / totalUsers) * 100) : 0,
      completedCoursesPercent: totalAssignments > 0 ? Math.round((completedProgress / totalAssignments) * 100) : 0,
      avgCourseTime,
      avgLessonTime,
      avgTestTime,
      testFailureRate,
      retakes: testAttempts.length - new Set(testAttempts.map(t => t.testId)).size,
      userActivity,
      courseCompletion,
      timeStats,
    })
  } catch (error) {
    console.error('Error fetching admin metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

