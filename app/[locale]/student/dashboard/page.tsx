'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Calendar, Award, Play } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'

export default function StudentDashboard() {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/student/dashboard')
      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
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
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.student.title')}</h1>
          <p className="text-muted-foreground">
            Your learning progress and upcoming tasks
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.student.inProgress')}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.inProgress || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active courses</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.todayTime || '0m'}</div>
              <p className="text-xs text-muted-foreground mt-1">Time spent</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.weekTime || '0m'}</div>
              <p className="text-xs text-muted-foreground mt-1">Total time</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.student.certificates')}</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.certificates || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Earned</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.student.inProgress')}</CardTitle>
              <CardDescription>Your active courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.courses?.map((course: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{course.name}</h4>
                      <Badge>{course.progress}%</Badge>
                    </div>
                    <Progress value={course.progress} />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.completed}/{course.total} lessons</span>
                      <Link href={`/en/student/courses/${course.id}`}>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Continue
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.student.deadlines')}</CardTitle>
              <CardDescription>Upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.deadlines?.map((deadline: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{deadline.course}</p>
                      <p className="text-sm text-muted-foreground">{deadline.task}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{deadline.date}</p>
                      <Badge variant={deadline.urgent ? 'destructive' : 'default'}>
                        {deadline.daysLeft} days
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Learning Time</CardTitle>
            <CardDescription>Your activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.timeChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

