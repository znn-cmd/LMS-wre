'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BookOpen, Users, Eye } from 'lucide-react'
import Link from 'next/link'

export default function AdminCoursesPage() {
  const t = useTranslations()
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
          <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
          <p className="text-muted-foreground">Manage all courses in the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>View and manage courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{course.titleEn}</div>
                        <div className="text-sm text-muted-foreground">{course.titleRu}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.creator?.firstName} {course.creator?.lastName}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.modules?.length || 0}</TableCell>
                    <TableCell>
                      <Link href={`/en/admin/courses/${course.id}/assign`}>
                        <Button variant="ghost" size="sm">
                          <Users className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


