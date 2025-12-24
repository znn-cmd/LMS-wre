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
        course: {
          select: {
            id: true,
            titleEn: true,
            titleRu: true,
          },
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

    // Ensure courseId is null if not provided or is "none"
    const courseId = data.courseId && data.courseId !== 'none' ? data.courseId : null

    // Get test first to check creatorId
    const existingTest = await prisma.test.findUnique({
      where: { id },
      select: { creatorId: true },
    })

    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    console.log(`Updating test ${id}, creatorId: ${existingTest.creatorId}`)

    const test = await prisma.test.update({
      where: { id },
      data: {
        titleEn: data.titleEn || '',
        titleRu: data.titleRu || '',
        descriptionEn: data.descriptionEn || null,
        descriptionRu: data.descriptionRu || null,
        passingScore: data.passingScore || 70,
        timeLimit: data.timeLimit || null,
        maxAttempts: data.maxAttempts || null,
        allowRetake: data.allowRetake !== false,
        courseId,
        updatedAt: new Date(),
      },
    })

    console.log(`Test ${id} updated successfully:`, { 
      titleEn: test.titleEn, 
      titleRu: test.titleRu, 
      courseId: test.courseId,
      creatorId: test.creatorId 
    })

    return NextResponse.json(test)
  } catch (error: any) {
    console.error('Error updating test:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update test' },
      { status: 500 }
    )
  }
}
