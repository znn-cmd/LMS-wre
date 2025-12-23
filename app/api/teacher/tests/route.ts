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
        attempts: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const testsWithStats = tests.map((test) => ({
      id: test.id,
      titleEn: test.titleEn,
      titleRu: test.titleRu,
      descriptionEn: test.descriptionEn,
      descriptionRu: test.descriptionRu,
      passingScore: test.passingScore,
      timeLimit: test.timeLimit,
      maxAttempts: test.maxAttempts,
      questionsCount: test.questions.length,
      totalAttempts: test.attempts.length,
    }))

    return NextResponse.json(testsWithStats)
  } catch (error) {
    console.error('Error fetching teacher tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}


