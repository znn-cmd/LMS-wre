import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const attemptId = searchParams.get('attemptId')

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Attempt ID required' },
        { status: 400 }
      )
    }

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

    // Get attempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: true,
      },
    })

    if (!attempt || attempt.userId !== student.id) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      )
    }

    // Get answers
    const answers = await prisma.testAnswer.findMany({
      where: { attemptId: attempt.id },
      include: {
        question: true,
      },
    })

    const questions = answers.map((answer) => ({
      id: answer.question.id,
      questionEn: answer.question.questionEn,
      questionRu: answer.question.questionRu,
      type: answer.question.type,
      points: answer.question.points,
      isCorrect: answer.isCorrect,
      explanationEn: answer.question.explanationEn,
      explanationRu: answer.question.explanationRu,
    }))

    return NextResponse.json({
      titleEn: attempt.test.titleEn,
      titleRu: attempt.test.titleRu,
      score: attempt.score ? Math.round(attempt.score) : 0,
      passingScore: attempt.test.passingScore,
      earnedPoints: answers.reduce((sum, a) => sum + (a.points || 0), 0),
      totalPoints: answers.reduce((sum, a) => sum + a.question.points, 0),
      timeSpent: attempt.timeSpent || 0,
      allowRetake: attempt.test.allowRetake,
      questions,
    })
  } catch (error) {
    console.error('Error fetching test result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}


