import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params
    const data = await request.json()

    // Get current max order for questions in this test
    const maxOrder = await prisma.question.findFirst({
      where: { testId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = (maxOrder?.order || 0) + 1

    const question = await prisma.question.create({
      data: {
        testId,
        type: data.type,
        order: newOrder,
        questionEn: data.questionEn || '',
        questionRu: data.questionRu || '',
        options: data.options || null,
        correctAnswer: data.correctAnswer || {},
        points: data.points || 1,
        explanationEn: data.explanationEn || null,
        explanationRu: data.explanationRu || null,
        mediaUrl: data.mediaUrl || null,
        mediaType: data.mediaType || null,
      },
    })

    return NextResponse.json(question)
  } catch (error: any) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

