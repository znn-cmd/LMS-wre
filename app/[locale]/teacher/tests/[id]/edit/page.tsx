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
import { ArrowLeft, Save, Plus, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { QuestionEditor } from '@/components/question-editor'
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'

export default function EditTestPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()
  const testId = params.id as string
  const [test, setTest] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questionEditorOpen, setQuestionEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)

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
      // Prepare data for saving - ensure courseId is null if "none"
      const dataToSave = {
        ...test,
        courseId: test.courseId === 'none' || !test.courseId ? null : test.courseId,
      }

      const res = await fetch(`/api/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save test')
      }

      // Show success toast
      toast({
        variant: 'success',
        title: t('common.saved'),
        duration: 2000,
      })

      await fetchTest()
    } catch (error) {
      console.error('Error saving test:', error)
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveQuestion = async (questionData: any) => {
    try {
      if (editingQuestion) {
        // Update existing question
        const res = await fetch(`/api/questions/${editingQuestion.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData),
        })
        if (!res.ok) throw new Error('Failed to update question')
      } else {
        // Create new question
        const res = await fetch(`/api/tests/${testId}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData),
        })
        if (!res.ok) throw new Error('Failed to create question')
      }
      fetchTest()
      setQuestionEditorOpen(false)
      setEditingQuestion(null)
    } catch (error) {
      console.error('Error saving question:', error)
      throw error
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchTest()
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Error deleting question')
    }
  }

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question)
    setQuestionEditorOpen(true)
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setQuestionEditorOpen(true)
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
                      value={test.courseId || 'none'}
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
                  <Button onClick={handleAddQuestion}>
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
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {question.mediaUrl && (
                            <div className="rounded border overflow-hidden">
                              {question.mediaType === 'image' ? (
                                <img src={question.mediaUrl} alt="Question media" className="w-full max-h-48 object-contain" />
                              ) : question.mediaType === 'video' ? (
                                <video src={question.mediaUrl} className="w-full max-h-48" controls />
                              ) : null}
                            </div>
                          )}
                          <div className="space-y-2">
                            <p className="font-medium">{question.questionEn}</p>
                            {question.questionRu && (
                              <p className="text-sm text-muted-foreground">{question.questionRu}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Type: {question.type}</span>
                              <span>Points: {question.points}</span>
                            </div>
                            {question.explanationEn && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <p className="font-medium mb-1">Explanation:</p>
                                <p>{question.explanationEn}</p>
                                {question.explanationRu && <p className="mt-1">{question.explanationRu}</p>}
                              </div>
                            )}
                          </div>
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

        <QuestionEditor
          open={questionEditorOpen}
          onClose={() => {
            setQuestionEditorOpen(false)
            setEditingQuestion(null)
          }}
          onSave={handleSaveQuestion}
          question={editingQuestion}
          testId={testId}
        />
      </div>
    </DashboardLayout>
  )
}


