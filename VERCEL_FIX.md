# 🔧 Исправление ошибки сборки на Vercel

## Проблема
```
Error: Command "prisma generate && next build" exited with 1
```

## Решения

### 1. Проверьте переменные окружения

Убедитесь, что в Vercel Dashboard → Settings → Environment Variables добавлены:

```
DATABASE_URL=postgresql://postgres.cndmouefqjfmxgovrzbx:Km13nn07!z*@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://cndmouefqjfmxgovrzbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AlCrI62hTdb9ZJ5Rr2X_fg_2NF7YpCr
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZG1vdWVmcWpmbXhnb3ZyemJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4ODgwNCwiZXhwIjoyMDgxNDY0ODA0fQ.KnUYKUEFZy_iraU4BBEIhRb0628tvrzRoF1N_2y9xmM
```

**Важно**: `DATABASE_URL` должен быть доступен во время сборки для Prisma generate.

### 2. Измените Build Command в Vercel

В Vercel Dashboard → Settings → General → Build & Development Settings:

**Build Command**: `npm run vercel-build`

Или оставьте пустым (будет использоваться из package.json).

### 3. Альтернативное решение

Если проблема сохраняется, используйте только `next build`:

1. В Vercel Settings → Build Command: `next build`
2. Prisma Client будет сгенерирован через `postinstall` hook

### 4. Проверьте логи сборки

В Vercel Dashboard → Deployments → выберите последний деплой → View Function Logs

Ищите ошибки:
- `Can't reach database server` - проблема с DATABASE_URL
- `Prisma schema validation error` - проблема в schema.prisma
- `Module not found` - проблема с зависимостями

### 5. Убедитесь, что Prisma установлен

В `package.json` должны быть:
```json
{
  "dependencies": {
    "@prisma/client": "^5.7.1"
  },
  "devDependencies": {
    "prisma": "^5.7.1"
  }
}
```

### 6. Локальная проверка

Проверьте сборку локально:
```bash
npm install
npm run build
```

Если локально работает, но не на Vercel - проблема в переменных окружения.

## Быстрое исправление

1. Удалите `vercel.json` или измените buildCommand на `npm run build`
2. Убедитесь, что `postinstall` в package.json содержит `prisma generate`
3. Добавьте все переменные окружения в Vercel
4. Передеплойте проект


