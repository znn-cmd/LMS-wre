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

    // Get lessons with most drop-offs (in_progress but not completed)
    const lessonDropOffs = await prisma.lessonProgress.groupBy({
      by: ['lessonId'],
      where: { status: 'IN_PROGRESS' },
      _count: true,
    })

    const lessonsWithDropOffs = await Promise.all(
      lessonDropOffs.slice(0, 5).map(async (ld) => {
        const lesson = await prisma.lesson.findUnique({
          where: { id: ld.lessonId },
          select: { titleEn: true, titleRu: true },
        })
        return {
          lesson: lesson?.titleEn || 'Unknown',
          dropOff: ld._count,
        }
      })
    )

    // Calculate time vs performance
    const testResults = await prisma.testAttempt.findMany({
      where: { status: 'COMPLETED' },
      select: {
        score: true,
        timeSpent: true,
      },
    })

    // Group by time ranges
    const timeRanges = [
      { label: '0-5m', min: 0, max: 300 },
      { label: '5-10m', min: 300, max: 600 },
      { label: '10-15m', min: 600, max: 900 },
      { label: '15-20m', min: 900, max: 1200 },
      { label: '20+m', min: 1200, max: Infinity },
    ]

    const timePerformance = timeRanges.map((range) => {
      const attemptsInRange = testResults.filter(
        (t) => (t.timeSpent || 0) >= range.min && (t.timeSpent || 0) < range.max
      )
      const avgScore =
        attemptsInRange.length > 0
          ? attemptsInRange.reduce((sum, t) => sum + (t.score || 0), 0) / attemptsInRange.length
          : 0
      return {
        time: range.label,
        score: Math.round(avgScore),
      }
    })

    // Calculate error rates for questions (simplified)
    const testAnswers = await prisma.testAnswer.groupBy({
      by: ['questionId', 'isCorrect'],
      _count: true,
    })

    const questionErrors = await Promise.all(
      testAnswers
        .filter((ta) => ta.isCorrect === false)
        .slice(0, 3)
        .map(async (ta) => {
          const question = await prisma.question.findUnique({
            where: { id: ta.questionId },
            select: { questionEn: true },
          })
          const totalAnswers = testAnswers
            .filter((a) => a.questionId === ta.questionId)
            .reduce((sum, a) => sum + a._count, 0)
          return {
            question: question?.questionEn.substring(0, 50) || 'Unknown',
            errorRate: Math.round((ta._count / totalAnswers) * 100),
          }
        })
    )

    return NextResponse.json({
      completionRate,
      dropOffRate,
      avgLessonTime,
      difficultLessons: lessonDropOffs.length,
      dropOffByLesson: lessonsWithDropOffs,
      timePerformance,
      testErrors: questionErrors,
    })
  } catch (error) {
    console.error('Error fetching teacher metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}


