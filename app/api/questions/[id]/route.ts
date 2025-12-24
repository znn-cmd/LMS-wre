import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const question = await prisma.question.update({
      where: { id },
      data: {
        type: data.type,
        questionEn: data.questionEn || '',
        questionRu: data.questionRu || '',
        options: data.options ? (typeof data.options === 'string' ? JSON.parse(data.options) : data.options) : null,
        correctAnswer: data.correctAnswer || {},
        points: data.points || 1,
        explanationEn: data.explanationEn || null,
        explanationRu: data.explanationRu || null,
        mediaUrl: data.mediaUrl || null,
        mediaType: data.mediaType || null,
      },
    })

    console.log(`Question ${id} updated:`, { type: question.type, hasMedia: !!question.mediaUrl })

    return NextResponse.json(question)
  } catch (error: any) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.question.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}

