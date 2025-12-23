# 🚀 Быстрый деплой на Vercel

## Шаг 1: Настройка Git (если еще не сделано)

```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

## Шаг 2: Коммит и пуш в GitHub

```bash
git commit -m "Initial commit - WRE LMS Platform"
git branch -M main
git remote add origin https://github.com/znn-cmd/LMS-wre.git
git push -u origin main
```

Если репозиторий уже существует и не пустой:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Шаг 3: Деплой на Vercel

1. **Откройте Vercel**: https://vercel.com
2. **Войдите** через GitHub
3. **Добавьте проект**: "Add New Project"
4. **Импортируйте репозиторий**: `znn-cmd/LMS-wre`
5. **Настройки проекта** (обычно определяются автоматически):
   - Framework: Next.js
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`

## Шаг 4: Добавьте переменные окружения

В Vercel Dashboard → Settings → Environment Variables добавьте:

```
NEXT_PUBLIC_SUPABASE_URL=https://cndmouefqjfmxgovrzbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AlCrI62hTdb9ZJ5Rr2X_fg_2NF7YpCr
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZG1vdWVmcWpmbXhnb3ZyemJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4ODgwNCwiZXhwIjoyMDgxNDY0ODA0fQ.KnUYKUEFZy_iraU4BBEIhRb0628tvrzRoF1N_2y9xmM
DATABASE_URL=postgresql://postgres.cndmouefqjfmxgovrzbx:Km13nn07!z*@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Важно**: После первого деплоя замените `your-project.vercel.app` на реальный URL вашего проекта.

## Шаг 5: Деплой

1. Нажмите **"Deploy"**
2. Дождитесь завершения сборки (2-5 минут)
3. Скопируйте URL вашего проекта
4. Обновите `NEXT_PUBLIC_APP_URL` с реальным URL
5. Передеплойте проект

## Готово! 🎉

Ваш LMS доступен по адресу: `https://your-project.vercel.app`

## Демо-аккаунты

После seeding базы данных:
- **Admin**: admin@demo.com / demo123
- **Teacher**: teacher@demo.com / demo123
- **Student**: student1@demo.com / demo123

## Проблемы?

См. `DEPLOY.md` для подробных инструкций и решения проблем.


