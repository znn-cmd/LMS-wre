'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

export default function TestResultPage() {
  const t = useTranslations()
  const params = useParams()
  const searchParams = useSearchParams()
  const testId = params.id as string
  const attemptId = searchParams.get('attemptId')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (attemptId) {
      fetchResult()
    }
  }, [attemptId])

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}/result?attemptId=${attemptId}`)
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error('Error fetching result:', error)
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

  if (!result) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Result not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const passed = result.score >= result.passingScore

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/en/student/tests">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
              <p className="text-muted-foreground">{result.titleEn}</p>
            </div>
          </div>
          <Badge variant={passed ? 'default' : 'destructive'} className="text-lg px-4 py-2">
            {passed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Passed
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Failed
              </>
            )}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{result.score}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.earnedPoints} / {result.totalPoints} points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Passing Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{result.passingScore}%</div>
              <Progress value={result.score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Your answers and correct solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.questions?.map((q: any, index: number) => (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        Question {index + 1} ({q.points} {q.points === 1 ? 'point' : 'points'})
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{q.questionEn}</p>
                    </div>
                    {q.isCorrect ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )}
                  </div>
                  {q.explanationEn && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Explanation:</strong> {q.explanationEn}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Link href="/en/student/tests">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
          </Link>
          {result.allowRetake && (
            <Link href={`/en/student/tests/${testId}`}>
              <Button>Retake Test</Button>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


