'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Edit, Eye, Users } from 'lucide-react'
import Link from 'next/link'

export default function TeacherTestsPage() {
  const t = useTranslations()
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/teacher/tests')
      const data = await res.json()
      setTests(data)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
            <p className="text-muted-foreground">Manage your tests</p>
          </div>
          <Link href="/en/teacher/tests/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{test.titleEn}</CardTitle>
                    <CardDescription className="mt-1">{test.titleRu}</CardDescription>
                  </div>
                  <Badge variant="secondary">{test.questionsCount} questions</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Passing Score</span>
                      <span className="font-medium">{test.passingScore}%</span>
                    </div>
                    {test.timeLimit && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time Limit</span>
                        <span className="font-medium">{test.timeLimit} min</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Attempts</span>
                      <span className="font-medium">{test.totalAttempts}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/en/teacher/tests/${test.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/en/teacher/tests/${test.id}/results`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Users className="h-3 w-3 mr-1" />
                        Results
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tests yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first test to get started.
              </p>
              <Link href="/en/teacher/tests/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


