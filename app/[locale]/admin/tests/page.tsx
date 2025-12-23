'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Users } from 'lucide-react'
import Link from 'next/link'

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests')
      const data = await res.json()
      setTests(data)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tests</h1>
          <p className="text-muted-foreground">Manage all tests in the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>View and manage tests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{test.titleEn}</div>
                        <div className="text-sm text-muted-foreground">{test.titleRu}</div>
                      </div>
                    </TableCell>
                    <TableCell>{test.creator?.firstName} {test.creator?.lastName}</TableCell>
                    <TableCell>{test.passingScore}%</TableCell>
                    <TableCell>{test.questionsCount}</TableCell>
                    <TableCell>
                      <Link href={`/en/admin/tests/${test.id}/assign`}>
                        <Button variant="ghost" size="sm">
                          <Users className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


