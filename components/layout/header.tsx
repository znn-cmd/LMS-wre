'use client'

import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function Header() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (locale: string) => {
    const path = pathname.replace(/^\/(en|ru)/, `/${locale}`)
    router.push(path)
  }

  const currentLocale = pathname.split('/')[1] || 'en'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">WRE Learning Management System</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={currentLocale === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale('en')}
        >
          EN
        </Button>
        <Button
          variant={currentLocale === 'ru' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale('ru')}
        >
          RU
        </Button>
      </div>
    </header>
  )
}


