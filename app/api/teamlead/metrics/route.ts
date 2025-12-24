import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDuration } from '@/lib/utils'

export async function GET() {
  try {
    // Get current team lead
    const teamLead = await prisma.user.findFirst({
      where: {
        role: 'TEAM_LEAD',
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    if (!teamLead) {
      return NextResponse.json({
        trained: 0,
        behind: 0,
        avgTeamTime: '0m',
        avgTeamScore: 0,
        teamProgress: [],
        members: [],
        alerts: [],
      })
    }

    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamLeadId: teamLead.id },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Calculate statistics for each member
    const membersWithStats = await Promise.all(
      teamMembers.map(async (tm) => {
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId: tm.memberId,
            status: 'COMPLETED',
          },
        })

        const totalLessons = await prisma.lessonProgress.count({
          where: { userId: tm.memberId },
        })

        const progress = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0

        const testAttempts = await prisma.testAttempt.findMany({
          where: {
            userId: tm.memberId,
            status: 'COMPLETED',
          },
          select: {
            score: true,
            timeSpent: true,
          },
        })

        const avgScore =
          testAttempts.length > 0
            ? testAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / testAttempts.length
            : 0

        const totalTime = testAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)

        return {
          name: `${tm.member.firstName} ${tm.member.lastName}`,
          progress,
          avgScore: Math.round(avgScore),
          totalTime,
          status: progress >= 70 ? 'on track' : 'behind',
        }
      })
    )

    const avgProgress =
      membersWithStats.length > 0
        ? membersWithStats.reduce((sum, m) => sum + m.progress, 0) / membersWithStats.length
        : 0

    const behind = membersWithStats.filter((m) => m.progress < 70).length

    const avgScore =
      membersWithStats.length > 0
        ? membersWithStats.reduce((sum, m) => sum + m.avgScore, 0) / membersWithStats.length
        : 0

    const totalTime = membersWithStats.reduce((sum, m) => sum + m.totalTime, 0)
    const avgTeamTime = formatDuration(
      membersWithStats.length > 0 ? Math.floor(totalTime / membersWithStats.length) : 0
    )

    // Create alerts for members who are behind or have unusual completion times
    const alerts = membersWithStats
      .filter((m) => m.progress < 70)
      .map((m) => ({
        member: m.name,
        issue: `Progress: ${m.progress}% - Below target`,
        type: 'behind',
      }))

    return NextResponse.json({
      trained: Math.round(avgProgress),
      behind,
      avgTeamTime,
      avgTeamScore: Math.round(avgScore),
      teamProgress: membersWithStats.map((m) => ({
        name: m.name,
        progress: m.progress,
      })),
      members: membersWithStats,
      alerts,
    })
  } catch (error) {
    console.error('Error fetching team lead metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}


