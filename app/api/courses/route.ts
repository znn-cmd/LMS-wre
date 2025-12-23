import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In production, get userId from session
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 401 }
      )
    }

    const course = await prisma.course.create({
      data: {
        titleEn: data.titleEn,
        titleRu: data.titleRu,
        descriptionEn: data.descriptionEn,
        descriptionRu: data.descriptionRu,
        status: data.status || 'DRAFT',
        creatorId: teacher.id,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
