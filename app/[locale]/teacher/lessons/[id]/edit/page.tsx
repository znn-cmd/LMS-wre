'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Save, ArrowLeft, Upload, X, Image as ImageIcon, File as FileIcon, Music } from 'lucide-react'
import Link from 'next/link'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export default function EditLessonPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`)
      const data = await res.json()
      setLesson(data)
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson),
      })

      if (res.ok) {
        router.push(`/en/teacher/courses/${lesson.courseId}/edit`)
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddContentBlock = () => {
    const newBlock = {
      id: `temp-${Date.now()}`,
      type: 'TEXT',
      order: (lesson.contentBlocks?.length || 0) + 1,
      contentEn: { type: 'html', content: '' },
      contentRu: { type: 'html', content: '' },
    }
    setLesson({
      ...lesson,
      contentBlocks: [...(lesson.contentBlocks || []), newBlock],
    })
  }

  const handleDeleteContentBlock = (blockId: string) => {
    setLesson({
      ...lesson,
      contentBlocks: lesson.contentBlocks.filter((b: any) => b.id !== blockId),
    })
  }

  const handleFileUpload = async (blockId: string, blockIndex: number, file: File, isMultiple: boolean = false) => {
    setUploading((prev) => ({ ...prev, [blockId]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('blockType', lesson.contentBlocks[blockIndex].type)

      const res = await fetch(`/api/lessons/${lessonId}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to upload file')
      }

      const uploadedFile = await res.json()

      setLesson((prevLesson: any) => {
        const newBlocks = [...(prevLesson.contentBlocks || [])]
        const currentBlock = newBlocks[blockIndex]

        if (isMultiple) {
          // For GALLERY - multiple files
          const currentFiles = currentBlock.metadata?.files || []
          newBlocks[blockIndex] = {
            ...currentBlock,
            metadata: {
              ...currentBlock.metadata,
              files: [...currentFiles, uploadedFile],
            },
          }
        } else {
          // For FILE and AUDIO - single file
          newBlocks[blockIndex] = {
            ...currentBlock,
            metadata: {
              ...currentBlock.metadata,
              file: uploadedFile,
            },
          }
        }

        return { ...prevLesson, contentBlocks: newBlocks }
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading((prev) => ({ ...prev, [blockId]: false }))
    }
  }

  const handleRemoveFile = (blockId: string, blockIndex: number, fileIndex?: number) => {
    setLesson((prevLesson: any) => {
      const newBlocks = [...(prevLesson.contentBlocks || [])]
      const currentBlock = newBlocks[blockIndex]

      if (fileIndex !== undefined) {
        // Remove from array (GALLERY)
        const files = [...(currentBlock.metadata?.files || [])]
        files.splice(fileIndex, 1)
        newBlocks[blockIndex] = {
          ...currentBlock,
          metadata: {
            ...currentBlock.metadata,
            files,
          },
        }
      } else {
        // Remove single file (FILE, AUDIO)
        newBlocks[blockIndex] = {
          ...currentBlock,
          metadata: {
            ...currentBlock.metadata,
            file: null,
          },
        }
      }

      return { ...prevLesson, contentBlocks: newBlocks }
    })
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

  if (!lesson) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Lesson not found</p>
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
            <Link href={`/en/teacher/courses/${lesson.courseId}/edit`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Lesson</h1>
              <p className="text-muted-foreground">Edit lesson content and settings</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content Blocks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
                <CardDescription>Basic lesson details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">Title (English)</Label>
                    <Input
                      id="titleEn"
                      value={lesson.titleEn || ''}
                      onChange={(e) =>
                        setLesson({ ...lesson, titleEn: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleRu">Title (Russian)</Label>
                    <Input
                      id="titleRu"
                      value={lesson.titleRu || ''}
                      onChange={(e) =>
                        setLesson({ ...lesson, titleRu: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={lesson.estimatedTime || 15}
                      onChange={(e) =>
                        setLesson({ ...lesson, estimatedTime: parseInt(e.target.value) || 15 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumTime">Minimum Time (minutes, optional)</Label>
                    <Input
                      id="minimumTime"
                      type="number"
                      value={lesson.minimumTime || ''}
                      onChange={(e) =>
                        setLesson({ ...lesson, minimumTime: e.target.value ? parseInt(e.target.value) : null })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Content Blocks</CardTitle>
                    <CardDescription>Manage lesson content</CardDescription>
                  </div>
                  <Button onClick={handleAddContentBlock}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lesson.contentBlocks?.map((block: any, index: number) => (
                    <Card key={block.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Select
                            value={block.type}
                            onValueChange={(value) => {
                              const newBlocks = [...(lesson.contentBlocks || [])]
                              newBlocks[index] = { ...block, type: value }
                              setLesson({ ...lesson, contentBlocks: newBlocks })
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TEXT">Text</SelectItem>
                              <SelectItem value="VIDEO">Video</SelectItem>
                              <SelectItem value="AUDIO">Audio</SelectItem>
                              <SelectItem value="FILE">File</SelectItem>
                              <SelectItem value="GALLERY">Gallery</SelectItem>
                              <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                              <SelectItem value="EMBED">Embed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteContentBlock(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {block.type === 'TEXT' && (
                          <>
                            <RichTextEditor
                              label="Content (English)"
                              id={`content-en-${block.id}`}
                              value={
                                typeof block.contentEn === 'string'
                                  ? block.contentEn
                                  : block.contentEn?.content || ''
                              }
                              onChange={(value: string) => {
                                setLesson((prev: any) => {
                                  const newBlocks = [...(prev.contentBlocks || [])]
                                  const blockIndex = newBlocks.findIndex((b: any) => b.id === block.id)
                                  if (blockIndex !== -1) {
                                    newBlocks[blockIndex] = {
                                      ...newBlocks[blockIndex],
                                      contentEn: { type: 'html', content: value },
                                    }
                                  }
                                  return { ...prev, contentBlocks: newBlocks }
                                })
                              }}
                              placeholder="Enter English content..."
                            />
                            <RichTextEditor
                              label="Content (Russian)"
                              id={`content-ru-${block.id}`}
                              value={
                                typeof block.contentRu === 'string'
                                  ? block.contentRu
                                  : block.contentRu?.content || ''
                              }
                              onChange={(value: string) => {
                                setLesson((prev: any) => {
                                  const newBlocks = [...(prev.contentBlocks || [])]
                                  const blockIndex = newBlocks.findIndex((b: any) => b.id === block.id)
                                  if (blockIndex !== -1) {
                                    newBlocks[blockIndex] = {
                                      ...newBlocks[blockIndex],
                                      contentRu: { type: 'html', content: value },
                                    }
                                  }
                                  return { ...prev, contentBlocks: newBlocks }
                                })
                              }}
                              placeholder="Введите русский контент..."
                            />
                          </>
                        )}
                        {block.type === 'FILE' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>File</Label>
                              {block.metadata?.file ? (
                                <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                                  <div className="flex items-center gap-2">
                                    <FileIcon className="h-4 w-4" />
                                    <span className="text-sm">{block.metadata.file.originalName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({(block.metadata.file.size / 1024).toFixed(2)} KB)
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveFile(block.id, index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed rounded-md p-6 text-center">
                                  <input
                                    type="file"
                                    id={`file-upload-${block.id}`}
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleFileUpload(block.id, index, file, false)
                                      }
                                    }}
                                    disabled={uploading[block.id]}
                                  />
                                  <label
                                    htmlFor={`file-upload-${block.id}`}
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {uploading[block.id] ? 'Uploading...' : 'Click to upload file'}
                                    </span>
                                  </label>
                                </div>
                              )}
                            </div>
                            {block.metadata?.file && (
                              <div className="text-xs text-muted-foreground">
                                File URL: <a href={block.metadata.file.url} target="_blank" rel="noopener noreferrer" className="underline">{block.metadata.file.url}</a>
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === 'AUDIO' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Audio File</Label>
                              {block.metadata?.file ? (
                                <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                                  <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4" />
                                    <span className="text-sm">{block.metadata.file.originalName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({(block.metadata.file.size / 1024).toFixed(2)} KB)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <audio controls src={block.metadata.file.url} className="h-8" />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveFile(block.id, index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed rounded-md p-6 text-center">
                                  <input
                                    type="file"
                                    id={`audio-upload-${block.id}`}
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleFileUpload(block.id, index, file, false)
                                      }
                                    }}
                                    disabled={uploading[block.id]}
                                  />
                                  <label
                                    htmlFor={`audio-upload-${block.id}`}
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {uploading[block.id] ? 'Uploading...' : 'Click to upload audio file'}
                                    </span>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {block.type === 'GALLERY' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Images</Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {block.metadata?.files?.map((file: any, fileIndex: number) => (
                                  <div key={fileIndex} className="relative group">
                                    <img
                                      src={file.url}
                                      alt={file.originalName}
                                      className="w-full h-32 object-cover rounded-md border"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-background/80"
                                      onClick={() => handleRemoveFile(block.id, index, fileIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <div className="border-2 border-dashed rounded-md p-6 text-center">
                                <input
                                  type="file"
                                  id={`gallery-upload-${block.id}`}
                                  className="hidden"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    files.forEach((file) => {
                                      handleFileUpload(block.id, index, file, true)
                                    })
                                  }}
                                  disabled={uploading[block.id]}
                                />
                                <label
                                  htmlFor={`gallery-upload-${block.id}`}
                                  className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {uploading[block.id] ? 'Uploading...' : 'Click to upload images (multiple)'}
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === 'ASSIGNMENT' && (
                          <div className="space-y-4">
                            <RichTextEditor
                              label="Assignment Description (English)"
                              id={`assignment-en-${block.id}`}
                              value={
                                typeof block.contentEn === 'string'
                                  ? block.contentEn
                                  : block.contentEn?.content || ''
                              }
                              onChange={(value: string) => {
                                setLesson((prev: any) => {
                                  const newBlocks = [...(prev.contentBlocks || [])]
                                  const blockIndex = newBlocks.findIndex((b: any) => b.id === block.id)
                                  if (blockIndex !== -1) {
                                    newBlocks[blockIndex] = {
                                      ...newBlocks[blockIndex],
                                      contentEn: { type: 'html', content: value },
                                    }
                                  }
                                  return { ...prev, contentBlocks: newBlocks }
                                })
                              }}
                              placeholder="Enter assignment description..."
                            />
                            <RichTextEditor
                              label="Assignment Description (Russian)"
                              id={`assignment-ru-${block.id}`}
                              value={
                                typeof block.contentRu === 'string'
                                  ? block.contentRu
                                  : block.contentRu?.content || ''
                              }
                              onChange={(value: string) => {
                                setLesson((prev: any) => {
                                  const newBlocks = [...(prev.contentBlocks || [])]
                                  const blockIndex = newBlocks.findIndex((b: any) => b.id === block.id)
                                  if (blockIndex !== -1) {
                                    newBlocks[blockIndex] = {
                                      ...newBlocks[blockIndex],
                                      contentRu: { type: 'html', content: value },
                                    }
                                  }
                                  return { ...prev, contentBlocks: newBlocks }
                                })
                              }}
                              placeholder="Введите описание задания..."
                            />
                          </div>
                        )}

                        {(block.type === 'VIDEO' || block.type === 'EMBED') && (
                          <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                              value={block.metadata?.url || ''}
                              onChange={(e) => {
                                const newBlocks = [...(lesson.contentBlocks || [])]
                                newBlocks[index] = {
                                  ...block,
                                  metadata: { ...block.metadata, url: e.target.value },
                                }
                                setLesson({ ...lesson, contentBlocks: newBlocks })
                              }}
                              placeholder="Enter URL..."
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(!lesson.contentBlocks || lesson.contentBlocks.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No content blocks yet. Click "Add Block" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Settings</CardTitle>
                <CardDescription>Advanced lesson configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input type="number" value={lesson.order || 1} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Created</Label>
                  <Input
                    value={new Date(lesson.createdAt).toLocaleString()}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}


