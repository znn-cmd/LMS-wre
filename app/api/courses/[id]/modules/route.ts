import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const module = await prisma.module.create({
      data: {
        courseId: id,
        titleEn: data.titleEn,
        titleRu: data.titleRu,
        descriptionEn: data.descriptionEn || null,
        descriptionRu: data.descriptionRu || null,
        order: data.order,
      },
    })

    return NextResponse.json(module)
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    )
  }
}


