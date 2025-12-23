import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const blockType = formData.get('blockType') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Get lesson with course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const courseId = lesson.module.courseId

    // Create upload directory structure: public/uploads/course/[courseId]/lesson/[lessonId]/
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      'course',
      courseId,
      'lesson',
      lessonId
    )

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${originalName}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return relative URL path (accessible via /uploads/...)
    const url = `/uploads/course/${courseId}/lesson/${lessonId}/${filename}`

    return NextResponse.json({
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
