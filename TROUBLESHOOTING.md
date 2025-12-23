# Решение проблемы с зависанием db:push

Если команда `npm run db:push` зависает, попробуйте следующие решения:

## Решение 1: Использовать Connection Pooler

Вместо прямого подключения используйте Connection Pooler от Supabase:

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → Database → Connection pooling
3. Скопируйте строку из **Connection string** → **Session mode**
4. Замените `DATABASE_URL` в `.env` на эту строку

Формат будет примерно таким:
```
postgresql://postgres.cndmouefqjfmxgovrzbx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## Решение 2: Проверить подключение

```bash
npm run db:quick-test
```

Этот скрипт проверит подключение с таймаутом 10 секунд.

## Решение 3: Использовать Prisma Migrate вместо db:push

```bash
# Инициализировать миграции
npx prisma migrate dev --name init

# Или применить существующие миграции
npx prisma migrate deploy
```

## Решение 4: Проверить настройки Supabase

1. Убедитесь, что база данных активна в Supabase Dashboard
2. Проверьте, что IP адрес не заблокирован
3. В Settings → Database → Connection pooling убедитесь, что pooling включен

## Решение 5: Использовать прямую строку подключения из Supabase

1. Supabase Dashboard → Settings → Database
2. Найдите секцию **Connection string**
3. Выберите **URI** (не Transaction или Session)
4. Скопируйте готовую строку
5. Замените `DATABASE_URL` в `.env`

## Решение 6: Проверить пароль

Убедитесь, что пароль правильный:
- Пароль: `Km13nn07!z*`
- В URL специальные символы должны быть закодированы или в кавычках

Попробуйте оба варианта:

**Вариант A (с кавычками):**
```env
DATABASE_URL="postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"
```

**Вариант B (URL-кодирование):**
```env
DATABASE_URL="postgresql://postgres:Km13nn07%21z%2A@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"
```

## Решение 7: Использовать Supabase CLI

Если ничего не помогает, используйте Supabase CLI для прямого подключения:

```bash
npm install -g supabase
supabase db push
```

