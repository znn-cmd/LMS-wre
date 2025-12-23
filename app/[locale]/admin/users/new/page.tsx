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

export default function NewUserPage() {
  const t = useTranslations()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    department: '',
    team: '',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })

      if (res.ok) {
        router.push('/en/admin/users')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/en/admin/users">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
              <p className="text-muted-foreground">Add a new user to the system</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Enter user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={user.firstName}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={user.lastName}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={user.role}
                  onValueChange={(value) => setUser({ ...user, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={user.department}
                  onChange={(e) => setUser({ ...user, department: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={user.team}
                onChange={(e) => setUser({ ...user, team: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


