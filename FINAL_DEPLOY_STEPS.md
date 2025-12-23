# ✅ ФИНАЛЬНЫЕ ШАГИ ДЛЯ ДЕПЛОЯ

## ✅ Сборка успешна!

Проект успешно собирается локально. Теперь можно деплоить на Vercel.

## 🚀 Шаги для деплоя:

### 1. Коммит и пуш в GitHub

```bash
git add .
git commit -m "Fix TypeScript errors and prepare for Vercel deployment"
git push -u origin main
```

### 2. Деплой на Vercel

**Вариант A: Через Vercel Dashboard (рекомендуется)**

1. Откройте https://vercel.com
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Импортируйте репозиторий: `znn-cmd/LMS-wre`
5. Настройки (автоматически определяются):
   - Framework: Next.js
   - Build Command: `npm run build` (или оставьте пустым)
   - Output Directory: `.next`

**Вариант B: Через Vercel CLI**

```bash
vercel --prod
```

### 3. Добавьте переменные окружения

В Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://cndmouefqjfmxgovrzbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AlCrI62hTdb9ZJ5Rr2X_fg_2NF7YpCr
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZG1vdWVmcWpmbXhnb3ZyemJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4ODgwNCwiZXhwIjoyMDgxNDY0ODA0fQ.KnUYKUEFZy_iraU4BBEIhRb0628tvrzRoF1N_2y9xmM
DATABASE_URL=postgresql://postgres.cndmouefqjfmxgovrzbx:Km13nn07!z*@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**⚠️ ВАЖНО**: 
- Добавьте переменные **ПЕРЕД** первым деплоем
- После первого деплоя обновите `NEXT_PUBLIC_APP_URL` с реальным URL
- Передеплойте проект после обновления переменных

### 4. После деплоя

1. Скопируйте URL вашего проекта (например: `https://lms-wre.vercel.app`)
2. Обновите `NEXT_PUBLIC_APP_URL` в Vercel с этим URL
3. Передеплойте проект

## ✅ Готово!

Ваш LMS будет доступен по адресу: `https://your-project.vercel.app`

## 🔍 Проверка

После деплоя проверьте:
- ✅ Главная страница загружается
- ✅ Логин работает
- ✅ Дашборды отображаются
- ✅ База данных подключена

## 📝 Демо-аккаунты

После seeding базы данных:
- **Admin**: admin@demo.com / demo123
- **Teacher**: teacher@demo.com / demo123
- **Student**: student1@demo.com / demo123

## 🆘 Если что-то не работает

1. Проверьте логи в Vercel Dashboard → Deployments
2. Убедитесь, что все переменные окружения добавлены
3. Проверьте, что база данных доступна из Vercel
4. См. `VERCEL_FIX.md` для решения проблем


