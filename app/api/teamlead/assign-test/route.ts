import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId, testId, deadline } = await request.json()

    const assignment = await prisma.testAssignment.create({
      data: {
        testId,
        userId,
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        test: {
          select: {
            id: true,
            titleEn: true,
            titleRu: true,
          },
        },
      },
    })

    return NextResponse.json(assignment)
  } catch (error: any) {
    console.error('Error assigning test:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to assign test' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    await prisma.testAssignment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unassigning test:', error)
    return NextResponse.json(
      { error: 'Failed to unassign test' },
      { status: 500 }
    )
  }
}

