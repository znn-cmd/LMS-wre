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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, BookOpen, FileText, TrendingUp, Clock, Target } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface TeamMember {
  id: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    department: string | null
    isActive: boolean
  }
  courses: Array<{ id: string; titleEn: string; titleRu: string }>
  tests: Array<{ id: string; titleEn: string; titleRu: string }>
  statistics: {
    completedLessons: number
    totalLessons: number
    completionRate: number
    testAttempts: number
    avgScore: number
    totalTimeSpent: number
  }
}

export default function TeamLeadTeamPage() {
  const t = useTranslations()
  const locale = useLocale()
  const { toast } = useToast()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [assignCourseDialogOpen, setAssignCourseDialogOpen] = useState(false)
  const [assignTestDialogOpen, setAssignTestDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedTest, setSelectedTest] = useState('')

  useEffect(() => {
    fetchTeam()
    fetchCourses()
    fetchTests()
  }, [])

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/teamlead/team')
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching team:', error)
      toast({
        title: t('common.error'),
        description: 'Failed to fetch team',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
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

  const handleAddMember = async () => {
    try {
      const res = await fetch('/api/teamlead/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newMemberEmail }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add member')
      }

      toast({
        title: t('common.success'),
        description: 'Member added successfully',
        variant: 'success',
      })

      setNewMemberEmail('')
      setAddMemberDialogOpen(false)
      fetchTeam()
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const res = await fetch(`/api/teamlead/team/${memberId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to remove member')

      toast({
        title: t('common.success'),
        description: 'Member removed successfully',
        variant: 'success',
      })

      fetchTeam()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to remove member',
        variant: 'destructive',
      })
    }
  }

  const handleAssignCourse = async () => {
    if (!selectedMember || !selectedCourse) return

    try {
      const res = await fetch('/api/teamlead/assign-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedMember.user.id,
          courseId: selectedCourse,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to assign course')
      }

      toast({
        title: t('common.success'),
        description: 'Course assigned successfully',
        variant: 'success',
      })

      setSelectedCourse('')
      setAssignCourseDialogOpen(false)
      fetchTeam()
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleAssignTest = async () => {
    if (!selectedMember || !selectedTest) return

    try {
      const res = await fetch('/api/teamlead/assign-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedMember.user.id,
          testId: selectedTest,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to assign test')
      }

      toast({
        title: t('common.success'),
        description: 'Test assigned successfully',
        variant: 'success',
      })

      setSelectedTest('')
      setAssignTestDialogOpen(false)
      fetchTeam()
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleUnassignCourse = async (userId: string, courseId: string) => {
    try {
      const res = await fetch('/api/teamlead/assign-course', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId }),
      })

      if (!res.ok) throw new Error('Failed to unassign course')

      toast({
        title: t('common.success'),
        description: 'Course unassigned',
        variant: 'success',
      })

      fetchTeam()
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to unassign course',
        variant: 'destructive',
      })
    }
  }

  // Calculate team statistics
  const teamStats = members.reduce(
    (acc, member) => ({
      totalLessons: acc.totalLessons + member.statistics.totalLessons,
      completedLessons: acc.completedLessons + member.statistics.completedLessons,
      testAttempts: acc.testAttempts + member.statistics.testAttempts,
      totalScore: acc.totalScore + member.statistics.avgScore,
      members: acc.members + 1,
    }),
    { totalLessons: 0, completedLessons: 0, testAttempts: 0, totalScore: 0, members: 0 }
  )

  const avgCompletionRate =
    teamStats.totalLessons > 0
      ? Math.round((teamStats.completedLessons / teamStats.totalLessons) * 100)
      : 0

  const avgScore = teamStats.members > 0 ? Math.round(teamStats.totalScore / teamStats.members) : 0

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('team.myTeam')}</h1>
            <p className="text-muted-foreground">{t('team.manageTeamDescription')}</p>
          </div>
          <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('team.addMember')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('team.addMember')}</DialogTitle>
                <DialogDescription>{t('team.addMemberDescription')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder={t('team.enterStudentEmail')}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleAddMember}>{t('common.add')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('team.teamSize')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">{t('team.activeMembers')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('team.avgCompletion')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCompletionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {teamStats.completedLessons} / {teamStats.totalLessons} {t('team.lessons')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('team.avgScore')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}%</div>
              <p className="text-xs text-muted-foreground">{t('team.testAverage')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('team.totalAttempts')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.testAttempts}</div>
              <p className="text-xs text-muted-foreground">{t('team.testAttempts')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('team.teamMembers')}</CardTitle>
            <CardDescription>{t('team.viewManageMembers')}</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('team.noMembersYet')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('team.name')}</TableHead>
                    <TableHead>{t('common.email')}</TableHead>
                    <TableHead>{t('team.progress')}</TableHead>
                    <TableHead>{t('team.avgScore')}</TableHead>
                    <TableHead>{t('team.assignments')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(members || []).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.firstName} {member.user.lastName}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${member.statistics.completionRate}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {member.statistics.completionRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.statistics.avgScore >= 70 ? 'default' : 'destructive'}>
                          {member.statistics.avgScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="outline">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {member.courses.length}
                          </Badge>
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            {member.tests.length}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={assignCourseDialogOpen && selectedMember?.id === member.id}
                            onOpenChange={(open) => {
                              setAssignCourseDialogOpen(open)
                              if (open) setSelectedMember(member)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {t('team.assignCourse')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('team.assignCourse')}</DialogTitle>
                                <DialogDescription>
                                  {t('team.assignCourseDescription')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {member.courses.length > 0 && (
                                  <div className="space-y-2">
                                    <Label>{t('team.currentCourses')}</Label>
                                    <div className="space-y-1">
                                      {(member.courses || []).map((course) => (
                                        <div
                                          key={course.id}
                                          className="flex items-center justify-between p-2 border rounded"
                                        >
                                          <span className="text-sm">
                                            {locale === 'ru' ? course.titleRu : course.titleEn}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleUnassignCourse(member.user.id, course.id)
                                            }
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="course">{t('team.selectCourse')}</Label>
                                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('team.selectCoursePlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(courses || []).map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                          {locale === 'ru' ? course.titleRu : course.titleEn}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setAssignCourseDialogOpen(false)}
                                  >
                                    {t('common.cancel')}
                                  </Button>
                                  <Button onClick={handleAssignCourse}>{t('common.assign')}</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={assignTestDialogOpen && selectedMember?.id === member.id}
                            onOpenChange={(open) => {
                              setAssignTestDialogOpen(open)
                              if (open) setSelectedMember(member)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileText className="h-3 w-3 mr-1" />
                                {t('team.assignTest')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('team.assignTest')}</DialogTitle>
                                <DialogDescription>{t('team.assignTestDescription')}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {member.tests.length > 0 && (
                                  <div className="space-y-2">
                                    <Label>{t('team.currentTests')}</Label>
                                    <div className="space-y-1">
                                      {(member.tests || []).map((test) => (
                                        <div
                                          key={test.id}
                                          className="flex items-center justify-between p-2 border rounded"
                                        >
                                          <span className="text-sm">
                                            {locale === 'ru' ? test.titleRu : test.titleEn}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="test">{t('team.selectTest')}</Label>
                                  <Select value={selectedTest} onValueChange={setSelectedTest}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('team.selectTestPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(tests || []).map((test) => (
                                        <SelectItem key={test.id} value={test.id}>
                                          {locale === 'ru' ? test.titleRu : test.titleEn}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setAssignTestDialogOpen(false)}
                                  >
                                    {t('common.cancel')}
                                  </Button>
                                  <Button onClick={handleAssignTest}>{t('common.assign')}</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

