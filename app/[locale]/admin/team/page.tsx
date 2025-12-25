'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit, Users, BookOpen, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function AdminTeamPage() {
  const t = useTranslations()
  const locale = useLocale()
  const { toast } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [teamLeads, setTeamLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedTeamLead, setSelectedTeamLead] = useState<any>(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    department: '',
  })

  useEffect(() => {
    fetchUsers()
    fetchTeamLeads()
    fetchCourses()
    fetchTests()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamLeads = async () => {
    try {
      const res = await fetch('/api/admin/team')
      const data = await res.json()
      setTeamLeads(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching team leads:', error)
      setTeamLeads([])
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setCourses(Array.isArray(data) ? data.filter((c: any) => c.status === 'PUBLISHED') : [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    }
  }

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/teacher/tests')
      const data = await res.json()
      setTests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching tests:', error)
      setTests([])
    }
  }

  const handleCreateUser = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create user')
      }

      toast({
        title: t('common.success'),
        description: 'User created successfully',
        variant: 'success',
      })

      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'STUDENT',
        department: '',
      })
      setCreateUserDialogOpen(false)
      fetchUsers()
      fetchTeamLeads()
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete user')

      toast({
        title: t('common.success'),
        description: 'User deleted successfully',
        variant: 'success',
      })

      fetchUsers()
      fetchTeamLeads()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const handleAssignStudent = async () => {
    if (!selectedTeamLead || !selectedStudent) return

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamLeadId: selectedTeamLead.id,
          studentId: selectedStudent,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to assign student')
      }

      toast({
        title: t('common.success'),
        description: 'Student assigned to team lead',
        variant: 'success',
      })

      setSelectedStudent('')
      setAssignDialogOpen(false)
      fetchTeamLeads()
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const students = users.filter((u) => u.role === 'STUDENT')
  const teachers = users.filter((u) => u.role === 'TEACHER')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('team.teamManagement')}</h1>
            <p className="text-muted-foreground">{t('team.manageUsersAndTeams')}</p>
          </div>
          <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('team.createUser')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('team.createNewUser')}</DialogTitle>
                <DialogDescription>{t('team.createUserDescription')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('team.firstName')}</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('team.lastName')}</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('common.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Default: password123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('team.role')}</Label>
                  <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">{t('team.student')}</SelectItem>
                      <SelectItem value="TEACHER">{t('team.teacher')}</SelectItem>
                      <SelectItem value="TEAM_LEAD">{t('team.teamLead')}</SelectItem>
                      <SelectItem value="ADMIN">{t('team.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t('team.department')}</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleCreateUser}>{t('common.create')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">{t('team.allUsers')}</TabsTrigger>
            <TabsTrigger value="teamleads">{t('team.teamLeads')}</TabsTrigger>
            <TabsTrigger value="teachers">{t('team.teachers')}</TabsTrigger>
            <TabsTrigger value="students">{t('team.students')}</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t('team.allUsers')}</CardTitle>
                <CardDescription>{t('team.allUsersDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('team.name')}</TableHead>
                      <TableHead>{t('common.email')}</TableHead>
                      <TableHead>{t('team.role')}</TableHead>
                      <TableHead>{t('team.department')}</TableHead>
                      <TableHead>{t('team.status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.department || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? t('team.active') : t('team.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teamleads">
            <Card>
              <CardHeader>
                <CardTitle>{t('team.teamLeads')}</CardTitle>
                <CardDescription>{t('team.teamLeadsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamLeads.map((tl) => (
                    <Card key={tl.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {tl.firstName} {tl.lastName}
                            </CardTitle>
                            <CardDescription>{tl.email}</CardDescription>
                          </div>
                          <Dialog
                            open={assignDialogOpen && selectedTeamLead?.id === tl.id}
                            onOpenChange={(open) => {
                              setAssignDialogOpen(open)
                              if (open) setSelectedTeamLead(tl)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus className="h-3 w-3 mr-1" />
                                {t('team.assignStudent')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('team.assignStudent')}</DialogTitle>
                                <DialogDescription>
                                  {t('team.assignStudentDescription')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>{t('team.selectStudent')}</Label>
                                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('team.selectStudentPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {students.map((student) => (
                                        <SelectItem key={student.id} value={student.id}>
                                          {student.firstName} {student.lastName} ({student.email})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                                    {t('common.cancel')}
                                  </Button>
                                  <Button onClick={handleAssignStudent}>{t('common.assign')}</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {tl.members?.length || 0} {t('team.members')}
                            </span>
                          </div>
                          {tl.members && tl.members.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {tl.members.map((member: any) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {member.member.firstName} {member.member.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {member.member.email}
                                    </div>
                                  </div>
                                  {member.statistics && (
                                    <div className="flex gap-2">
                                      <Badge variant="outline">
                                        {member.statistics.completionRate}% {t('team.complete')}
                                      </Badge>
                                      <Badge
                                        variant={
                                          member.statistics.avgScore >= 70 ? 'default' : 'destructive'
                                        }
                                      >
                                        {member.statistics.avgScore}% {t('team.score')}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle>{t('team.teachers')}</CardTitle>
                <CardDescription>{t('team.teachersDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('team.name')}</TableHead>
                      <TableHead>{t('common.email')}</TableHead>
                      <TableHead>{t('team.department')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.department || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(teacher.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>{t('team.students')}</CardTitle>
                <CardDescription>{t('team.studentsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('team.name')}</TableHead>
                      <TableHead>{t('common.email')}</TableHead>
                      <TableHead>{t('team.department')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(student.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

