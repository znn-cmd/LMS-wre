import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get team members for the current team lead
export async function GET() {
  try {
    // In production, get teamLeadId from session
    const teamLead = await prisma.user.findFirst({
      where: {
        role: 'TEAM_LEAD',
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    if (!teamLead) {
      return NextResponse.json({ members: [] })
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: { teamLeadId: teamLead.id },
      include: {
        member: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get assigned courses and tests for each member
    const membersWithAssignments = await Promise.all(
      teamMembers.map(async (tm) => {
        const courses = await prisma.courseAssignment.findMany({
          where: { userId: tm.memberId },
          include: {
            course: {
              select: {
                id: true,
                titleEn: true,
                titleRu: true,
              },
            },
          },
        })

        const tests = await prisma.testAssignment.findMany({
          where: { userId: tm.memberId },
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

        // Get progress statistics
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId: tm.memberId,
            status: 'COMPLETED',
          },
        })

        const totalLessons = await prisma.lessonProgress.count({
          where: { userId: tm.memberId },
        })

        const testAttempts = await prisma.testAttempt.findMany({
          where: {
            userId: tm.memberId,
            status: 'COMPLETED',
          },
          select: {
            score: true,
            timeSpent: true,
            testId: true,
          },
        })

        const avgScore =
          testAttempts.length > 0
            ? testAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
              testAttempts.length
            : 0

        const totalTimeSpent = testAttempts.reduce(
          (sum, a) => sum + (a.timeSpent || 0),
          0
        )

        return {
          id: tm.id,
          user: tm.member,
          courses: courses.map((c) => c.course),
          tests: tests.map((t) => t.test),
          statistics: {
            completedLessons,
            totalLessons,
            completionRate:
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0,
            testAttempts: testAttempts.length,
            avgScore: Math.round(avgScore),
            totalTimeSpent,
          },
        }
      })
    )

    return NextResponse.json({ members: membersWithAssignments })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

// Add member to team
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Get current team lead
    const teamLead = await prisma.user.findFirst({
      where: {
        role: 'TEAM_LEAD',
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    if (!teamLead) {
      return NextResponse.json(
        { error: 'Team lead not found' },
        { status: 401 }
      )
    }

    // Find student by email
    const student = await prisma.user.findUnique({
      where: { email, role: 'STUDENT' },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if already in team
    const existing = await prisma.teamMember.findUnique({
      where: {
        teamLeadId_memberId: {
          teamLeadId: teamLead.id,
          memberId: student.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Student already in team' },
        { status: 400 }
      )
    }

    // Add to team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamLeadId: teamLead.id,
        memberId: student.id,
      },
      include: {
        member: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json(teamMember)
  } catch (error: any) {
    console.error('Error adding team member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add team member' },
      { status: 500 }
    )
  }
}

