import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const test = await prisma.test.update({
      where: { id },
      data: {
        titleEn: data.titleEn,
        titleRu: data.titleRu,
        descriptionEn: data.descriptionEn,
        descriptionRu: data.descriptionRu,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts,
        allowRetake: data.allowRetake,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    )
  }
}
