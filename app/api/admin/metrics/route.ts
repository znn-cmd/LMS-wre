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

    // Mock data for charts
    const userActivity = [
      { date: 'Mon', active: 45 },
      { date: 'Tue', active: 52 },
      { date: 'Wed', active: 48 },
      { date: 'Thu', active: 61 },
      { date: 'Fri', active: 55 },
      { date: 'Sat', active: 38 },
      { date: 'Sun', active: 32 },
    ]

    const courseCompletion = [
      { name: 'Thailand Course', completion: 75 },
      { name: 'Real Estate Basics', completion: 68 },
      { name: 'Legal Framework', completion: 82 },
    ]

    const timeStats = {
      min: '5m',
      avg: avgLessonTime,
      max: '45m',
    }

    return NextResponse.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      inTrainingPercent: totalAssignments > 0 ? Math.round((totalAssignments / totalUsers) * 100) : 0,
      completedCoursesPercent: totalAssignments > 0 ? Math.round((completedProgress / totalAssignments) * 100) : 0,
      avgCourseTime: '2h 30m',
      avgLessonTime,
      avgTestTime: '15m',
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

