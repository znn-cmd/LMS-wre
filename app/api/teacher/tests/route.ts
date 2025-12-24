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

    // Get tests without course relation to avoid errors if courseId column doesn't exist yet
    const tests = await prisma.test.findMany({
      where: { creatorId: teacher.id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`Found ${tests.length} tests for teacher ${teacher.id}`)

    // Get attempts count and course info for each test
    const testsWithStats = await Promise.all(
      tests.map(async (test) => {
        try {
          const attemptsCount = await prisma.testAttempt.count({
            where: { testId: test.id },
          })

          // Get course info if courseId exists (handle case where column might not exist in DB)
          let course = null
          let courseId = null
          try {
            // Try to access courseId - it might not exist if migration hasn't run
            courseId = (test as any).courseId || null
            if (courseId) {
              course = await prisma.course.findUnique({
                where: { id: courseId },
                select: {
                  id: true,
                  titleEn: true,
                  titleRu: true,
                },
              })
            }
          } catch (courseErr) {
            // courseId field might not exist in DB yet - ignore
            console.log('CourseId field may not exist yet:', courseErr)
          }

          return {
            id: test.id,
            titleEn: test.titleEn,
            titleRu: test.titleRu,
            descriptionEn: test.descriptionEn || null,
            descriptionRu: test.descriptionRu || null,
            passingScore: test.passingScore,
            timeLimit: test.timeLimit,
            maxAttempts: test.maxAttempts,
            courseId,
            course,
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
            courseId: null,
            course: null,
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


