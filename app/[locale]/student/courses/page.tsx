'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, Calendar, Play, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function StudentCoursesPage() {
  const t = useTranslations()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/student/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded" />
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
          <h1 className="text-3xl font-bold tracking-tight">{t('common.courses')}</h1>
          <p className="text-muted-foreground">Your assigned courses</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{course.titleEn}</CardTitle>
                    <CardDescription className="mt-1">{course.titleRu}</CardDescription>
                  </div>
                  <Badge variant={course.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {course.status === 'COMPLETED' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.completedLessons}/{course.totalLessons} lessons
                    </div>
                    {course.deadline && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(course.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <Link href={`/en/student/courses/${course.id}`}>
                    <Button className="w-full" variant={course.status === 'COMPLETED' ? 'outline' : 'default'}>
                      {course.status === 'COMPLETED' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses assigned</h3>
              <p className="text-muted-foreground text-center">
                You don't have any courses assigned yet. Contact your administrator.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}


