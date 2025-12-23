'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function AssignCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [courseId])

  const fetchData = async () => {
    try {
      const [courseRes, usersRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch('/api/users'),
      ])
      const courseData = await courseRes.json()
      const usersData = await usersRes.json()
      setCourse(courseData)
      setUsers(usersData.filter((u: any) => u.role === 'STUDENT'))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one student')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/courses/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userIds: selectedUsers,
          deadline: deadline || null,
        }),
      })

      if (res.ok) {
        router.push('/en/admin/courses')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to assign course')
      }
    } catch (error) {
      console.error('Error assigning course:', error)
      alert('Error assigning course')
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/en/admin/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assign Course</h1>
              <p className="text-muted-foreground">{course?.titleEn}</p>
            </div>
          </div>
          <Button onClick={handleAssign} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Assigning...' : 'Assign Course'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Students</CardTitle>
            <CardDescription>Choose students to assign this course to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Deadline (optional)</Label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id={user.id}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, user.id])
                      } else {
                        setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                      }
                    }}
                  />
                  <Label htmlFor={user.id} className="cursor-pointer flex-1">
                    {user.firstName} {user.lastName} ({user.email})
                  </Label>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Selected: {selectedUsers.length} student(s)
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


