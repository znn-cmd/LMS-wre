import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const testsWithStats = tests.map((test) => ({
      id: test.id,
      titleEn: test.titleEn,
      titleRu: test.titleRu,
      passingScore: test.passingScore,
      questionsCount: test.questions.length,
      creator: test.creator,
    }))

    return NextResponse.json(testsWithStats)
  } catch (error) {
    console.error('Error fetching admin tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}


