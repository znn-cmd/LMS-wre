import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Ensure courseId is null if not provided or is "none"
    const courseId = data.courseId && data.courseId !== 'none' ? data.courseId : null

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log(`[DELETE] Starting deletion of test ${id}...`)

    // Get test with questions to check for media files
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        questions: {
          select: { mediaUrl: true },
        },
      },
    })

    if (!test) {
      console.log(`[DELETE] Test ${id} not found`)
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    console.log(`[DELETE] Found test ${id}, deleting files...`)

    // Delete media files from disk
    try {
      const testUploadDir = join(process.cwd(), 'public', 'uploads', 'tests', id)
      
      if (existsSync(testUploadDir)) {
        await fs.rm(testUploadDir, { recursive: true, force: true })
        console.log(`[DELETE] Deleted upload directory: ${testUploadDir}`)
      } else {
        console.log(`[DELETE] No upload directory found at: ${testUploadDir}`)
      }
    } catch (fileError: any) {
      console.error('[DELETE] Error deleting files:', fileError.message)
      // Continue with database deletion even if file deletion fails
    }

    console.log(`[DELETE] Deleting test ${id} from database...`)

    // Delete test (cascade will delete questions, attempts, etc.)
    await prisma.test.delete({
      where: { id },
    })

    console.log(`[DELETE] Test ${id} deleted successfully`)

    return NextResponse.json(
      { success: true, message: 'Test deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[DELETE] Error deleting test:', error)
    console.error('[DELETE] Error stack:', error.stack)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete test' },
      { status: 500 }
    )
  }
}
