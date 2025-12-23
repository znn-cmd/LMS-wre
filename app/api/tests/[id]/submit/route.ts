import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { attemptId, answers } = await request.json()

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

    // Get test with questions
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Get attempt
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.userId !== student.id) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      )
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0

    const testAnswers = []

    for (const question of test.questions) {
      totalPoints += question.points
      const userAnswer = answers[question.id]
      const correctAnswer = question.correctAnswer as any
      let isCorrect = false
      let points = 0

      if (userAnswer) {
        switch (question.type) {
          case 'SINGLE_CHOICE':
            isCorrect = userAnswer.answer === correctAnswer.answer
            break
          case 'MULTIPLE_CHOICE':
            const userAnswers = (userAnswer.answers || []).sort()
            const correctAnswers = (correctAnswer.answers || []).sort()
            isCorrect =
              userAnswers.length === correctAnswers.length &&
              userAnswers.every((val: string, idx: number) => val === correctAnswers[idx])
            break
          case 'TRUE_FALSE':
            isCorrect = userAnswer.answer === correctAnswer.answer
            break
          case 'SHORT_TEXT':
            const userText = (userAnswer.answer || '').toLowerCase().trim()
            const correctText = (correctAnswer.answer || '').toLowerCase().trim()
            isCorrect = userText === correctText
            break
          case 'ORDERING':
            const userOrder = (userAnswer.order || []).join(',')
            const correctOrder = (correctAnswer.order || []).join(',')
            isCorrect = userOrder === correctOrder
            break
          case 'MATCHING':
            const userMatches = JSON.stringify(userAnswer.matches || {})
            const correctMatches = JSON.stringify(correctAnswer.matches || {})
            isCorrect = userMatches === correctMatches
            break
        }

        if (isCorrect) {
          points = question.points
          earnedPoints += points
        }
      }

      // Save answer
      await prisma.testAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: question.id,
          },
        },
        update: {
          answer: userAnswer,
          isCorrect,
          points,
        },
        create: {
          attemptId: attempt.id,
          questionId: question.id,
          answer: userAnswer,
          isCorrect,
          points,
        },
      })

      testAnswers.push({
        questionId: question.id,
        isCorrect,
        points,
      })
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= test.passingScore

    // Update attempt
    const endTime = new Date()
    const timeSpent = Math.floor((endTime.getTime() - attempt.startTime.getTime()) / 1000)

    await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        status: passed ? 'COMPLETED' : 'FAILED',
        score,
        endTime,
        timeSpent,
      },
    })

    return NextResponse.json({
      attempt: {
        ...attempt,
        status: passed ? 'COMPLETED' : 'FAILED',
        score,
        endTime,
        timeSpent,
      },
      passed,
      score: Math.round(score),
      earnedPoints,
      totalPoints,
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    )
  }
}


