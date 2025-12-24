'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Upload, Image as ImageIcon, Video, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'

interface QuestionEditorProps {
  open: boolean
  onClose: () => void
  onSave: (question: any) => Promise<void>
  question?: any
  testId: string
}

export function QuestionEditor({ open, onClose, onSave, question, testId }: QuestionEditorProps) {
  const { toast } = useToast()
  const t = useTranslations()
  const [questionType, setQuestionType] = useState<string>('SINGLE_CHOICE')
  const [questionEn, setQuestionEn] = useState('')
  const [questionRu, setQuestionRu] = useState('')
  const [points, setPoints] = useState(1)
  const [explanationEn, setExplanationEn] = useState('')
  const [explanationRu, setExplanationRu] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState<string | null>(null)
  const [options, setOptions] = useState<any[]>([])
  const [correctAnswer, setCorrectAnswer] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (question) {
      setQuestionType(question.type)
      setQuestionEn(question.questionEn || '')
      setQuestionRu(question.questionRu || '')
      setPoints(question.points || 1)
      setExplanationEn(question.explanationEn || '')
      setExplanationRu(question.explanationRu || '')
      // Convert stored path to API route for display
      const storedUrl = question.mediaUrl || ''
      let displayUrl = storedUrl
      if (storedUrl) {
        if (storedUrl.startsWith('/uploads/')) {
          // Convert /uploads/... to /api/uploads/...
          displayUrl = `/api${storedUrl}`
        } else if (storedUrl.startsWith('/api/uploads/')) {
          // Already in API format, keep as is
          displayUrl = storedUrl
        } else if (!storedUrl.startsWith('http')) {
          // Relative path without /uploads/, add it
          displayUrl = `/api/uploads/${storedUrl.replace(/^\//, '')}`
        }
      }
      setMediaUrl(displayUrl)
      setMediaType(question.mediaType || null)
      setOptions(question.options ? (Array.isArray(question.options) ? question.options : []) : [])
      setCorrectAnswer(question.correctAnswer || null)
    } else {
      // Reset for new question
      setQuestionType('SINGLE_CHOICE')
      setQuestionEn('')
      setQuestionRu('')
      setPoints(1)
      setExplanationEn('')
      setExplanationRu('')
      setMediaUrl('')
      setMediaType(null)
      setOptions([])
      setCorrectAnswer(null)
    }
  }, [question, open])

  const handleAddOption = () => {
    setOptions([...options, { id: Date.now().toString(), textEn: '', textRu: '', isCorrect: false }])
  }

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id))
  }

  const handleOptionChange = (id: string, field: string, value: any) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ))
  }

  const handleMediaUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/tests/${testId}/upload-media`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await res.json()
      // Convert relative path to API route for display
      // data.url is like "/uploads/tests/..." -> convert to "/api/uploads/tests/..."
      const apiUrl = data.url.startsWith('/uploads/') 
        ? `/api${data.url}` 
        : `/api/uploads${data.url}`
      setMediaUrl(apiUrl)
      setMediaType(data.type)
      toast({
        title: t('common.success'),
        description: t('test.mediaUploadSuccess'),
        variant: 'success',
        duration: 2000,
      })
    } catch (error) {
      console.error('Error uploading media:', error)
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('test.mediaUploadError'),
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Prepare correct answer based on question type
      let finalCorrectAnswer = correctAnswer
      if (questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE') {
        finalCorrectAnswer = options.filter(opt => opt.isCorrect).map(opt => opt.id)
        if (questionType === 'SINGLE_CHOICE' && finalCorrectAnswer.length > 0) {
          finalCorrectAnswer = finalCorrectAnswer[0]
        }
      } else if (questionType === 'TRUE_FALSE') {
        finalCorrectAnswer = correctAnswer !== null ? correctAnswer : true
      } else if (questionType === 'SHORT_TEXT') {
        finalCorrectAnswer = correctAnswer || ''
      }

      // Convert API route back to relative path for storage
      let storedMediaUrl = mediaUrl
      if (mediaUrl && mediaUrl.startsWith('/api/uploads/')) {
        storedMediaUrl = mediaUrl.replace('/api/uploads/', '/uploads/')
      }

      const questionData = {
        type: questionType,
        questionEn,
        questionRu,
        points,
        explanationEn: explanationEn || null,
        explanationRu: explanationRu || null,
        mediaUrl: storedMediaUrl || null,
        mediaType: mediaType || null,
        options: options.length > 0 ? options : null,
        correctAnswer: finalCorrectAnswer,
      }

      await onSave(questionData)
      onClose()
    } catch (error) {
      console.error('Error saving question:', error)
      // Error will be handled by parent component
      throw error
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Add Question'}</DialogTitle>
          <DialogDescription>
            Create a question with support for text, images, and videos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="SHORT_TEXT">Short Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question (English)</Label>
              <Textarea
                value={questionEn}
                onChange={(e) => setQuestionEn(e.target.value)}
                placeholder="Enter question in English"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Question (Russian)</Label>
              <Textarea
                value={questionRu}
                onChange={(e) => setQuestionRu(e.target.value)}
                placeholder="Введите вопрос на русском"
                rows={3}
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Media (Image or Video)</Label>
            <div className="flex items-center gap-4">
              {mediaUrl && (
                <div className="relative">
                  {mediaType === 'image' ? (
                    <img src={mediaUrl} alt="Question media" className="h-32 w-auto rounded border" />
                  ) : mediaType === 'video' ? (
                    <video src={mediaUrl} className="h-32 w-auto rounded border" controls />
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1"
                    onClick={() => {
                      setMediaUrl('')
                      setMediaType(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const type = file.type.startsWith('image/') ? 'image' : 'video'
                      setMediaType(type)
                      handleMediaUpload(file)
                    }
                  }}
                  disabled={uploading}
                />
                <label htmlFor="media-upload">
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? 'Uploading...' : <><Upload className="h-4 w-4 mr-2" />Upload Media</>}
                    </span>
                  </Button>
                </label>
                <Input
                  type="url"
                  placeholder="Or enter media URL"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value)
                    if (e.target.value) {
                      const url = e.target.value.toLowerCase()
                      if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) {
                        setMediaType('image')
                      } else if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
                        setMediaType('video')
                      }
                    }
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Options for choice questions */}
          {(questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
              {options.map((option) => (
                <div key={option.id} className="flex gap-2 items-start p-3 border rounded">
                  <input
                    type={questionType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(option.id, 'isCorrect', e.target.checked)}
                    className="mt-2"
                  />
                  <div className="flex-1 grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder="Option (English)"
                      value={option.textEn}
                      onChange={(e) => handleOptionChange(option.id, 'textEn', e.target.value)}
                    />
                    <Input
                      placeholder="Вариант (Русский)"
                      value={option.textRu}
                      onChange={(e) => handleOptionChange(option.id, 'textRu', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* True/False */}
          {questionType === 'TRUE_FALSE' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Select
                value={correctAnswer === true ? 'true' : correctAnswer === false ? 'false' : ''}
                onValueChange={(value) => setCorrectAnswer(value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Short Text */}
          {questionType === 'SHORT_TEXT' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Input
                value={correctAnswer || ''}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Enter correct answer"
              />
            </div>
          )}

          {/* Explanations */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Explanation (English)</Label>
              <Textarea
                value={explanationEn}
                onChange={(e) => setExplanationEn(e.target.value)}
                placeholder="Optional explanation"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Explanation (Russian)</Label>
              <Textarea
                value={explanationRu}
                onChange={(e) => setExplanationRu(e.target.value)}
                placeholder="Необязательное объяснение"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !questionEn || !questionRu}>
              {saving ? 'Saving...' : 'Save Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

