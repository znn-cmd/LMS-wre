import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // In production, get userId from session
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Get test
    const test: any = await prisma.test.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' }, // In real app, randomize here if test.randomizeQuestions is true
        },
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Check if there's an in-progress attempt
    let attempt = await prisma.testAttempt.findFirst({
      where: {
        testId: id,
        userId: student.id,
        status: 'IN_PROGRESS',
      },
      orderBy: { createdAt: 'desc' },
    })

    // If no in-progress attempt, check max attempts
    if (!attempt) {
      const attemptsCount = await prisma.testAttempt.count({
        where: {
          testId: id,
          userId: student.id,
        },
      })

      if (test.maxAttempts && attemptsCount >= test.maxAttempts) {
        return NextResponse.json(
          { error: 'Maximum attempts reached' },
          { status: 403 }
        )
      }

      // Create new attempt
      attempt = await prisma.testAttempt.create({
        data: {
          testId: id,
          userId: student.id,
          status: 'IN_PROGRESS',
          startTime: new Date(),
        },
      })
    }

    // Get existing answers
    const existingAnswers = await prisma.testAnswer.findMany({
      where: { attemptId: attempt.id },
    })

    const answers: Record<string, any> = {}
    existingAnswers.forEach((answer) => {
      answers[answer.questionId] = answer.answer
    })

    return NextResponse.json({
      test: {
        ...test,
        questions: test.questions.map((q: any) => ({
          ...q,
          options: q.options as any,
          correctAnswer: undefined, // Don't send correct answers
        })),
      },
      attempt,
      answers,
    })
  } catch (error) {
    console.error('Error starting test:', error)
    return NextResponse.json(
      { error: 'Failed to start test' },
      { status: 500 }
    )
  }
}

