import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all team leads with their members
export async function GET() {
  try {
    const teamLeads = await prisma.user.findMany({
      where: {
        role: 'TEAM_LEAD',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        teamLeads: {
          include: {
            member: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                department: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get statistics for each team member
    const teamLeadsWithStats = await Promise.all(
      teamLeads.map(async (tl) => {
        const membersWithStats = await Promise.all(
          tl.teamLeads.map(async (tm) => {
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
              },
            })

            const avgScore =
              testAttempts.length > 0
                ? testAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                  testAttempts.length
                : 0

            return {
              ...tm,
              statistics: {
                completedLessons,
                totalLessons,
                completionRate:
                  totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0,
                testAttempts: testAttempts.length,
                avgScore: Math.round(avgScore),
              },
            }
          })
        )

        return {
          ...tl,
          members: membersWithStats,
        }
      })
    )

    return NextResponse.json(teamLeadsWithStats)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

// Assign student to team lead
export async function POST(request: Request) {
  try {
    const { teamLeadId, studentId } = await request.json()

    // Check if already assigned
    const existing = await prisma.teamMember.findUnique({
      where: {
        teamLeadId_memberId: {
          teamLeadId,
          memberId: studentId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Student already assigned to this team lead' },
        { status: 400 }
      )
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        teamLeadId,
        memberId: studentId,
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
          },
        },
      },
    })

    return NextResponse.json(teamMember)
  } catch (error: any) {
    console.error('Error assigning student:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to assign student' },
      { status: 500 }
    )
  }
}

