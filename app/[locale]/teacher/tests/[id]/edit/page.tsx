'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string
  const [test, setTest] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (testId) {
      fetchTest()
      fetchCourses()
    }
  }, [testId])
  
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}`)
      const data = await res.json()
      setTest(data)
    } catch (error) {
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
      })

      if (res.ok) {
        alert('Test saved successfully!')
        fetchTest()
      }
    } catch (error) {
      console.error('Error saving test:', error)
      alert('Error saving test')
    } finally {
      setSaving(false)
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

  if (!test) {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/en/teacher/tests">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Test</h1>
              <p className="text-muted-foreground">Edit test settings and questions</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="questions">Questions ({test.questions?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
                <CardDescription>Basic test details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">Title (English)</Label>
                    <Input
                      id="titleEn"
                      value={test.titleEn || ''}
                      onChange={(e) => setTest({ ...test, titleEn: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleRu">Title (Russian)</Label>
                    <Input
                      id="titleRu"
                      value={test.titleRu || ''}
                      onChange={(e) => setTest({ ...test, titleRu: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={test.passingScore || 70}
                      onChange={(e) => setTest({ ...test, passingScore: parseInt(e.target.value) || 70 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={test.timeLimit || ''}
                      onChange={(e) => setTest({ ...test, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course</Label>
                    <Select
                      value={test.courseId || undefined}
                      onValueChange={(value) => setTest({ ...test, courseId: value === 'none' ? null : value })}
                    >
                      <SelectTrigger id="courseId">
                        <SelectValue placeholder="Select course (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No course</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.titleEn} / {course.titleRu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Link this test to a course. Students will be redirected to this test after completing the course.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>Manage test questions</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {test.questions?.map((question: any, index: number) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Question {index + 1} ({question.type})
                          </CardTitle>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-medium">{question.questionEn}</p>
                          {question.questionRu && (
                            <p className="text-sm text-muted-foreground">{question.questionRu}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Points: {question.points}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!test.questions || test.questions.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No questions yet. Click "Add Question" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}


