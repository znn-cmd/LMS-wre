'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen, File as FileIcon, Music, Download, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function LessonPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(new Date())
  const [activeTime, setActiveTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (lessonId) {
      fetchLesson()
      startTimeTracking()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [lessonId])

  const startTimeTracking = () => {
    intervalRef.current = setInterval(() => {
      setActiveTime((prev) => prev + 1)
    }, 1000)
  }

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`)
      const data = await res.json()
      setLesson(data)
      
      // Check if already completed
      if (data.progress?.status === 'COMPLETED') {
        setCompleted(true)
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeTime,
          endTime: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setCompleted(true)
        // Update lesson progress
        fetchLesson()
      }
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

  const progressPercent = lesson.progress?.status === 'COMPLETED' ? 100 : 
    lesson.minimumTime ? Math.min(100, Math.round((activeTime / (lesson.minimumTime * 60)) * 100)) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/en/student/courses/${lesson.courseId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{lesson.titleEn}</h1>
              <p className="text-muted-foreground">{lesson.titleRu}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time: {formatTime(activeTime)} / {lesson.estimatedTime}m</span>
            </div>
            {completed && (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {lesson.minimumTime && !completed && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Minimum time required: {lesson.minimumTime} minutes</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {lesson.contentBlocks?.map((block: any) => (
            <Card key={block.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {block.type === 'TEXT' && <BookOpen className="h-4 w-4 inline mr-2" />}
                  {block.type}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {block.type === 'TEXT' && (
                  <div className="prose max-w-none">
                    <div className="space-y-4">
                      {block.contentEn && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">English:</h3>
                          <div dangerouslySetInnerHTML={{ 
                            __html: typeof block.contentEn === 'string' 
                              ? block.contentEn 
                              : block.contentEn?.content || '' 
                          }} />
                        </div>
                      )}
                      {block.contentRu && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Русский:</h3>
                          <div dangerouslySetInnerHTML={{ 
                            __html: typeof block.contentRu === 'string' 
                              ? block.contentRu 
                              : block.contentRu?.content || '' 
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {block.type === 'FILE' && block.metadata?.file && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{block.metadata.file.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {(block.metadata.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <a
                      href={block.metadata.file.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  </div>
                )}
                {block.type === 'AUDIO' && block.metadata?.file && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted">
                      <Music className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{block.metadata.file.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {(block.metadata.file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <a
                        href={block.metadata.file.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                    <audio controls src={block.metadata.file.url} className="w-full" />
                  </div>
                )}
                {block.type === 'GALLERY' && block.metadata?.files && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {block.metadata.files.map((file: any, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(file.url, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {block.type === 'ASSIGNMENT' && (
                  <div className="prose max-w-none">
                    <div className="space-y-4">
                      {block.contentEn && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">English:</h3>
                          <div dangerouslySetInnerHTML={{ 
                            __html: typeof block.contentEn === 'string' 
                              ? block.contentEn 
                              : block.contentEn?.content || '' 
                          }} />
                        </div>
                      )}
                      {block.contentRu && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Русский:</h3>
                          <div dangerouslySetInnerHTML={{ 
                            __html: typeof block.contentRu === 'string' 
                              ? block.contentRu 
                              : block.contentRu?.content || '' 
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {block.type === 'VIDEO' && (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Video content: {block.metadata?.url || 'No URL'}</p>
                  </div>
                )}
                {block.type === 'EMBED' && block.metadata?.url && (
                  <div className="aspect-video">
                    <iframe
                      src={block.metadata.url}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Link href={`/en/student/courses/${lesson.courseId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          {!completed && (
            <Button 
              onClick={handleComplete}
              disabled={lesson.minimumTime && activeTime < lesson.minimumTime * 60}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {lesson.minimumTime && activeTime < lesson.minimumTime * 60
                ? `Complete (${Math.ceil((lesson.minimumTime * 60 - activeTime) / 60)}m remaining)`
                : 'Mark as Complete'}
            </Button>
          )}
          {completed && lesson.nextLessonId && (
            <Link href={`/en/student/lessons/${lesson.nextLessonId}`}>
              <Button>
                Next Lesson
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


