'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Eye, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function EditCoursePage() {
  const t = useTranslations()
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const fetchCourse = async (preserveLocalChanges = false) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      const data = await res.json()
      
      if (preserveLocalChanges && course) {
        // Merge local changes with fetched data
        const mergedModules = data.modules?.map((fetchedModule: any) => {
          const localModule = course.modules?.find((m: any) => m.id === fetchedModule.id)
          if (localModule) {
            // Preserve local changes (title, description) but update other fields
            return {
              ...fetchedModule,
              titleEn: localModule.titleEn,
              titleRu: localModule.titleRu,
              descriptionEn: localModule.descriptionEn,
              descriptionRu: localModule.descriptionRu,
            }
          }
          return fetchedModule
        }) || []
        
        setCourse({
          ...data,
          modules: mergedModules,
          // Preserve other local changes
          titleEn: course.titleEn || data.titleEn,
          titleRu: course.titleRu || data.titleRu,
          descriptionEn: course.descriptionEn || data.descriptionEn,
          descriptionRu: course.descriptionRu || data.descriptionRu,
          status: course.status || data.status,
        })
      } else {
        setCourse(data)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Save all module changes before operations that reload data
  const saveAllModules = async () => {
    if (!course?.modules || course.modules.length === 0) return
    
    try {
      await Promise.all(
        course.modules.map((module: any) =>
          fetch(`/api/modules/${module.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              titleEn: module.titleEn,
              titleRu: module.titleRu,
              descriptionEn: module.descriptionEn || null,
              descriptionRu: module.descriptionRu || null,
              order: module.order,
            }),
          })
        )
      )
    } catch (error) {
      console.error('Error saving modules:', error)
    }
  }
 
  const handleSave = async () => {
    setSaving(true)
    try {
      // Save course basic info
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleEn: course.titleEn,
          titleRu: course.titleRu,
          descriptionEn: course.descriptionEn,
          descriptionRu: course.descriptionRu,
          status: course.status,
        }),
      })

      if (res.ok) {
        // Save modules
        if (course.modules && course.modules.length > 0) {
          await Promise.all(
            course.modules.map((module: any) =>
              fetch(`/api/modules/${module.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  titleEn: module.titleEn,
                  titleRu: module.titleRu,
                  descriptionEn: module.descriptionEn || null,
                  descriptionRu: module.descriptionRu || null,
                  order: module.order,
                }),
              })
            )
          )
        }
        toast({
          variant: 'success',
          title: t('common.saved'),
          duration: 2000,
        })
        router.push('/en/teacher/courses')
      } else {
        throw new Error('Failed to save course')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
      })
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
            <p className="text-muted-foreground">Edit course content and structure</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/en/teacher/courses/${courseId}/preview`}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="modules">Modules & Lessons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic course details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">Title (English)</Label>
                    <Input
                      id="titleEn"
                      value={course.titleEn || ''}
                      onChange={(e) =>
                        setCourse({ ...course, titleEn: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleRu">Title (Russian)</Label>
                    <Input
                      id="titleRu"
                      value={course.titleRu || ''}
                      onChange={(e) =>
                        setCourse({ ...course, titleRu: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">Description (English)</Label>
                  <textarea
                    id="descriptionEn"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={course.descriptionEn || ''}
                    onChange={(e) =>
                      setCourse({ ...course, descriptionEn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionRu">Description (Russian)</Label>
                  <textarea
                    id="descriptionRu"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={course.descriptionRu || ''}
                    onChange={(e) =>
                      setCourse({ ...course, descriptionRu: e.target.value })
                    }
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
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Modules & Lessons</CardTitle>
                    <CardDescription>Manage course structure</CardDescription>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        // Save all current module changes first
                        await saveAllModules()
                        
                        const newModule = {
                          id: `temp-${Date.now()}`, // Temporary ID
                          titleEn: 'New Module',
                          titleRu: 'Новый модуль',
                          descriptionEn: '',
                          descriptionRu: '',
                          order: (course.modules?.length || 0) + 1,
                          lessons: [],
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        }
                        
                        // Optimistically add to UI
                        setCourse({
                          ...course,
                          modules: [...(course.modules || []), newModule],
                        })
                        
                        const res = await fetch(`/api/courses/${courseId}/modules`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            titleEn: newModule.titleEn,
                            titleRu: newModule.titleRu,
                            descriptionEn: newModule.descriptionEn,
                            descriptionRu: newModule.descriptionRu,
                            order: newModule.order,
                          }),
                        })
                        
                        if (res.ok) {
                          const createdModule = await res.json()
                          // Replace temp module with real one
                          setCourse({
                            ...course,
                            modules: course.modules?.map((m: any) =>
                              m.id === newModule.id ? createdModule : m
                            ) || [createdModule],
                          })
                        } else {
                          // Revert on error
                          setCourse({
                            ...course,
                            modules: course.modules?.filter((m: any) => m.id !== newModule.id) || [],
                          })
                        }
                      } catch (error) {
                        console.error('Error adding module:', error)
                        // Revert on error
                        fetchCourse()
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.modules?.map((module: any, moduleIndex: number) => (
                    <Card key={module.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={module.titleEn}
                              onChange={(e) => {
                                const newModules = [...(course.modules || [])]
                                newModules[moduleIndex] = {
                                  ...module,
                                  titleEn: e.target.value,
                                }
                                setCourse({ ...course, modules: newModules })
                              }}
                              placeholder="Module Title (English)"
                            />
                            <Input
                              value={module.titleRu}
                              onChange={(e) => {
                                const newModules = [...(course.modules || [])]
                                newModules[moduleIndex] = {
                                  ...module,
                                  titleRu: e.target.value,
                                }
                                setCourse({ ...course, modules: newModules })
                              }}
                              placeholder="Module Title (Russian)"
                            />
                            <div className="space-y-2">
                              <Label htmlFor={`descriptionEn-${module.id}`} className="text-sm text-muted-foreground">
                                Description (English)
                              </Label>
                              <textarea
                                id={`descriptionEn-${module.id}`}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={module.descriptionEn || ''}
                                onChange={(e) => {
                                  const newModules = [...(course.modules || [])]
                                  newModules[moduleIndex] = {
                                    ...module,
                                    descriptionEn: e.target.value,
                                  }
                                  setCourse({ ...course, modules: newModules })
                                }}
                                placeholder="Module description in English..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`descriptionRu-${module.id}`} className="text-sm text-muted-foreground">
                                Description (Russian)
                              </Label>
                              <textarea
                                id={`descriptionRu-${module.id}`}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={module.descriptionRu || ''}
                                onChange={(e) => {
                                  const newModules = [...(course.modules || [])]
                                  newModules[moduleIndex] = {
                                    ...module,
                                    descriptionRu: e.target.value,
                                  }
                                  setCourse({ ...course, modules: newModules })
                                }}
                                placeholder="Описание модуля на русском..."
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                if (moduleIndex > 0) {
                                  const newModules = [...(course.modules || [])]
                                  const temp = newModules[moduleIndex]
                                  newModules[moduleIndex] = newModules[moduleIndex - 1]
                                  newModules[moduleIndex - 1] = temp
                                  newModules[moduleIndex].order = moduleIndex + 1
                                  newModules[moduleIndex - 1].order = moduleIndex
                                  setCourse({ ...course, modules: newModules })
                                  // Save modules order and all changes
                                  try {
                                    await Promise.all(
                                      newModules.map((module: any) =>
                                        fetch(`/api/modules/${module.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            titleEn: module.titleEn,
                                            titleRu: module.titleRu,
                                            descriptionEn: module.descriptionEn || null,
                                            descriptionRu: module.descriptionRu || null,
                                            order: module.order,
                                          }),
                                        })
                                      )
                                    )
                                  } catch (error) {
                                    console.error('Error saving modules:', error)
                                    // Revert on error
                                    fetchCourse()
                                  }
                                }
                              }}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                if (moduleIndex < (course.modules?.length || 0) - 1) {
                                  const newModules = [...(course.modules || [])]
                                  const temp = newModules[moduleIndex]
                                  newModules[moduleIndex] = newModules[moduleIndex + 1]
                                  newModules[moduleIndex + 1] = temp
                                  newModules[moduleIndex].order = moduleIndex + 1
                                  newModules[moduleIndex + 1].order = moduleIndex + 2
                                  setCourse({ ...course, modules: newModules })
                                  // Save modules order and all changes
                                  try {
                                    await Promise.all(
                                      newModules.map((module: any) =>
                                        fetch(`/api/modules/${module.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            titleEn: module.titleEn,
                                            titleRu: module.titleRu,
                                            descriptionEn: module.descriptionEn || null,
                                            descriptionRu: module.descriptionRu || null,
                                            order: module.order,
                                          }),
                                        })
                                      )
                                    )
                                  } catch (error) {
                                    console.error('Error saving modules:', error)
                                    // Revert on error
                                    fetchCourse()
                                  }
                                }
                              }}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                if (confirm('Delete this module and all its lessons?')) {
                                  try {
                                    // Save all current module changes first
                                    await saveAllModules()
                                    
                                    const res = await fetch(`/api/modules/${module.id}`, {
                                      method: 'DELETE',
                                    })
                                    if (res.ok) {
                                      fetchCourse()
                                    }
                                  } catch (error) {
                                    console.error('Error deleting module:', error)
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Lessons</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  // Save all current module changes first
                                  await saveAllModules()
                                  
                                  const newLesson = {
                                    id: `temp-${Date.now()}`,
                                    titleEn: 'New Lesson',
                                    titleRu: 'Новый урок',
                                    order: (module.lessons?.length || 0) + 1,
                                    estimatedTime: 15,
                                  }
                                  
                                  // Optimistically add to UI
                                  const newModules = [...(course.modules || [])]
                                  const moduleIndex = newModules.findIndex((m: any) => m.id === module.id)
                                  if (moduleIndex !== -1) {
                                    newModules[moduleIndex] = {
                                      ...newModules[moduleIndex],
                                      lessons: [...(newModules[moduleIndex].lessons || []), newLesson],
                                    }
                                    setCourse({ ...course, modules: newModules })
                                  }
                                  
                                  const res = await fetch(`/api/modules/${module.id}/lessons`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      titleEn: newLesson.titleEn,
                                      titleRu: newLesson.titleRu,
                                      order: newLesson.order,
                                      estimatedTime: newLesson.estimatedTime,
                                    }),
                                  })
                                  
                                  if (res.ok) {
                                    const createdLesson = await res.json()
                                    // Replace temp lesson with real one
                                    const updatedModules = [...(course.modules || [])]
                                    const updatedModuleIndex = updatedModules.findIndex((m: any) => m.id === module.id)
                                    if (updatedModuleIndex !== -1) {
                                      updatedModules[updatedModuleIndex] = {
                                        ...updatedModules[updatedModuleIndex],
                                        lessons: updatedModules[updatedModuleIndex].lessons?.map((l: any) =>
                                          l.id === newLesson.id ? createdLesson : l
                                        ) || [createdLesson],
                                      }
                                      setCourse({ ...course, modules: updatedModules })
                                    }
                                  } else {
                                    // Revert on error
                                    fetchCourse()
                                  }
                                } catch (error) {
                                  console.error('Error adding lesson:', error)
                                  // Revert on error
                                  fetchCourse()
                                }
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Lesson
                            </Button>
                          </div>
                          {module.lessons?.map((lesson: any, lessonIndex: number) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{lesson.titleEn}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.titleRu} • {lesson.estimatedTime}m
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={async () => {
                                    if (lessonIndex > 0) {
                                      const newModules = [...(course.modules || [])]
                                      const module = newModules[moduleIndex]
                                      const lessons = [...(module.lessons || [])]
                                      const temp = lessons[lessonIndex]
                                      lessons[lessonIndex] = lessons[lessonIndex - 1]
                                      lessons[lessonIndex - 1] = temp
                                      
                                      // Update order for all lessons in module
                                      lessons.forEach((l: any, idx: number) => {
                                        l.order = idx + 1
                                      })
                                      
                                      newModules[moduleIndex] = {
                                        ...module,
                                        lessons: lessons,
                                      }
                                      setCourse({ ...course, modules: newModules })
                                      
                                      // Save lessons order
                                      try {
                                        await Promise.all(
                                          lessons.map((l: any) =>
                                            fetch(`/api/lessons/${l.id}`, {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                titleEn: l.titleEn,
                                                titleRu: l.titleRu,
                                                estimatedTime: l.estimatedTime,
                                                minimumTime: l.minimumTime,
                                                order: l.order,
                                              }),
                                            })
                                          )
                                        )
                                      } catch (error) {
                                        console.error('Error saving lessons order:', error)
                                        // Revert on error
                                        fetchCourse()
                                      }
                                    }
                                  }}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={async () => {
                                    const module = course.modules?.[moduleIndex]
                                    if (lessonIndex < (module?.lessons?.length || 0) - 1) {
                                      const newModules = [...(course.modules || [])]
                                      const lessons = [...(module.lessons || [])]
                                      const temp = lessons[lessonIndex]
                                      lessons[lessonIndex] = lessons[lessonIndex + 1]
                                      lessons[lessonIndex + 1] = temp
                                      
                                      // Update order for all lessons in module
                                      lessons.forEach((l: any, idx: number) => {
                                        l.order = idx + 1
                                      })
                                      
                                      newModules[moduleIndex] = {
                                        ...module,
                                        lessons: lessons,
                                      }
                                      setCourse({ ...course, modules: newModules })
                                      
                                      // Save lessons order
                                      try {
                                        await Promise.all(
                                          lessons.map((l: any) =>
                                            fetch(`/api/lessons/${l.id}`, {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                titleEn: l.titleEn,
                                                titleRu: l.titleRu,
                                                estimatedTime: l.estimatedTime,
                                                minimumTime: l.minimumTime,
                                                order: l.order,
                                              }),
                                            })
                                          )
                                        )
                                      } catch (error) {
                                        console.error('Error saving lessons order:', error)
                                        // Revert on error
                                        fetchCourse()
                                      }
                                    }
                                  }}
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                                <Link href={`/en/teacher/lessons/${lesson.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={async () => {
                                  if (confirm('Delete this lesson?')) {
                                    try {
                                      // Save all current module changes first
                                      await saveAllModules()
                                      
                                      const res = await fetch(`/api/lessons/${lesson.id}`, {
                                        method: 'DELETE',
                                      })
                                      if (res.ok) {
                                        fetchCourse()
                                      }
                                    } catch (error) {
                                      console.error('Error deleting lesson:', error)
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Advanced course configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input type="number" value={course.version || 1} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Created</Label>
                  <Input
                    value={new Date(course.createdAt).toLocaleString()}
                    disabled
                  />
                </div>
                {course.publishedAt && (
                  <div className="space-y-2">
                    <Label>Published</Label>
                    <Input
                      value={new Date(course.publishedAt).toLocaleString()}
                      disabled
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

