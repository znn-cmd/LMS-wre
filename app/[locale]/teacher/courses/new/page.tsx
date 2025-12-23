'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewCoursePage() {
  const t = useTranslations()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState({
    titleEn: '',
    titleRu: '',
    descriptionEn: '',
    descriptionRu: '',
    status: 'DRAFT',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/en/teacher/courses/${data.id}/edit`)
      }
    } catch (error) {
      console.error('Error creating course:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/en/teacher/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
              <p className="text-muted-foreground">Create a new course from scratch</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Course'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Enter basic course details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (English) *</Label>
                <Input
                  id="titleEn"
                  value={course.titleEn}
                  onChange={(e) =>
                    setCourse({ ...course, titleEn: e.target.value })
                  }
                  placeholder="Course Title in English"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleRu">Title (Russian) *</Label>
                <Input
                  id="titleRu"
                  value={course.titleRu}
                  onChange={(e) =>
                    setCourse({ ...course, titleRu: e.target.value })
                  }
                  placeholder="Название курса на русском"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <textarea
                id="descriptionEn"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={course.descriptionEn}
                onChange={(e) =>
                  setCourse({ ...course, descriptionEn: e.target.value })
                }
                placeholder="Course description in English..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionRu">Description (Russian)</Label>
              <textarea
                id="descriptionRu"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={course.descriptionRu}
                onChange={(e) =>
                  setCourse({ ...course, descriptionRu: e.target.value })
                }
                placeholder="Описание курса на русском..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={course.status}
                onValueChange={(value) =>
                  setCourse({ ...course, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


