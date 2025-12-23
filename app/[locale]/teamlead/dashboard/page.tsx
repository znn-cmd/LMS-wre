'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Award, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TeamLeadDashboard() {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/teamlead/metrics')
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
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.teamLead.title')}</h1>
          <p className="text-muted-foreground">
            Team learning progress and management
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teamLead.metrics.trained')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.trained || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Team completion rate</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teamLead.metrics.behind')}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.behind || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Members behind schedule</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teamLead.metrics.avgTeamTime')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.avgTeamTime || '0m'}</div>
              <p className="text-xs text-muted-foreground mt-1">Average learning time</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.teamLead.metrics.avgTeamScore')}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.avgTeamScore || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average test score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Progress</CardTitle>
              <CardDescription>Course completion by member</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.teamProgress || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Individual progress overview</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics?.members?.map((member: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.progress}%</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'on track' ? 'default' : 'destructive'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issues & Alerts</CardTitle>
            <CardDescription>Team members needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.alerts?.map((alert: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{alert.member}</p>
                    <p className="text-sm text-muted-foreground">{alert.issue}</p>
                  </div>
                  <Badge variant="destructive">{alert.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


