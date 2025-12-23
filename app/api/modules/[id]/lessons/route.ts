import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: id,
        titleEn: data.titleEn,
        titleRu: data.titleRu,
        order: data.order,
        estimatedTime: data.estimatedTime || 15,
        minimumTime: data.minimumTime || null,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}


