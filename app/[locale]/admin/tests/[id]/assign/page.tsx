'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AssignTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string
  const [test, setTest] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [testId])

  const fetchData = async () => {
    try {
      const [testRes, usersRes] = await Promise.all([
        fetch(`/api/tests/${testId}`),
        fetch('/api/users'),
      ])
      const testData = await testRes.json()
      const usersData = await usersRes.json()
      setTest(testData)
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
      const res = await fetch('/api/tests/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          userIds: selectedUsers,
          deadline: deadline || null,
        }),
      })

      if (res.ok) {
        router.push('/en/admin/tests')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to assign test')
      }
    } catch (error) {
      console.error('Error assigning test:', error)
      alert('Error assigning test')
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
            <Link href="/en/admin/tests">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assign Test</h1>
              <p className="text-muted-foreground">{test?.titleEn}</p>
            </div>
          </div>
          <Button onClick={handleAssign} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Assigning...' : 'Assign Test'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Students</CardTitle>
            <CardDescription>Choose students to assign this test to</CardDescription>
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


