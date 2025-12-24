'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Eye, Archive } from 'lucide-react'
import Link from 'next/link'

export default function TeacherCoursesPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('common.courses')}</h1>
            <p className="text-muted-foreground">Create and manage your courses</p>
          </div>
          <Link href={`/${locale}/teacher/courses/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('common.create')} Course
            </Button>
          </Link>
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
                  <Badge variant={
                    course.status === 'PUBLISHED' ? 'default' :
                    course.status === 'DRAFT' ? 'secondary' : 'outline'
                  }>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{course.modules?.length || 0} modules</p>
                    <p>
                      {course.linkedTest 
                        ? (locale === 'ru' ? course.linkedTest.titleRu : course.linkedTest.titleEn)
                        : (locale === 'ru' ? 'Нет теста' : 'No test')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/${locale}/teacher/courses/${course.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/${locale}/teacher/courses/${course.id}/preview`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}


