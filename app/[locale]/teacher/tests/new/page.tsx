'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewTestPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [test, setTest] = useState({
    titleEn: '',
    titleRu: '',
    descriptionEn: '',
    descriptionRu: '',
    passingScore: 70,
    timeLimit: null as number | null,
    maxAttempts: null as number | null,
    allowRetake: true,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/en/teacher/tests/${data.id}/edit`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create test')
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Error creating test')
    } finally {
      setSaving(false)
    }
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
              <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
              <p className="text-muted-foreground">Create a new test from scratch</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Test'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>Enter basic test details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (English) *</Label>
                <Input
                  id="titleEn"
                  value={test.titleEn}
                  onChange={(e) => setTest({ ...test, titleEn: e.target.value })}
                  placeholder="Test Title in English"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleRu">Title (Russian) *</Label>
                <Input
                  id="titleRu"
                  value={test.titleRu}
                  onChange={(e) => setTest({ ...test, titleRu: e.target.value })}
                  placeholder="Название теста на русском"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%) *</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={test.passingScore}
                  onChange={(e) => setTest({ ...test, passingScore: parseInt(e.target.value) || 70 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={test.timeLimit || ''}
                  onChange={(e) => setTest({ ...test, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="No limit"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Attempts (optional)</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={test.maxAttempts || ''}
                  onChange={(e) => setTest({ ...test, maxAttempts: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowRetake">Allow Retake</Label>
                <select
                  id="allowRetake"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={test.allowRetake ? 'true' : 'false'}
                  onChange={(e) => setTest({ ...test, allowRetake: e.target.value === 'true' })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <textarea
                id="descriptionEn"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={test.descriptionEn}
                onChange={(e) => setTest({ ...test, descriptionEn: e.target.value })}
                placeholder="Test description in English..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionRu">Description (Russian)</Label>
              <textarea
                id="descriptionRu"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={test.descriptionRu}
                onChange={(e) => setTest({ ...test, descriptionRu: e.target.value })}
                placeholder="Описание теста на русском..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


