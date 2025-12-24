'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  UserCheck,
  UserX,
  BookOpen,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AdminAnalyticsPage() {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics')
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const metricCards = [
    {
      title: t('dashboard.admin.metrics.totalUsers'),
      value: metrics?.totalUsers || 0,
      icon: Users,
      description: 'All registered users',
    },
    {
      title: t('dashboard.admin.metrics.activeUsers'),
      value: metrics?.activeUsers || 0,
      icon: UserCheck,
      description: 'Currently active',
    },
    {
      title: t('dashboard.admin.metrics.blockedUsers'),
      value: metrics?.blockedUsers || 0,
      icon: UserX,
      description: 'Inactive accounts',
    },
    {
      title: t('dashboard.admin.metrics.inTraining'),
      value: `${metrics?.inTrainingPercent || 0}%`,
      icon: TrendingUp,
      description: 'Users in training',
    },
    {
      title: t('dashboard.admin.metrics.completedCourses'),
      value: `${metrics?.completedCoursesPercent || 0}%`,
      icon: BookOpen,
      description: 'Course completion rate',
    },
    {
      title: t('dashboard.admin.metrics.avgCourseTime'),
      value: metrics?.avgCourseTime || '0m',
      icon: Clock,
      description: 'Average time per course',
    },
    {
      title: t('dashboard.admin.metrics.avgLessonTime'),
      value: metrics?.avgLessonTime || '0m',
      icon: Clock,
      description: 'Average time per lesson',
    },
    {
      title: t('dashboard.admin.metrics.testFailureRate'),
      value: `${metrics?.testFailureRate || 0}%`,
      icon: AlertCircle,
      description: 'Test failure percentage',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed system analytics and user activity insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Over Time</CardTitle>
              <CardDescription>Daily active users</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics?.userActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="active" stroke="hsl(var(--primary))" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Completion Rates</CardTitle>
              <CardDescription>By course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.courseCompletion || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completion" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Time Analytics</CardTitle>
            <CardDescription>Fact vs Estimated Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Min Time</p>
                  <p className="text-2xl font-bold">{metrics?.timeStats?.min || '0m'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold">{metrics?.timeStats?.avg || '0m'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Time</p>
                  <p className="text-2xl font-bold">{metrics?.timeStats?.max || '0m'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

