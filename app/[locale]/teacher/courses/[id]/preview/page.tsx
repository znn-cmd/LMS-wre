'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye } from 'lucide-react'
import Link from 'next/link'

export default function PreviewCoursePage() {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/en/teacher/courses/${courseId}/edit`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Preview Course
              </h1>
              <p className="text-muted-foreground">View course as a student would see it</p>
            </div>
          </div>
          <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
            {course.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{course.titleEn}</CardTitle>
            <CardDescription>{course.titleRu}</CardDescription>
          </CardHeader>
          <CardContent>
            {course.descriptionEn && (
              <p className="text-muted-foreground mb-4">{course.descriptionEn}</p>
            )}
            {course.descriptionRu && (
              <p className="text-muted-foreground">{course.descriptionRu}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {course.modules?.map((module: any) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle>{module.titleEn}</CardTitle>
                <CardDescription>{module.titleRu}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {module.lessons?.map((lesson: any) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{lesson.titleEn}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.titleRu} • Estimated: {lesson.estimatedTime} minutes
                        </p>
                      </div>
                      <Link href={`/en/teacher/lessons/${lesson.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit Lesson
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href={`/en/teacher/courses/${courseId}/edit`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Edit
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

