import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // In production, get userId from session
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    })

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        contentBlocks: {
          orderBy: { order: 'asc' },
        },
        progress: student
          ? {
              where: { userId: student.id },
              take: 1,
            }
          : false,
      },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Get next lesson
    const nextLesson = await prisma.lesson.findFirst({
      where: {
        module: {
          courseId: lesson.module.courseId,
        },
        OR: [
          {
            module: { order: { gt: lesson.module.order } },
          },
          {
            module: { order: lesson.module.order },
            order: { gt: lesson.order },
          },
        ],
      },
      orderBy: [
        { module: { order: 'asc' } },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({
      ...lesson,
      courseId: lesson.module.courseId,
      progress: lesson.progress?.[0] || null,
      nextLessonId: nextLesson?.id || null,
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
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

    // Update lesson
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        titleEn: data.titleEn,
        titleRu: data.titleRu,
        estimatedTime: data.estimatedTime,
        minimumTime: data.minimumTime,
        order: data.order !== undefined ? data.order : undefined,
        updatedAt: new Date(),
      },
    })

    // Update content blocks
    if (data.contentBlocks) {
      // Delete existing blocks
      await prisma.contentBlock.deleteMany({
        where: { lessonId: id },
      })

      // Create new blocks
      await prisma.contentBlock.createMany({
        data: data.contentBlocks.map((block: any, index: number) => ({
          lessonId: id,
          type: block.type,
          order: index + 1,
          contentEn: block.contentEn,
          contentRu: block.contentRu,
          metadata: block.metadata || null,
        })),
      })
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson' },
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

    await prisma.lesson.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
