'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export default function LoginPage() {
  const t = useTranslations()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('auth.invalidCredentials'))
        setLoading(false)
        return
      }

      // Store session
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token || 'demo-token')

      // Redirect based on role
      const rolePathMap: Record<string, string> = {
        ADMIN: '/en/admin/dashboard',
        TEACHER: '/en/teacher/dashboard',
        TEAM_LEAD: '/en/teamlead/dashboard',
        STUDENT: '/en/student/dashboard',
      }
      const rolePath = rolePathMap[data.user.role] || '/en/student/dashboard'

      router.push(rolePath)
    } catch (err) {
      setError(t('auth.invalidCredentials'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.title')}
          </CardTitle>
          <CardDescription className="text-center">
            WRE Learning Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('common.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.signingIn') : t('common.login')}
            </Button>
            <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
              <p>Demo accounts:</p>
              <p>admin@demo.com / teacher@demo.com / teamlead@demo.com / student1@demo.com</p>
              <p className="text-xs">Password: demo123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

