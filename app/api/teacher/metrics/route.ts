import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDuration } from '@/lib/utils'

export async function GET() {
  try {
    const completedProgress = await prisma.lessonProgress.count({
      where: { status: 'COMPLETED' },
    })

    const totalProgress = await prisma.lessonProgress.count()
    const completionRate = totalProgress > 0
      ? Math.round((completedProgress / totalProgress) * 100)
      : 0

    const inProgress = await prisma.lessonProgress.count({
      where: { status: 'IN_PROGRESS' },
    })

    const dropOffRate = totalProgress > 0
      ? Math.round((inProgress / totalProgress) * 100)
      : 0

    const allProgress = await prisma.lessonProgress.findMany({
      where: { status: 'COMPLETED' },
      select: { activeTime: true },
    })

    const totalActiveTime = allProgress.reduce((sum, p) => sum + p.activeTime, 0)
    const avgLessonTime = allProgress.length > 0
      ? formatDuration(Math.floor(totalActiveTime / allProgress.length))
      : '0m'

    const dropOffByLesson = [
      { lesson: 'Lesson 1', dropOff: 5 },
      { lesson: 'Lesson 5', dropOff: 12 },
      { lesson: 'Lesson 10', dropOff: 8 },
      { lesson: 'Lesson 15', dropOff: 15 },
      { lesson: 'Lesson 20', dropOff: 10 },
    ]

    const timePerformance = [
      { time: '5m', score: 45 },
      { time: '10m', score: 62 },
      { time: '15m', score: 78 },
      { time: '20m', score: 85 },
      { time: '25m', score: 88 },
    ]

    const testErrors = [
      { question: 'Question about Thai property law', errorRate: 35 },
      { question: 'Question about regions', errorRate: 28 },
      { question: 'Question about culture', errorRate: 22 },
    ]

    return NextResponse.json({
      completionRate,
      dropOffRate,
      avgLessonTime,
      difficultLessons: 3,
      dropOffByLesson,
      timePerformance,
      testErrors,
    })
  } catch (error) {
    console.error('Error fetching teacher metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}


