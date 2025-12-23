'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, CheckCircle, Play, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function StudentTestsPage() {
  const t = useTranslations()
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/student/tests')
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
          <p className="text-muted-foreground">Your assigned tests</p>
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
                  {test.bestScore !== null && (
                    <Badge variant={test.bestScore >= test.passingScore ? 'default' : 'destructive'}>
                      {test.bestScore}%
                    </Badge>
                  )}
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
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{test.timeLimit} minutes</span>
                      </div>
                    )}
                    {test.maxAttempts && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>
                          {test.attemptsCount || 0} / {test.maxAttempts} attempts
                        </span>
                      </div>
                    )}
                    {test.deadline && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>Due: {new Date(test.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/en/student/tests/${test.id}`} className="block">
                    <Button className="w-full" variant={test.bestScore >= test.passingScore ? 'outline' : 'default'}>
                      {test.bestScore >= test.passingScore ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {test.attemptsCount > 0 ? 'Retake' : 'Start Test'}
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tests assigned</h3>
              <p className="text-muted-foreground text-center">
                You don't have any tests assigned yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


