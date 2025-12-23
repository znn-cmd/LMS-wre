'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, CheckCircle, Lock, Play } from 'lucide-react'
import Link from 'next/link'

export default function CourseDetailPage() {
  const t = useTranslations()
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      const data = await res.json()
      setCourse(data)
    } catch (error) {
      console.error('Error fetching course:', error)
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

  if (!course) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Course not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.titleEn}</h1>
          <p className="text-muted-foreground">{course.titleRu}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {course.modules?.map((module: any) => (
              <Card key={module.id}>
                <CardHeader>
                  <CardTitle>{module.titleEn}</CardTitle>
                  <CardDescription>{module.titleRu}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {module.lessons?.map((lesson: any, index: number) => {
                      const isCompleted = lesson.progress?.status === 'COMPLETED'
                      const prevLesson = index > 0 ? module.lessons[index - 1] : null
                      const prevCompleted = prevLesson?.progress?.status === 'COMPLETED'
                      const isLocked = index > 0 && !prevCompleted
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            isCompleted ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : isLocked ? (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Play className="h-5 w-5 text-primary" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{lesson.titleEn}</p>
                              <p className="text-sm text-muted-foreground">{lesson.titleRu}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {lesson.estimatedTime}m
                            </div>
                          </div>
                          {!isLocked && (
                            <Link href={`/en/student/lessons/${lesson.id}`}>
                              <Button
                                variant={isCompleted ? 'outline' : 'default'}
                                size="sm"
                                className="ml-2"
                              >
                                {isCompleted ? 'Review' : 'Start'}
                              </Button>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                  <div className="pt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span>{course.completedLessons}/{course.totalLessons}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modules</span>
                  <span className="font-medium">{course.modules?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className="font-medium">{course.totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

