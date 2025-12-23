import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatDuration } from '@/lib/utils'

export async function GET() {
  try {
    // Mock team data - in production, filter by teamLead's team
    const teamProgress = [
      { name: 'John Doe', progress: 85 },
      { name: 'Jane Smith', progress: 72 },
      { name: 'Bob Johnson', progress: 90 },
      { name: 'Alice Brown', progress: 65 },
    ]

    const avgProgress = teamProgress.reduce((sum, m) => sum + m.progress, 0) / teamProgress.length
    const behind = teamProgress.filter(m => m.progress < 70).length

    const members = teamProgress.map(m => ({
      name: m.name,
      progress: m.progress,
      status: m.progress >= 70 ? 'on track' : 'behind',
    }))

    const alerts = [
      { member: 'Alice Brown', issue: 'Behind schedule by 2 weeks', type: 'behind' },
      { member: 'Jane Smith', issue: 'Completed too quickly (suspicious)', type: 'too fast' },
    ]

    return NextResponse.json({
      trained: Math.round(avgProgress),
      behind,
      avgTeamTime: '2h 15m',
      avgTeamScore: 78,
      teamProgress,
      members,
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


