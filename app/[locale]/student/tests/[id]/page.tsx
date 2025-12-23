'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react'
import Link from 'next/link'

export default function TakeTestPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string
  const [test, setTest] = useState<any>(null)
  const [attempt, setAttempt] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (testId) {
      startTest()
    }
  }, [testId])

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !completed) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, completed])

  const startTest = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
      })
      const data = await res.json()
      setTest(data.test)
      setAttempt(data.attempt)
      setAnswers(data.answers || {})
      
      if (data.test.timeLimit && data.attempt.status === 'IN_PROGRESS') {
        const elapsed = Math.floor((Date.now() - new Date(data.attempt.startTime).getTime()) / 1000)
        setTimeLeft(Math.max(0, data.test.timeLimit * 60 - elapsed))
      }
    } catch (error) {
      console.error('Error starting test:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = async () => {
    if (completed) return
    
    setSubmitting(true)
    setCompleted(true)
    
    try {
      const res = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        router.push(`/en/student/tests/${testId}/result?attemptId=${attempt.id}`)
      }
    } catch (error) {
      console.error('Error submitting test:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

  if (!test || !attempt) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Test not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const progress = test.questions.length > 0
    ? Math.round((Object.keys(answers).length / test.questions.length) * 100)
    : 0

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
              <h1 className="text-3xl font-bold tracking-tight">{test.titleEn}</h1>
              <p className="text-muted-foreground">{test.titleRu}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <Badge variant={timeLeft < 60 ? 'destructive' : 'default'}>
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
            )}
            <Button onClick={handleSubmit} disabled={submitting || completed}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{Object.keys(answers).length} / {test.questions.length} answered</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {test.questions.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1} ({question.points} {question.points === 1 ? 'point' : 'points'})
                </CardTitle>
                <CardDescription>
                  <div className="space-y-2 mt-2">
                    <p className="font-medium">{question.questionEn}</p>
                    {question.questionRu && (
                      <p className="text-sm text-muted-foreground">{question.questionRu}</p>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {question.type === 'SINGLE_CHOICE' && (
                  <RadioGroup
                    value={answers[question.id]?.answer || ''}
                    onValueChange={(value) =>
                      handleAnswerChange(question.id, { answer: value })
                    }
                  >
                    {question.options.choices.map((choice: any) => (
                      <div key={choice.id} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem value={choice.id} id={`${question.id}-${choice.id}`} />
                        <Label htmlFor={`${question.id}-${choice.id}`} className="cursor-pointer flex-1">
                          {choice.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    {question.options.choices.map((choice: any) => (
                      <div key={choice.id} className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id={`${question.id}-${choice.id}`}
                          checked={(answers[question.id]?.answers || []).includes(choice.id)}
                          onCheckedChange={(checked) => {
                            const current = answers[question.id]?.answers || []
                            const updated = checked
                              ? [...current, choice.id]
                              : current.filter((id: string) => id !== choice.id)
                            handleAnswerChange(question.id, { answers: updated })
                          }}
                        />
                        <Label htmlFor={`${question.id}-${choice.id}`} className="cursor-pointer flex-1">
                          {choice.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'TRUE_FALSE' && (
                  <RadioGroup
                    value={answers[question.id]?.answer?.toString() || ''}
                    onValueChange={(value) =>
                      handleAnswerChange(question.id, { answer: value === 'true' })
                    }
                  >
                    <div className="flex items-center space-x-2 py-2">
                      <RadioGroupItem value="true" id={`${question.id}-true`} />
                      <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <RadioGroupItem value="false" id={`${question.id}-false`} />
                      <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {question.type === 'SHORT_TEXT' && (
                  <Input
                    value={answers[question.id]?.answer || ''}
                    onChange={(e) =>
                      handleAnswerChange(question.id, { answer: e.target.value })
                    }
                    placeholder="Enter your answer..."
                  />
                )}

                {question.type === 'ORDERING' && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag items to reorder (or use arrows)
                    </p>
                    {question.options.items.map((item: any, itemIndex: number) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                        <span className="text-sm font-medium">{itemIndex + 1}.</span>
                        <span className="flex-1">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'MATCHING' && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Match items from left column to right column
                    </p>
                    {question.options.pairs.map((pair: any, pairIndex: number) => (
                      <div key={pairIndex} className="flex items-center gap-2 p-2 border rounded">
                        <span className="flex-1">{pair.left}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="flex-1">{pair.right}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4 border-t">
          <Button onClick={handleSubmit} disabled={submitting || completed} size="lg">
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}


