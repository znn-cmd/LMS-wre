'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, TrendingDown, Clock, AlertTriangle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TeacherDashboard() {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/teacher/metrics')
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
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.teacher.title')}</h1>
          <p className="text-muted-foreground">
            Content quality and student engagement analytics
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teacher.metrics.completionRate')}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.completionRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Course completion</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teacher.metrics.dropOffRate')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.dropOffRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Students dropped off</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teacher.metrics.avgLessonTime')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.avgLessonTime || '0m'}</div>
              <p className="text-xs text-muted-foreground mt-1">Average time per lesson</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teacher.metrics.difficultLessons')}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.difficultLessons || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Lessons with issues</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Drop-off by Lesson</CardTitle>
              <CardDescription>Where students stop</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.dropOffByLesson || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lesson" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="dropOff" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time vs Performance</CardTitle>
              <CardDescription>Correlation analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics?.timePerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Error Analysis</CardTitle>
            <CardDescription>Most common mistakes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.testErrors?.map((error: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{error.question}</span>
                  <span className="text-sm font-medium text-destructive">{error.errorRate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


