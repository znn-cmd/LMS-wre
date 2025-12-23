import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // In production, get userId from session
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    })

    if (!student) {
      return NextResponse.json([])
    }

    // Get test assignments for this student
    const assignments = await prisma.testAssignment.findMany({
      where: {
        OR: [
          { userId: student.id },
          { groupId: student.team },
        ],
      },
      include: {
        test: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    const tests = await Promise.all(
      assignments.map(async (assignment) => {
        const test = assignment.test

        // Get attempts for this student
        const attempts = await prisma.testAttempt.findMany({
          where: {
            testId: test.id,
            userId: student.id,
          },
          orderBy: { createdAt: 'desc' },
        })

        const bestAttempt = attempts.find((a) => a.score !== null)
        const bestScore = bestAttempt?.score ? Math.round(bestAttempt.score) : null

        return {
          id: test.id,
          titleEn: test.titleEn,
          titleRu: test.titleRu,
          descriptionEn: test.descriptionEn,
          descriptionRu: test.descriptionRu,
          passingScore: test.passingScore,
          timeLimit: test.timeLimit,
          maxAttempts: test.maxAttempts,
          allowRetake: test.allowRetake,
          deadline: assignment.deadline,
          attemptsCount: attempts.length,
          bestScore,
        }
      })
    )

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching student tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}


