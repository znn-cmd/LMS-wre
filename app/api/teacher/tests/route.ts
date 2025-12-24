import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // In production, get userId from session
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    })

    if (!teacher) {
      return NextResponse.json([])
    }

    const tests = await prisma.test.findMany({
      where: { creatorId: teacher.id },
      include: {
        questions: true,
        course: {
          select: {
            id: true,
            titleEn: true,
            titleRu: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get attempts count for each test
    const testsWithStats = await Promise.all(
      testsWithCourses.map(async (test) => {
        try {
          const attemptsCount = await prisma.testAttempt.count({
            where: { testId: test.id },
          })

          return {
            id: test.id,
            titleEn: test.titleEn,
            titleRu: test.titleRu,
            descriptionEn: test.descriptionEn || null,
            descriptionRu: test.descriptionRu || null,
            passingScore: test.passingScore,
            timeLimit: test.timeLimit,
            maxAttempts: test.maxAttempts,
            courseId: (test as any).courseId || null,
            course: test.course || null,
            questionsCount: test.questions?.length || 0,
            totalAttempts: attemptsCount,
          }
        } catch (err) {
          console.error(`Error processing test ${test.id}:`, err)
          // Return basic test info even if attempts count fails
          return {
            id: test.id,
            titleEn: test.titleEn,
            titleRu: test.titleRu,
            descriptionEn: test.descriptionEn || null,
            descriptionRu: test.descriptionRu || null,
            passingScore: test.passingScore,
            timeLimit: test.timeLimit,
            maxAttempts: test.maxAttempts,
            courseId: (test as any).courseId || null,
            course: test.course || null,
            questionsCount: test.questions?.length || 0,
            totalAttempts: 0,
          }
        }
      })
    )

    return NextResponse.json(testsWithStats)
  } catch (error: any) {
    console.error('Error fetching teacher tests:', error)
    // Return empty array instead of error object to prevent .map() errors
    return NextResponse.json([], { status: 200 })
  }
}


