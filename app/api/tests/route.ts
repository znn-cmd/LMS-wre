import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In production, get userId from session
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    })

    if (!teacher) {
      console.error('No teacher found when creating test')
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 401 }
      )
    }

    console.log(`Creating test for teacher: ${teacher.id} (${teacher.email})`)

    const test = await prisma.test.create({
      data: {
        titleEn: data.titleEn,
        titleRu: data.titleRu,
        descriptionEn: data.descriptionEn || null,
        descriptionRu: data.descriptionRu || null,
        passingScore: data.passingScore || 70,
        timeLimit: data.timeLimit || null,
        maxAttempts: data.maxAttempts || null,
        allowRetake: data.allowRetake !== false,
        randomizeQuestions: false,
        shuffleAnswers: false,
        courseId: data.courseId || null,
        creatorId: teacher.id,
      },
    })

    console.log(`Test created successfully:`, { 
      id: test.id, 
      titleEn: test.titleEn, 
      creatorId: test.creatorId,
      teacherId: teacher.id 
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    )
  }
}


