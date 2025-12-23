'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/en/login')
  }

  const getNavItems = () => {
    const base = [
      { href: `/${pathname.split('/')[1]}/${role.toLowerCase()}/dashboard`, icon: LayoutDashboard, label: t('common.dashboard') },
    ]

    if (role === 'ADMIN') {
      return [
        ...base,
        { href: `/${pathname.split('/')[1]}/admin/users`, icon: Users, label: t('common.users') },
        { href: `/${pathname.split('/')[1]}/admin/courses`, icon: BookOpen, label: t('common.courses') },
        { href: `/${pathname.split('/')[1]}/admin/tests`, icon: FileText, label: t('common.tests') },
        { href: `/${pathname.split('/')[1]}/admin/analytics`, icon: BarChart3, label: t('common.analytics') },
      ]
    }

    if (role === 'TEACHER') {
      return [
        ...base,
        { href: `/${pathname.split('/')[1]}/teacher/courses`, icon: BookOpen, label: t('common.courses') },
        { href: `/${pathname.split('/')[1]}/teacher/tests`, icon: FileText, label: t('common.tests') },
        { href: `/${pathname.split('/')[1]}/teacher/analytics`, icon: BarChart3, label: t('common.analytics') },
      ]
    }

    if (role === 'TEAM_LEAD') {
      return [
        ...base,
        { href: `/${pathname.split('/')[1]}/teamlead/team`, icon: Users, label: 'Team' },
        { href: `/${pathname.split('/')[1]}/teamlead/analytics`, icon: BarChart3, label: t('common.analytics') },
      ]
    }

    return [
      ...base,
      { href: `/${pathname.split('/')[1]}/student/courses`, icon: BookOpen, label: t('common.courses') },
      { href: `/${pathname.split('/')[1]}/student/tests`, icon: FileText, label: 'Tests' },
    ]
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">WRE LMS</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {getNavItems().map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('common.logout')}
        </Button>
      </div>
    </div>
  )
}

