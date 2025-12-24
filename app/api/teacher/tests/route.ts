import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  console.log('======= GET /api/teacher/tests called =======')
  console.log('Timestamp:', new Date().toISOString())
  
  try {
    console.log('Fetching teachers from database...')
    
    // In production, get userId from session
    // First, get all teachers to see what we have
    const allTeachers = await prisma.user.findMany({
      where: { 
        role: 'TEACHER',
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    
    console.log(`Found ${allTeachers.length} active teachers:`, allTeachers.map(t => ({ id: t.id, email: t.email, createdAt: t.createdAt })))
    
    if (allTeachers.length === 0) {
      console.log('No active teacher found in database')
      return NextResponse.json([])
    }
    
    // Use the first teacher (same logic as in POST /api/tests)
    const teacher = allTeachers[0]
    
    console.log(`Fetching tests for teacher: ${teacher.id} (${teacher.email})`)

    // Get tests without course relation to avoid errors if courseId column doesn't exist yet
    const tests = await prisma.test.findMany({
      where: { creatorId: teacher.id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    console.log(`Found ${tests.length} tests for teacher ${teacher.id}`)
    if (tests.length > 0) {
      console.log('Test IDs:', tests.map(t => ({ id: t.id, titleEn: t.titleEn, titleRu: t.titleRu, creatorId: t.creatorId })))
    } else {
      // Check if there are any tests at all
      const allTests = await prisma.test.findMany({
        select: { id: true, titleEn: true, creatorId: true },
        take: 10,
      })
      console.log(`Total tests in database: ${allTests.length}`)
      if (allTests.length > 0) {
        console.log('All test creatorIds:', allTests.map(t => ({ id: t.id, titleEn: t.titleEn, creatorId: t.creatorId })))
        console.log(`Looking for teacher ID: ${teacher.id}`)
        const matchingTests = allTests.filter(t => t.creatorId === teacher.id)
        console.log(`Tests with matching creatorId (${teacher.id}):`, matchingTests.length, matchingTests)
        
        // Check if there are tests with different creatorIds
        const differentCreatorIds = [...new Set(allTests.map(t => t.creatorId))].filter(id => id !== teacher.id)
        if (differentCreatorIds.length > 0) {
          console.log(`WARNING: Found tests with different creatorIds:`, differentCreatorIds)
          console.log(`These tests belong to other teachers and won't be shown.`)
        }
      }
    }

    // Get attempts count and course info for each test
    const testsWithStats = await Promise.all(
      tests.map(async (test) => {
        try {
          const attemptsCount = await prisma.testAttempt.count({
            where: { testId: test.id },
          })

          // Get course info if courseId exists (handle case where column might not exist in DB)
          let course = null
          let courseId = null
          try {
            // Try to access courseId - it might not exist if migration hasn't run
            courseId = (test as any).courseId || null
            if (courseId) {
              course = await prisma.course.findUnique({
                where: { id: courseId },
                select: {
                  id: true,
                  titleEn: true,
                  titleRu: true,
                },
              })
            }
          } catch (courseErr) {
            // courseId field might not exist in DB yet - ignore
            console.log('CourseId field may not exist yet:', courseErr)
          }

          return {
            id: test.id,
            titleEn: test.titleEn,
            titleRu: test.titleRu,
            descriptionEn: test.descriptionEn || null,
            descriptionRu: test.descriptionRu || null,
            passingScore: test.passingScore,
            timeLimit: test.timeLimit,
            maxAttempts: test.maxAttempts,
            courseId,
            course,
            questionsCount: test.questions?.length || 0,
            totalAttempts: attemptsCount,
          }
        } catch (err) {
          console.error(`Error processing test ${test.id}:`, err)
          // Return basic test info even if attempts count fails
          return {
            id: test.id,
            titleEn: test.titleEn,
            titleRu: test.titleRu,
            descriptionEn: test.descriptionEn || null,
            descriptionRu: test.descriptionRu || null,
            passingScore: test.passingScore,
            timeLimit: test.timeLimit,
            maxAttempts: test.maxAttempts,
            courseId: null,
            course: null,
            questionsCount: test.questions?.length || 0,
            totalAttempts: 0,
          }
        }
      })
    )

    console.log(`Returning ${testsWithStats.length} tests to client`)
    console.log('======= END GET /api/teacher/tests =======')
    
    // Add headers to prevent caching
    return NextResponse.json(testsWithStats, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    console.error('ERROR in GET /api/teacher/tests:', error)
    console.error('Error stack:', error.stack)
    // Return empty array instead of error object to prevent .map() errors
    return NextResponse.json([], { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
}


